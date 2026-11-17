export type TransactionalEmail = {
  to: string
  subject: string
  text: string
}

export type EmailResult = { sent: boolean; provider: "resend" | "noop"; detail?: string }

/** Provider-agnostic hook. No-ops when Resend is not configured. */
export async function sendTransactionalEmail(
  email: TransactionalEmail,
  env: { RESEND_API_KEY?: string; RESEND_FROM?: string } = process.env,
  fetchImpl: typeof fetch = fetch
): Promise<EmailResult> {
  const key = env.RESEND_API_KEY
  const from = env.RESEND_FROM
  if (!key || !from || !email.to) {
    return { sent: false, provider: "noop", detail: "missing_provider" }
  }
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    }),
  })
  if (!response.ok) {
    return { sent: false, provider: "resend", detail: `http_${response.status}` }
  }
  return { sent: true, provider: "resend" }
}
