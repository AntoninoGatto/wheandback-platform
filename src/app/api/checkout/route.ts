import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const { productId, quantity, locale, referralCode } = await req.json();

  // Anti-self-referral: buyer cannot use their own referral code
  const userReferralCode = user.user_metadata?.referral_code ?? "";
  const effectiveReferralCode =
    referralCode && referralCode !== userReferralCode
      ? referralCode
      : "WHEBACK-PLATFORM"; // platform default when no valid referrer

  const { data: product } = await supabase
    .from("products")
    .select("id, name, price, cashback_percent, images, slug, stock, seller_id")
    .eq("id", productId)
    .eq("status", "published")
    .single();

  if (!product) {
    return NextResponse.json({ error: "Prodotto non trovato" }, { status: 404 });
  }

  if (product.stock < quantity) {
    return NextResponse.json({ error: "Stock insufficiente" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    locale: locale as Stripe.Checkout.SessionCreateParams["locale"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: `Cashback: ${product.cashback_percent}% — Whe&Back®`,
            images: product.images?.length ? [product.images[0]] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      },
    ],
    metadata: {
      product_id: product.id,
      user_id: user.id,
      quantity: String(quantity),
      cashback_percent: String(product.cashback_percent),
      referral_code: effectiveReferralCode,
    },
    success_url: `${baseUrl}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/shop/${product.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
