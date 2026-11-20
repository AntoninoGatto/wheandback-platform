import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../modules/loyalty"
import { formatCaseNumber } from "../../../modules/loyalty/snapshot-text"

const TYPES = new Set(["assistance", "return", "withdrawal"])

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const caseNumber = typeof req.query.case === "string" ? req.query.case : ""
  if (!caseNumber) {
    res.status(400).json({ message: "Numero pratica mancante" })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const rows = await loyalty.listSupportCases({ case_number: caseNumber })
  const row = rows[0]
  if (!row) {
    res.status(404).json({ message: "Pratica non trovata" })
    return
  }
  res.json({
    case_number: row.case_number,
    status: row.status,
    case_type: row.case_type,
    created_at: row.created_at,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = (req.body || {}) as {
    email?: string
    order_id?: string
    case_type?: string
    message?: string
  }
  if (!body.email || !body.message || !body.case_type || !TYPES.has(body.case_type)) {
    res.status(400).json({ message: "Email, messaggio e tipo pratica sono obbligatori." })
    return
  }
  const loyalty = req.scope.resolve(LOYALTY_MODULE)
  const existing = await loyalty.listSupportCases({})
  const year = new Date().getFullYear()
  const created = await loyalty.createSupportCases({
    case_number: formatCaseNumber(year, existing.length + 1),
    email: body.email.trim(),
    order_id: body.order_id || null,
    case_type: body.case_type,
    status: "aperta",
    message: body.message.trim(),
  })
  res.status(201).json({
    case_number: created.case_number,
    status: created.status,
  })
}
