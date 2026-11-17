import {
  accrualCents,
  accrualsReadyToUnlock,
  redeemQuote,
  summarize,
  type LedgerEntry,
} from "../domain"

const entry = (partial: Partial<LedgerEntry> & Pick<LedgerEntry, "id" | "type" | "amount_cents">): LedgerEntry => ({
  customer_id: "cus_1",
  idempotency_key: partial.id,
  created_at: "2026-01-01T00:00:00.000Z",
  ...partial,
})

describe("cashback ledger", () => {
  it("accrues 5% of the net amount", () => {
    expect(accrualCents(12200, 0.05)).toBe(500)
  })

  it("keeps credit pending until unlock and releases it once", () => {
    const accrual = entry({ id: "a1", type: "accrual_pending", amount_cents: 500 })
    expect(summarize([accrual])).toEqual({ pending: 500, available: 0, used: 0 })
    const withUnlock = [
      accrual,
      entry({ id: "u1", type: "unlock", amount_cents: 500, source_entry_id: "a1" }),
    ]
    expect(summarize(withUnlock)).toEqual({ pending: 0, available: 500, used: 0 })
    expect(
      accrualsReadyToUnlock(
        withUnlock,
        new Date("2026-02-01T00:00:00.000Z"),
        14
      )
    ).toEqual([])
  })

  it("cancels a pending accrual and redeems only available credit", () => {
    const accrual = entry({ id: "a1", type: "accrual_pending", amount_cents: 500 })
    const cancelled = [
      accrual,
      entry({ id: "c1", type: "cancel", amount_cents: 500, source_entry_id: "a1" }),
    ]
    expect(summarize(cancelled)).toEqual({ pending: 0, available: 0, used: 0 })
    const unlocked = [
      accrual,
      entry({ id: "u1", type: "unlock", amount_cents: 500, source_entry_id: "a1" }),
      entry({ id: "r1", type: "redeem", amount_cents: 200 }),
    ]
    expect(summarize(unlocked)).toEqual({ pending: 0, available: 300, used: 200 })
    expect(redeemQuote(300, 1000)).toBe(300)
    expect(redeemQuote(0, 100)).toBe(0)
  })

  it("selects accruals older than the lock window", () => {
    const oldEntry = entry({
      id: "old",
      type: "accrual_pending",
      amount_cents: 100,
      created_at: "2026-01-01T00:00:00.000Z",
    })
    const fresh = entry({
      id: "new",
      type: "accrual_pending",
      amount_cents: 100,
      created_at: "2026-01-20T00:00:00.000Z",
    })
    const ready = accrualsReadyToUnlock(
      [oldEntry, fresh],
      new Date("2026-01-20T00:00:00.000Z"),
      14
    )
    expect(ready.map((item) => item.id)).toEqual(["old"])
  })
})
