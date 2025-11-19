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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
    });
  }

  try {
    console.log('Starting checkout process...');
    
    // Fetch Stripe secret key from database
    const { data: stripeSettings, error: settingsError } = await supabase
      .from("stripe_settings")
      .select("secret_key")
      .single();

    if (settingsError || !stripeSettings?.secret_key) {
      console.error('Stripe not configured:', settingsError);
      return new Response(
        JSON.stringify({ error: "Stripe is not configured" }),
        { status: 500 }
      );
    }

    // Initialize Stripe with the fetched secret key
    const stripe = new Stripe(stripeSettings.secret_key, {
      apiVersion: "2023-10-16",
    });

    const requestBody = await req.json();
    console.log('Request body:', requestBody);
    
    const { productId, userId, priceId, customerEmail, frontendUrl, successUrl, cancelUrl } = requestBody;

    if (!priceId || !userId) {
      console.error('Missing required fields:', { priceId, userId });
      return new Response(
        JSON.stringify({ error: "Missing priceId or userId" }),
        { status: 400 }
      );
    }

    // Compute redirect URLs
    const baseUrl = frontendUrl || (successUrl || cancelUrl ? undefined : 'http://localhost:5173');
    const resolvedSuccessUrl = successUrl || `${baseUrl}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl = cancelUrl || `${baseUrl}/pricing`;

    // Create checkout session
    console.log('Creating Stripe session with:', {
      priceId,
      successUrl: resolvedSuccessUrl,
      cancelUrl: resolvedCancelUrl,
      userId,
      customerEmail
    });
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: resolvedSuccessUrl,
      cancel_url: resolvedCancelUrl,
      client_reference_id: userId,
      ...(customerEmail && { customer_email: customerEmail }),
      subscription_data: {
        metadata: {
          user_id: userId,
          product_id: productId,
          price_id: priceId,
        },
      },
    });
    
    console.log('Session created:', session.id);

    return new Response(JSON.stringify({ 
      sessionId: session.id,
      sessionUrl: session.url 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
