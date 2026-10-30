import { MEDUSA_BACKEND_URL } from "@/lib/medusa/config";

/** URL demo — vendor/admin seguono l’API; storefront = stesso origin in prod. */
const mercurBase = MEDUSA_BACKEND_URL.replace(/\/$/, "");
const isLocalApi =
  /localhost|127\.0\.0\.1/.test(mercurBase) || mercurBase.length === 0;

export const DEMO_URLS = {
  // In produzione (Vercel) resta sullo stesso dominio pubblico
  storefront: isLocalApi ? "http://localhost:3002" : "",
  vendor: `${mercurBase}/seller`,
  vendorRegister: `${mercurBase}/seller/register`,
  admin: `${mercurBase}/dashboard`,
} as const;
