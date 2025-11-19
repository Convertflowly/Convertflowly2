import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get Stripe keys from database
    const { data: stripeSettings } = await supabaseClient
      .from('stripe_settings')
      .select('secret_key')
      .single()

    if (!stripeSettings?.secret_key) {
      throw new Error('Stripe not configured')
    }

    const stripe = new Stripe(stripeSettings.secret_key, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { action, name, description, price, billing_period, stripeProductId, stripePriceId } = await req.json()

    if (action === 'create') {
      // Create product in Stripe
      const product = await stripe.products.create({
        name: name,
        description: description || '',
      })

      // Create price in Stripe
      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(price * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: billing_period === 'yearly' ? 'year' : 'month',
        },
      })

      return new Response(
        JSON.stringify({
          stripeProductId: product.id,
          stripePriceId: stripePrice.id,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else if (action === 'update') {
      // Update product in Stripe
      if (stripeProductId) {
        await stripe.products.update(stripeProductId, {
          name: name,
          description: description || '',
        })

        // Create new price (Stripe doesn't allow updating prices)
        const stripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: Math.round(price * 100),
          currency: 'usd',
          recurring: {
            interval: billing_period === 'yearly' ? 'year' : 'month',
          },
        })

        // Deactivate old price
        if (stripePriceId) {
          await stripe.prices.update(stripePriceId, { active: false })
        }

        return new Response(
          JSON.stringify({
            stripeProductId: stripeProductId,
            stripePriceId: stripePrice.id,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      }
    } else if (action === 'delete') {
      // Archive product in Stripe
      if (stripeProductId) {
        await stripe.products.update(stripeProductId, { active: false })
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
