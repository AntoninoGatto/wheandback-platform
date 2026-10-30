import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

type OrderPlacedData = { id: string }

/**
 * Step 5: on order.placed → email cliente + notifica admin feed.
 * In locale (senza SendGrid) il provider local logga l'email; salviamo anche HTML in .medusa/emails/
 */
export default async function orderPlacedEmailHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderPlacedData>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notification = container.resolve(Modules.NOTIFICATION)

  const orderId = data.id

  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "email",
      "currency_code",
      "total",
      "summary.*",
      "items.title",
      "items.quantity",
      "items.unit_price",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.city",
      "shipping_address.country_code",
    ],
    filters: { id: orderId },
  })

  const order = (orders || [])[0] as
    | {
        id: string
        display_id?: number
        email?: string | null
        currency_code?: string
        total?: number
        items?: { title?: string; quantity?: number; unit_price?: number }[]
        shipping_address?: {
          first_name?: string
          last_name?: string
          city?: string
          country_code?: string
        } | null
      }
    | undefined

  if (!order) {
    logger.warn(`order-placed-email: order ${orderId} not found`)
    return
  }

  const to = (order.email || "").trim()
  const display = order.display_id != null ? `#${order.display_id}` : order.id
  const lines = (order.items || [])
    .map(
      (i) =>
        `• ${i.title || "Articolo"} × ${i.quantity ?? 1}` +
        (i.unit_price != null ? ` — € ${Number(i.unit_price).toFixed(2)}` : "")
    )
    .join("\n")

  const ship = order.shipping_address
  const shipLine = ship
    ? `${ship.first_name || ""} ${ship.last_name || ""}, ${ship.city || ""} (${(
        ship.country_code || ""
      ).toUpperCase()})`
    : "—"

  const subject = `Whe&Back — conferma ordine ${display}`
  const text = [
    `Grazie per il tuo ordine ${display}!`,
    "",
    "Articoli:",
    lines || "(nessuna riga)",
    "",
    order.total != null ? `Totale: € ${Number(order.total).toFixed(2)}` : "",
    `Spedizione a: ${shipLine}`,
    "",
    "Questo è un messaggio automatico di conferma (ambiente test/locale se senza SendGrid).",
  ]
    .filter(Boolean)
    .join("\n")

  const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;color:#253866">
  <h1>Ordine confermato ${display}</h1>
  <p>Grazie per aver scelto Whe&amp;Back.</p>
  <pre style="background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(
    lines || "(nessuna riga)"
  )}</pre>
  ${
    order.total != null
      ? `<p><strong>Totale:</strong> € ${Number(order.total).toFixed(2)}</p>`
      : ""
  }
  <p><strong>Spedizione:</strong> ${escapeHtml(shipLine)}</p>
  <p style="color:#666;font-size:12px">Email automatica — Step 5 pubblicazione.</p>
</body></html>`

  // Always persist a preview file (easy to open without an inbox).
  try {
    const dir = path.join(process.cwd(), ".medusa", "emails")
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `order-${order.id}.html`)
    fs.writeFileSync(file, html, "utf8")
    logger.info(`order-placed-email: wrote preview ${file}`)
  } catch (e) {
    logger.warn(
      `order-placed-email: could not write preview — ${
        e instanceof Error ? e.message : String(e)
      }`
    )
  }

  if (to) {
    await notification.createNotifications({
      to,
      channel: "email",
      template: "order-placed",
      data: {
        subject,
        html,
        text,
        order_id: order.id,
        display_id: order.display_id,
      },
    })
    logger.info(`order-placed-email: queued email to ${to}`)
  } else {
    logger.warn(`order-placed-email: order ${order.id} has no email`)
  }

  const opsEmail = (process.env.ORDER_NOTIFY_EMAIL || "").trim()
  if (opsEmail) {
    await notification.createNotifications({
      to: opsEmail,
      channel: "email",
      template: "order-placed-ops",
      data: {
        subject: `[Ops] Nuovo ordine ${display}`,
        html: `<p>Nuovo ordine <code>${order.id}</code> da ${escapeHtml(
          to || "sconosciuto"
        )}</p>${html}`,
        text: `Nuovo ordine ${display} — ${to}\n${text}`,
        order_id: order.id,
      },
    })
  }

  await notification.createNotifications({
    to: "",
    channel: "feed",
    template: "admin-ui",
    data: {
      title: "Nuovo ordine",
      description: `Ordine ${display}${to ? ` — ${to}` : ""}`,
    },
  })
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
