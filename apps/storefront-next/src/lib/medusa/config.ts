export const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

export const MEDUSA_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

/** ISO-2 country used to pick the Medusa region for cart and prices. */
export const DEFAULT_REGION_COUNTRY = (
  process.env.NEXT_PUBLIC_DEFAULT_REGION_COUNTRY || "it"
).toLowerCase();
