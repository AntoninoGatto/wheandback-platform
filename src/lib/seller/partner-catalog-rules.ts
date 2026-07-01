import {
  ALLOWED_CATEGORIES,
  BLACKLISTED_KEYWORDS,
  type CategoryId,
} from "@/constants/categories";
import { CASHBACK } from "@/constants/cashback";

export const MIN_PARTNER_SELL_PRICE_EUR = 3;

const ALLOWED_CATEGORY_IDS = new Set<string>(ALLOWED_CATEGORIES.map((c) => c.id));

export function isBlacklistedProductText(text: string): boolean {
  const lower = text.toLowerCase();
  return BLACKLISTED_KEYWORDS.some((kw) => lower.includes(kw));
}

export type PartnerProductInput = {
  name: string;
  description: string;
  category_id: string;
  price: number;
  purchase_price: number;
  cashback_percent: number;
  stock: number;
};

export type PartnerProductValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validatePartnerProduct(input: PartnerProductInput): PartnerProductValidationResult {
  const name = input.name.trim();
  const description = input.description.trim();

  if (name.length < 3) {
    return { ok: false, error: "Il nome prodotto deve avere almeno 3 caratteri." };
  }

  if (description.length < 20) {
    return { ok: false, error: "La descrizione deve avere almeno 20 caratteri." };
  }

  if (!ALLOWED_CATEGORY_IDS.has(input.category_id)) {
    return { ok: false, error: "Categoria non ammessa in Fase 1." };
  }

  if (isBlacklistedProductText(`${name} ${description}`)) {
    return {
      ok: false,
      error: "Prodotto non consentito: contiene termini o categorie escluse dal regolamento Whe&Back®.",
    };
  }

  if (!Number.isFinite(input.price) || input.price < MIN_PARTNER_SELL_PRICE_EUR) {
    return {
      ok: false,
      error: `Il prezzo di vendita minimo è €${MIN_PARTNER_SELL_PRICE_EUR.toFixed(2)}.`,
    };
  }

  if (!Number.isFinite(input.purchase_price) || input.purchase_price <= 0) {
    return { ok: false, error: "Inserisci un prezzo di acquisto valido." };
  }

  const maxPurchase = input.price * (CASHBACK.MIN_MARGIN_PERCENT / 100);
  if (input.purchase_price > maxPurchase + 0.001) {
    return {
      ok: false,
      error: `Il prezzo di acquisto (max €${maxPurchase.toFixed(2)}) non può superare il 50% del prezzo di vendita.`,
    };
  }

  if (
    input.cashback_percent < CASHBACK.MIN_PERCENT ||
    input.cashback_percent > CASHBACK.MAX_PERCENT
  ) {
    return {
      ok: false,
      error: `Il cashback deve essere tra ${CASHBACK.MIN_PERCENT}% e ${CASHBACK.MAX_PERCENT}%.`,
    };
  }

  if (!Number.isInteger(input.stock) || input.stock < 1) {
    return { ok: false, error: "Lo stock deve essere almeno 1 unità." };
  }

  return { ok: true };
}

export function isAllowedCategoryId(categoryId: string): categoryId is CategoryId {
  return ALLOWED_CATEGORY_IDS.has(categoryId);
}
