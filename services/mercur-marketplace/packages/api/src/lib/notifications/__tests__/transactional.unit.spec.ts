import { sendTransactionalEmail } from "../transactional"

describe("transactional email", () => {
  it("no-ops when Resend is not configured", async () => {
    const result = await sendTransactionalEmail(
      { to: "a@b.c", subject: "Ordine", text: "ok" },
      {}
    )
    expect(result).toEqual({ sent: false, provider: "noop", detail: "missing_provider" })
  })

  it("posts to Resend when configured", async () => {
    const fetchImpl = jest.fn(async () => ({ ok: true, status: 200 }) as Response)
    const result = await sendTransactionalEmail(
      { to: "a@b.c", subject: "Ordine", text: "ok" },
      { RESEND_API_KEY: "re_test", RESEND_FROM: "ordini@example.com" },
      fetchImpl
    )
    expect(result.sent).toBe(true)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
