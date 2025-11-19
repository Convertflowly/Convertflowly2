import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });
  }

  try {
    const body = await req.json();
    const userId = body?.userId;
    
    console.log("=== SYNCING STRIPE SUBSCRIPTIONS ===");
    if (userId) {
      console.log(`Syncing for specific user: ${userId}`);
    }
    
    // Fetch Stripe secret key from database
    const { data: stripeSettings, error: settingsError } = await supabase
      .from("stripe_settings")
      .select("secret_key")
      .single();

    if (settingsError || !stripeSettings?.secret_key) {
      console.error("Stripe not configured:", settingsError);
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey" }
        }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeSettings.secret_key, {
      apiVersion: "2023-10-16",
    });

    // If userId provided, get their email and search for their payments
    if (userId) {
      console.log("Checking for user payments in Stripe...");
      
      // Get user email (profile first, then auth as fallback)
      let userEmail: string | null = null;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", userId)
        .single();
      userEmail = profile?.email || null;

      if (!userEmail) {
        try {
          const { data: userResult, error: adminErr } = await supabase.auth.admin.getUserById(userId);
          if (!adminErr) {
            userEmail = userResult?.user?.email ?? null;
          }
        } catch (_) {
          // ignore
        }
      }

      if (!userEmail) {
        console.log("User email not found in profile or auth");
        return new Response(
          JSON.stringify({ synced: false, message: "User email not found" }),
          { 
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey" }
          }
        );
      }

      console.log(`Searching Stripe for customer with email: ${userEmail}`);

      // Search for customer by email
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });

      if (customers.data.length === 0) {
        console.log("No Stripe customer found for this email");
        return new Response(
          JSON.stringify({ synced: false, message: "No Stripe customer found" }),
          { 
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey" }
          }
        );
      }

      const customerId = customers.data[0].id;
      console.log(`Found customer: ${customerId}`);

      // Get their subscriptions
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10
      });

      console.log(`Found ${subscriptions.data.length} active subscriptions`);

      if (subscriptions.data.length > 0) {
        // Sync the first active subscription
        const subscription = subscriptions.data[0];
        const lineItems = subscription.items.data[0];
        const priceId = lineItems.price.id;

        // Find product in database
        const { data: product } = await supabase
          .from("subscription_products")
          .select("id, price")
          .eq("stripe_price_id", priceId)
          .single();

        if (product) {
          // Create/update subscription
          const { error: upsertError } = await supabase
            .from("user_subscriptions")
            .upsert({
              user_id: userId,
              product_id: product.id,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: customerId,
              status: "active",
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
            }, {
              onConflict: "user_id,stripe_subscription_id"
            });

          if (!upsertError) {
            console.log("✅ Subscription synced successfully");
            return new Response(
              JSON.stringify({ synced: true, message: "Subscription activated" }),
              { 
                status: 200,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey" }
              }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ synced: false, message: "No active subscriptions found" }),
        { 
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey" }
        }
      );
    }

    // Original behavior: sync all subscriptions
    console.log("Fetching all active subscriptions from Stripe...");

    // Fetch all active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      status: "active",
      limit: 100, // Adjust if you have more than 100 subscriptions
    });

    console.log(`Found ${subscriptions.data.length} active subscriptions in Stripe`);

    let synced = 0;
    let failed = 0;
    const results = [];

    // Process each subscription
    for (const subscription of subscriptions.data) {
      try {
        const userId = subscription.metadata?.user_id;
        
        if (!userId) {
          console.warn(`Subscription ${subscription.id} has no user_id in metadata, skipping`);
          failed++;
          results.push({
            subscription_id: subscription.id,
            status: "skipped",
            reason: "No user_id in metadata"
          });
          continue;
        }

        // Get product/price info
        const lineItems = subscription.items.data[0];
        const priceId = lineItems.price.id;

        // Find product_id from our database using price_id
        const { data: product, error: productError } = await supabase
          .from("subscription_products")
          .select("id, price")
          .eq("stripe_price_id", priceId)
          .single();

        if (productError || !product) {
          console.warn(`Product not found for price_id ${priceId}, skipping subscription ${subscription.id}`);
          failed++;
          results.push({
            subscription_id: subscription.id,
            status: "failed",
            reason: `Product not found for price_id: ${priceId}`
          });
          continue;
        }

        // Upsert subscription record
        const { error: upsertError } = await supabase
          .from("user_subscriptions")
          .upsert({
            user_id: userId,
            product_id: product.id,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (upsertError) {
          console.error(`Error upserting subscription for user ${userId}:`, upsertError);
          failed++;
          results.push({
            subscription_id: subscription.id,
            user_id: userId,
            status: "failed",
            reason: upsertError.message
          });
          continue;
        }

        // Check if order already exists
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id")
          .eq("stripe_charge_id", subscription.id)
          .single();

        // Create order record if it doesn't exist
        if (!existingOrder) {
          const { error: orderError } = await supabase
            .from("orders")
            .insert({
              user_id: userId,
              product_id: product.id,
              amount: product.price,
              currency: "USD",
              stripe_charge_id: subscription.id,
              status: "completed",
            });

          if (orderError) {
            console.warn(`Error creating order for subscription ${subscription.id}:`, orderError);
          }
        }

        console.log(`✅ Synced subscription for user ${userId}`);
        synced++;
        results.push({
          subscription_id: subscription.id,
          user_id: userId,
          status: "synced"
        });

      } catch (err) {
        console.error(`Error processing subscription ${subscription.id}:`, err);
        failed++;
        results.push({
          subscription_id: subscription.id,
          status: "error",
          reason: err.message
        });
      }
    }

    const response = {
      success: true,
      message: `Sync complete: ${synced} synced, ${failed} failed`,
      total: subscriptions.data.length,
      synced,
      failed,
      results
    };

    console.log("=== SYNC COMPLETE ===");
    console.log(JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Sync failed" 
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      }
    );
  }
});
