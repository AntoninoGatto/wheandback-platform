export type ImportRow = {
  sku?: string
  variant_id?: string
  supplier_id?: string
  price_list_source?: string
  price_list_date?: string
  supplier_cost_cents?: string
  reference_price_cents?: string
  reference_basis?: string
  vat_rate_bps?: string
  public_price_cents?: string
  reward_base_cents?: string
  min_margin_bps?: string
  compliance_status?: string
  image_rights?: string
  category?: string
  public_code?: string
  discount_bps?: string
  referral_bps_override?: string
  starts_at?: string
  ends_at?: string
}

export type ClassifiedRow = {
  row: ImportRow
  status: "draft"
  blocked: boolean
  reasons: string[]
}

const REQUIRED = [
  "sku",
  "variant_id",
  "supplier_id",
  "supplier_cost_cents",
  "reference_price_cents",
  "reference_basis",
  "vat_rate_bps",
  "public_price_cents",
  "reward_base_cents",
  "min_margin_bps",
  "compliance_status",
] as const

const BANNED = [/veterinar/i, /veterinary/i, /antiparassitar/i, /antiparasitic/i, /rodenticid/i]

export function isBannedCategory(category: string | undefined): boolean {
  const value = (category || "").trim()
  if (!value) return false
  return BANNED.some((pattern) => pattern.test(value))
}

export function parseCsv(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
  if (!lines.length) return []
  const headers = splitCsvLine(lines[0]).map((cell) => cell.trim())
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row: ImportRow = {}
    headers.forEach((header, index) => {
      ;(row as Record<string, string>)[header] = (cells[index] || "").trim()
    })
    return row
  })
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let current = ""
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"'
        i++
      } else quoted = !quoted
    } else if (char === "," && !quoted) {
      cells.push(current)
      current = ""
    } else current += char
  }
  cells.push(current)
  return cells
}

export function classifyImportRow(row: ImportRow): ClassifiedRow {
  const reasons: string[] = []
  for (const field of REQUIRED) {
    if (!String(row[field] ?? "").trim()) reasons.push(`manca ${field}`)
  }
  if ((row.compliance_status || "").trim().toLowerCase() !== "ok") {
    reasons.push("compliance mancante")
  }
  if (isBannedCategory(row.category)) reasons.push("categoria non ammessa")
  const basis = (row.reference_basis || "").trim()
  if (basis && basis !== "net" && basis !== "gross") reasons.push("reference_basis non valida")
  return { row, status: "draft", blocked: reasons.length > 0, reasons }
}

export function classifyImport(text: string): ClassifiedRow[] {
  return parseCsv(text).map(classifyImportRow)
}
