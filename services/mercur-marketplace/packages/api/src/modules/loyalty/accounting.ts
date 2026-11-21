export type InternalEntryType = "accrued" | "adjustment" | "committed" | "spent"

export type InternalEntry = { type: InternalEntryType; amount_cents: number }

export type InternalBalance = {
  accrued: number
  adjustments: number
  committed: number
  spent: number
  available: number
}

export function internalBalance(entries: InternalEntry[]): InternalBalance {
  const sum = (type: InternalEntryType) =>
    entries.filter((entry) => entry.type === type).reduce((total, entry) => total + entry.amount_cents, 0)
  const accrued = sum("accrued")
  const adjustments = sum("adjustment")
  const committed = sum("committed")
  const spent = sum("spent")
  return {
    accrued,
    adjustments,
    committed,
    spent,
    available: accrued + adjustments - committed - spent,
  }
}

export type AccountingMovement = {
  date: string
  order_id: string
  kind: "order" | "payment" | "fee" | "adjustment" | "reward"
  sku: string
  amount_cents: number
  currency: string
  beneficiary: string
  note: string
}

function cell(value: string | number): string {
  const text = String(value ?? "")
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

/** Monthly file for the accountant. No payouts are created from this export. */
export function toAccountingCsv(rows: AccountingMovement[]): string {
  const header = "date,order_id,kind,sku,amount_cents,currency,beneficiary,note"
  const body = rows.map((row) =>
    [row.date, row.order_id, row.kind, row.sku, row.amount_cents, row.currency, row.beneficiary, row.note]
      .map(cell)
      .join(",")
  )
  return [header, ...body].join("\n")
}
