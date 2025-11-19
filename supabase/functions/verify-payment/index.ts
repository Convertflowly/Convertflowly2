import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    const reqHeaders = req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization, x-client-info, apikey";
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": reqHeaders,
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    console.log('=== VERIFY PAYMENT ===');
    
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or userId" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Fetch Stripe secret key from database
    const { data: stripeSettings } = await supabase
      .from("stripe_settings")
      .select("secret_key")
      .single();

    if (!stripeSettings?.secret_key) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const stripe = new Stripe(stripeSettings.secret_key, {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session from Stripe
    console.log('Retrieving Stripe session:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'line_items']
    });

    console.log('Session status:', session.payment_status);
    console.log('Subscription:', session.subscription);

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ error: "Payment not completed" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    const subscription = session.subscription as any;
    if (!subscription) {
      return new Response(
        JSON.stringify({ error: "No subscription found" }),
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Get price ID and product ID from session (with robust fallbacks)
    let priceId: string | undefined = (session as any).line_items?.data?.[0]?.price?.id;
    let productId: string | undefined = (session as any).line_items?.data?.[0]?.price?.product;

    if (!priceId && (subscription?.items?.data?.length ?? 0) > 0) {
      try {
        priceId = subscription.items.data[0].price?.id;
        productId = subscription.items.data[0].price?.product;
        console.log('IDs from subscription.items:', { priceId, productId });
      } catch (_) { /* ignore */ }
    }
    if (!priceId || !productId) {
      try {
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 1 });
        const li = lineItems.data?.[0] as any;
        priceId = priceId || li?.price?.id;
        productId = productId || li?.price?.product;
        console.log('IDs from listLineItems:', { priceId, productId });
      } catch (e) {
        console.warn('Could not list line items:', e);
      }
    }
    // If productId is an expanded object, normalize to string id
    if (productId && typeof productId === 'object') {
      productId = (productId as any).id;
    }
    // As a last resort, fetch price to get product
    if (!productId && priceId) {
      try {
        const priceObj = await stripe.prices.retrieve(priceId);
        productId = (priceObj.product as any)?.id || (typeof priceObj.product === 'string' ? priceObj.product : undefined);
        console.log('Product ID from prices.retrieve:', productId);
      } catch (e) {
        console.warn('Could not retrieve price for product mapping:', e);
      }
    }
    console.log('Final IDs:', { priceId, productId });

    // Find product in database
    // Try to find product by priceId, then by productId
    let product: { id: string; price: number } | null = null;
    if (priceId) {
      const { data: byPrice } = await supabase
        .from("subscription_products")
        .select("id, price")
        .eq("stripe_price_id", priceId)
        .maybeSingle();
      if (byPrice) product = byPrice as any;
    }
    if (!product && productId) {
      const { data: byProduct } = await supabase
        .from("subscription_products")
        .select("id, price")
        .eq("stripe_product_id", productId)
        .maybeSingle();
      if (byProduct) product = byProduct as any;
    }

    if (!product) {
      // Final fallback: use subscription metadata product_id if provided during checkout
      const metaProductId = (subscription?.metadata as any)?.product_id as string | undefined;
      if (metaProductId) {
        const { data: byMeta } = await supabase
          .from("subscription_products")
          .select("id, price")
          .eq("id", metaProductId)
          .maybeSingle();
        if (byMeta) {
          product = byMeta as any;
        }
      }

      if (!product) {
        console.error('Mapping failed. IDs:', { priceId, productId, metaProductId: (subscription?.metadata as any)?.product_id });
        return new Response(
          JSON.stringify({ error: "Product not found for Stripe price/product", details: { priceId, productId, metaProductId: (subscription?.metadata as any)?.product_id } }),
          { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    console.log('Found product:', product.id);

    // Create or update subscription in database (avoid upsert without unique constraint)
    const { data: existingSub } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub?.id) {
      const { error: updateErr } = await supabase
        .from("user_subscriptions")
        .update({
          product_id: product.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingSub.id);

      if (updateErr) {
        console.error('Error updating subscription:', updateErr);
        return new Response(
          JSON.stringify({ error: updateErr.message }),
          { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }
    } else {
      const { error: insertErr } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          product_id: product.id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: session.customer,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: false,
        });

      if (insertErr) {
        console.error('Error inserting subscription:', insertErr);
        return new Response(
          JSON.stringify({ error: insertErr.message }),
          { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }
    }

    console.log('✅ Subscription saved successfully!');

    // Create order record
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        product_id: product.id,
        amount: product.price,
        currency: "USD",
        stripe_payment_intent_id: (session as any).payment_intent || null,
        status: "completed",
      });

    if (orderError) {
      console.error('Error creating order:', orderError);
    } else {
      console.log('✅ Order created');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Payment verified and subscription activated"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      }
    );
  } catch (error) {
    const message = (error as any)?.message || "Internal error";
    console.error("Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
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
