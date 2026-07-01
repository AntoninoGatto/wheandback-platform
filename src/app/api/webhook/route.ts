import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { product_id, user_id, quantity, cashback_percent } = session.metadata!;

    const supabase = await createAdminClient();

    // Decrement stock
    const { data: product } = await supabase
      .from("products")
      .select("stock, price")
      .eq("id", product_id)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock: product.stock - parseInt(quantity) })
        .eq("id", product_id);

      // Create order
      const { data: order } = await supabase
        .from("orders")
        .insert({
          user_id,
          status: "paid",
          total_amount: (session.amount_total ?? 0) / 100,
          stripe_session_id: session.id,
        })
        .select("id")
        .single();

      if (order) {
        // Create order item
        await supabase.from("order_items").insert({
          order_id: order.id,
          product_id,
          quantity: parseInt(quantity),
          unit_price: product.price,
        });

        // Create pending cashback transaction
        const cashbackAmount = (product.price * parseInt(quantity) * parseFloat(cashback_percent)) / 100;
        await supabase.from("cashback_transactions").insert({
          user_id,
          order_id: order.id,
          amount: cashbackAmount,
          status: "pending",
          type: "purchase",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
