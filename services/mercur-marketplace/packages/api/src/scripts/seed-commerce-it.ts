import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"
import { createSellerShippingOptionsWorkflow } from "@mercurjs/core/workflows"
import {
  SHIPPING_EXPRESS_CENTS,
  SHIPPING_STANDARD_CENTS,
  ShippingMethod,
  freeShippingThresholdCents,
  italyShippingOptionPrices,
  shippingOptionKind,
} from "../lib/commerce/rules"

type RegionRow = {
  id: string
  name?: string
  currency_code?: string
  countries?: { iso_2?: string }[]
}

type ShippingOptionRow = {
  id: string
  name?: string | null
  price_type?: string | null
  service_zone_id?: string | null
  shipping_profile_id?: string | null
  type?: { code?: string | null } | null
}

const STORE_RULES = [
  { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
  { attribute: "is_return", value: "false", operator: "eq" as const },
]

/**
 * Idempotent commerce bootstrap for Italy.
 * Placeholder shipping amounts (IVA inclusive):
 * - standard €5.90, included in the service when product gross >= SHIPPING_FREE_THRESHOLD_CENTS (default €49)
 * - express €9.90, never reduced by the threshold
 * Tax: IVA 22% on country IT. Prices in the catalog are treated as IVA-inclusive.
 * EU region is a placeholder (Austria) so a second region exists without stealing IT from an existing region.
 *
 * IT is not moved out of an existing region. A country belongs to one region; the demo seed
 * puts IT inside "Europe" together with other countries, and that region already holds
 * region-scoped prices and the payment providers used by open carts.
 */
export default async function seedCommerceIt({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const regionService = container.resolve(Modules.REGION)
  const taxService = container.resolve(Modules.TAX)

  let regions = (await regionService.listRegions(
    {},
    { relations: ["countries"] }
  )) as RegionRow[]
  let itRegion = regions.find((region) =>
    region.countries?.some((country) => country.iso_2 === "it")
  )

  if (!itRegion) {
    await regionService.createRegions({
      name: "Italia",
      currency_code: "eur",
      countries: ["it"],
      automatic_taxes: true,
    })
    regions = (await regionService.listRegions(
      {},
      { relations: ["countries"] }
    )) as RegionRow[]
    itRegion = regions.find((region) =>
      region.countries?.some((country) => country.iso_2 === "it")
    )
    logger.info("Created Italia region (EUR, country it).")
  } else {
    const others = (itRegion.countries || [])
      .map((country) => country.iso_2)
      .filter((code): code is string => Boolean(code && code !== "it"))
    if (others.length) {
      logger.info(
        `IT stays in region "${itRegion.name || itRegion.id}" together with ${others.join(", ")}. A country can belong to only one region. Moving IT out would drop region-scoped prices and the payment providers already enabled on that region, including carts that still point at it. Shipping prices are written in EUR and on this region.`
      )
    } else {
      logger.info(`Italia already covered by region ${itRegion.name || itRegion.id}.`)
    }
  }

  const euRegion = regions.find((region) => region.name === "Europa (placeholder)")
  if (!euRegion) {
    const taken = new Set<string>()
    for (const region of regions) {
      for (const country of region.countries || []) {
        if (country.iso_2) taken.add(country.iso_2)
      }
    }
    if (!taken.has("at")) {
      await regionService.createRegions({
        name: "Europa (placeholder)",
        currency_code: "eur",
        countries: ["at"],
        automatic_taxes: false,
      })
      logger.info("Created Europa (placeholder) region with AT.")
    } else {
      logger.info("Skipped EU placeholder: AT is already assigned.")
    }
  }

  const taxRegions = await taxService.listTaxRegions({ country_code: "it" })
  let taxRegion = taxRegions[0]
  if (!taxRegion) {
    const created = await taxService.createTaxRegions({
      country_code: "it",
      provider_id: "tp_system",
    })
    taxRegion = Array.isArray(created) ? created[0] : created
    logger.info("Created IT tax region.")
  }

  const rates = await taxService.listTaxRates({ code: "it_vat_22" })
  if (!rates[0] && taxRegion?.id) {
    await taxService.createTaxRates({
      tax_region_id: taxRegion.id,
      code: "it_vat_22",
      name: "IVA 22%",
      rate: 22,
      is_default: true,
    })
    logger.info("Created IVA 22% default rate (prices are IVA-inclusive).")
  } else {
    logger.info("IVA 22% rate already present.")
  }

  const regionCurrency = (itRegion?.currency_code || "").toLowerCase()
  const eurRegionId = regionCurrency === "eur" ? itRegion?.id : undefined
  if (itRegion && regionCurrency !== "eur") {
    logger.info(
      `Region "${itRegion.name || itRegion.id}" currency is ${regionCurrency}. It is left unchanged. Only the EUR shipping price is written.`
    )
  }

  await upsertItalyShipping(container, query, logger, eurRegionId)
}

async function upsertItalyShipping(
  container: ExecArgs["container"],
  query: { graph: (args: Record<string, unknown>) => Promise<{ data: unknown[] }> },
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
  eurRegionId?: string
) {
  const thresholdCents = freeShippingThresholdCents()
  const { data } = await query.graph({
    entity: "shipping_option",
    fields: [
      "id",
      "name",
      "price_type",
      "service_zone_id",
      "shipping_profile_id",
      "type.code",
    ],
  })
  const options = data as ShippingOptionRow[]

  const updates: {
    id: string
    price_type: "flat"
    prices: ReturnType<typeof italyShippingOptionPrices>
  }[] = []
  const covered = new Set<string>()

  for (const option of options) {
    const kind = shippingOptionKind({
      name: option.name,
      typeCode: option.type?.code,
    })
    if (!kind || (option.price_type && option.price_type !== "flat")) continue
    updates.push({
      id: option.id,
      price_type: "flat",
      prices: italyShippingOptionPrices({ kind, regionId: eurRegionId, thresholdCents }),
    })
    if (option.service_zone_id) covered.add(`${option.service_zone_id}:${kind}`)
  }

  if (updates.length) {
    await updateShippingOptionsWorkflow(container).run({ input: updates })
    logger.info(`Updated ${updates.length} shipping options to the Italy placeholders.`)
  }

  const created = await createMissingSellerOptions(
    container,
    query,
    logger,
    eurRegionId,
    thresholdCents,
    covered
  )

  logger.info(
    `Shipping placeholders: standard ${SHIPPING_STANDARD_CENTS} cents (€${SHIPPING_STANDARD_CENTS / 100}), express ${SHIPPING_EXPRESS_CENTS} cents (€${SHIPPING_EXPRESS_CENTS / 100}). Standard amount is 0 when item_total >= ${thresholdCents / 100} (Medusa price rule, major units, same unit as amount). Updated ${updates.length}, created ${created}.`
  )
}

async function createMissingSellerOptions(
  container: ExecArgs["container"],
  query: { graph: (args: Record<string, unknown>) => Promise<{ data: unknown[] }> },
  logger: { info: (msg: string) => void; warn: (msg: string) => void },
  eurRegionId: string | undefined,
  thresholdCents: number,
  covered: Set<string>
) {
  const { data: sellerData } = await query.graph({
    entity: "seller",
    fields: ["id", "stock_locations.id", "shipping_profiles.id"],
  })
  const sellers = sellerData as {
    id: string
    stock_locations?: { id?: string | null }[] | null
    shipping_profiles?: { id?: string | null }[] | null
  }[]

  let created = 0
  for (const seller of sellers) {
    const profileId = seller.shipping_profiles?.find((profile) => profile?.id)?.id
    const locationIds = (seller.stock_locations || [])
      .map((location) => location?.id)
      .filter((id): id is string => Boolean(id))
    if (!profileId || !locationIds.length) continue

    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "fulfillment_sets.service_zones.id"],
      filters: { id: locationIds },
    })
    const zoneIds = new Set<string>()
    for (const location of locations as {
      fulfillment_sets?: { service_zones?: { id?: string | null }[] | null }[] | null
    }[]) {
      for (const set of location.fulfillment_sets || []) {
        for (const zone of set?.service_zones || []) {
          if (zone?.id) zoneIds.add(zone.id)
        }
      }
    }

    const zoneList = [...zoneIds]
    const pending: { zoneId: string; kind: ShippingMethod }[] = []
    for (const zoneId of zoneList) {
      for (const kind of ["standard", "express"] as const) {
        if (!covered.has(`${zoneId}:${kind}`)) pending.push({ zoneId, kind })
      }
    }
    if (!pending.length) continue

    try {
      await createSellerShippingOptionsWorkflow(container).run({
        input: {
          seller_id: seller.id,
          shipping_options: pending.map(({ zoneId, kind }) => ({
            name: kind === "standard" ? "Standard Shipping" : "Express Shipping",
            price_type: "flat" as const,
            provider_id: "manual_manual",
            service_zone_id: zoneId,
            shipping_profile_id: profileId,
            type: {
              label: kind === "standard" ? "Standard" : "Express",
              description:
                kind === "standard"
                  ? "Consegna standard. Inclusa nel servizio sopra la soglia prodotti."
                  : "Consegna express.",
              code: kind,
            },
            prices: italyShippingOptionPrices({
              kind,
              regionId: eurRegionId,
              thresholdCents,
            }),
            rules: STORE_RULES,
          })),
        },
      })
      for (const item of pending) covered.add(`${item.zoneId}:${item.kind}`)
      created += pending.length
      logger.info(
        `Created ${pending.map((item) => item.kind).join(", ")} shipping for seller ${seller.id}.`
      )
    } catch (error) {
      logger.warn(
        `Shipping option create skipped for seller ${seller.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  if (!created && covered.size === 0) {
    logger.warn(
      "No Standard/Express shipping option to update, and no seller with a service zone to create one."
    )
  }
  return created
}
