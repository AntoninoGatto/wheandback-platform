import { MEDUSA_BACKEND_URL } from "@/lib/medusa/config";

/** URL demo locale — un solo posto per sito / vendor / admin. */
const mercurBase = MEDUSA_BACKEND_URL.replace(/\/$/, "");

export const DEMO_URLS = {
  storefront: "http://localhost:3002",
  vendor: `${mercurBase}/seller`,
  vendorRegister: `${mercurBase}/seller/register`,
  admin: `${mercurBase}/dashboard`,
} as const;
