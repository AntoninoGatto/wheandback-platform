import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from "./config";

type MedusaRequestInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string | undefined>;
};

export class MedusaError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "MedusaError";
    this.status = status;
    this.body = body;
  }
}

export async function medusaFetch<T>(path: string, init: MedusaRequestInit = {}): Promise<T> {
  const url = `${MEDUSA_BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  if (!MEDUSA_PUBLISHABLE_KEY) {
    throw new MedusaError(
      "Missing NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY. Create apps/storefront-next/.env.local and restart the storefront.",
      0
    );
  }

  const headers: Record<string, string> = {
    "x-publishable-api-key": MEDUSA_PUBLISHABLE_KEY,
  };

  for (const [key, value] of Object.entries(init.headers ?? {})) {
    if (value !== undefined) headers[key] = value;
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await res.json().catch(() => undefined)
    : await res.text();

  if (!res.ok) {
    const message =
      typeof body === "object" && body && "message" in body
        ? String((body as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new MedusaError(message, res.status, body);
  }

  return body as T;
}
