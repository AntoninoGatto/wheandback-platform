import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  SHIPPING_EXPRESS_CENTS,
  SHIPPING_STANDARD_CENTS,
  freeShippingThresholdCents,
} from "../lib/commerce/rules"

/**
 * Idempotent commerce bootstrap for Italy.
 * Placeholder shipping amounts (IVA inclusive):
 * - standard €5.90, included in the service when product gross >= SHIPPING_FREE_THRESHOLD_CENTS (default €49)
 * - express €9.90, never reduced by the threshold
 * Tax: IVA 22% on country IT. Prices in the catalog are treated as IVA-inclusive.
 * EU region is a placeholder (Austria) so a second region exists without stealing IT from an existing region.
 */
export default async function seedCommerceIt({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const regionService = container.resolve(Modules.REGION)
  const taxService = container.resolve(Modules.TAX)

  const regions = await regionService.listRegions({}, { relations: ["countries"] })
  const itRegion = regions.find((region: { countries?: { iso_2?: string }[] }) =>
    region.countries?.some((country) => country.iso_2 === "it")
  )

  if (!itRegion) {
    await regionService.createRegions({
      name: "Italia",
      currency_code: "eur",
      countries: ["it"],
      automatic_taxes: true,
    })
    logger.info("Created Italia region (EUR).")
  } else {
    logger.info(`Italia already covered by region ${itRegion.name || itRegion.id}.`)
  }

  const euRegion = regions.find(
    (region: { name?: string }) => region.name === "Europa (placeholder)"
  )
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

  logger.info(
    `Shipping placeholders: standard ${SHIPPING_STANDARD_CENTS} cents, express ${SHIPPING_EXPRESS_CENTS} cents, standard included above ${freeShippingThresholdCents()} product cents.`
  )
}
