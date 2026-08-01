import { MEDUSA_BACKEND_URL } from "./config";

export type CustomerAuthResponse = {
  token: string;
};

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${MEDUSA_BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => undefined);

  if (!res.ok) {
    const message =
      json && typeof json === "object" && "message" in json
        ? String((json as { message: unknown }).message)
        : `HTTP ${res.status}`;
    throw new Error(message);
  }

  return json as T;
}

export async function registerCustomer(email: string, password: string) {
  return authFetch<CustomerAuthResponse>("/auth/customer/emailpass/register", {
    email,
    password,
  });
}

export async function loginCustomer(email: string, password: string) {
  return authFetch<CustomerAuthResponse>("/auth/customer/emailpass", {
    email,
    password,
  });
}
