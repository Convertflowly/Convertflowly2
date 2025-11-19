import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();

  try {
    console.log('=== STRIPE WEBHOOK RECEIVED ===');
    
    // Fetch Stripe secret key from database
    const { data: stripeSettings, error: settingsError } = await supabase
      .from("stripe_settings")
      .select("secret_key")
      .single();

    if (settingsError || !stripeSettings?.secret_key) {
      console.error("Stripe not configured:", settingsError);
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { status: 500 }
      );
    }

    // Initialize Stripe with the fetched secret key
    const stripe = new Stripe(stripeSettings.secret_key, {
      apiVersion: "2023-10-16",
    });

    const event = JSON.parse(body);

    console.log("Webhook event type:", event.type);
    console.log("Event ID:", event.id);

    // Handle subscription created/updated
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object as any;
      const userId = subscription.metadata?.user_id;

      console.log("Processing subscription event");
      console.log("Subscription ID:", subscription.id);
      console.log("User ID from metadata:", userId);
      console.log("Subscription status:", subscription.status);

      if (!userId) {
        console.error("No user_id in subscription metadata!");
        return new Response(JSON.stringify({ error: "No user_id in metadata" }), { status: 400 });
      }

      // Get product/price info
      const lineItems = subscription.items.data[0];
      const priceId = lineItems.price.id;
      const amount = lineItems.price.unit_amount / 100; // Convert from cents to dollars
      
      console.log("Price ID:", priceId);
      console.log("Amount:", amount);
      
      // Find product_id from our database using price_id
      const { data: product, error: productError } = await supabase
        .from("subscription_products")
        .select("id, price")
        .eq("stripe_price_id", priceId)
        .single();

      if (productError || !product) {
        console.error("Product not found for price_id:", priceId, productError);
        return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });
      }

      console.log("Found product:", product.id);

      // Upsert subscription record
      const { error: upsertError } = await supabase.from("user_subscriptions").upsert({
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
        console.error("Error upserting subscription:", upsertError);
        return new Response(JSON.stringify({ error: upsertError.message }), { status: 500 });
      }

      console.log("✅ Subscription saved successfully for user:", userId);

      // Create order record for revenue tracking (only on new subscription)
      if (event.type === "customer.subscription.created") {
        const { error: orderError } = await supabase.from("orders").insert({
          user_id: userId,
          product_id: product.id,
          amount: product.price,
          currency: "USD",
          stripe_charge_id: subscription.id,
          status: "completed",
        });
        
        if (orderError) {
          console.error("Error creating order:", orderError);
        } else {
          console.log("✅ Order created for revenue tracking");
        }
      }
    }

    // Handle subscription deleted
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as any;
      
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", subscription.id);

      console.log("Subscription cancelled:", subscription.id);
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook error" }),
      { status: 400 }
    );
  }
});
