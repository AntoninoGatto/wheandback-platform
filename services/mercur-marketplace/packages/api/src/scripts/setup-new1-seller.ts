import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  createSellerShippingOptionsWorkflow,
  createSellerShippingProfilesWorkflow,
  createSellerStockLocationsWorkflow,
} from "@mercurjs/core/workflows"
import {
  createLocationFulfillmentSetWorkflow,
  createServiceZonesWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Completes marketplace seller setup for "New1" so Offers can be created:
 * stock location + shipping profile + basic shipping option.
 */
export default async function setupNew1Seller({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const SELLER_ID = "sel_01KY2XB61SVYGSP2P2RCN9EESE"
  const SALES_CHANNEL_ID = "sc_01KX4JBSTYDTFTHACKMV9GW54N"

  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id", "name", "status"],
    filters: { id: SELLER_ID },
  })

  const seller = sellers[0]
  if (!seller) {
    throw new Error(`Seller ${SELLER_ID} not found`)
  }

  logger.info(`Setting up seller ${seller.name} (${seller.id}) status=${seller.status}`)

  // Link all published products to default sales channel (needed for storefront)
  const { data: publishedProducts } = await query.graph({
    entity: "product",
    fields: ["id", "title", "sales_channels.id"],
    filters: { status: "published" },
  })

  for (const product of publishedProducts) {
    const already = (product.sales_channels || []).some(
      (sc: { id: string }) => sc.id === SALES_CHANNEL_ID
    )
    if (already) continue
    try {
      await link.create({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: SALES_CHANNEL_ID },
      })
      logger.info(`Linked product ${product.title} to sales channel`)
    } catch (e) {
      logger.warn(
        `Could not link product ${product.id}: ${e instanceof Error ? e.message : String(e)}`
      )
    }
  }

  // Skip stock/shipping if seller already has a location
  const { data: existingLocLinks } = await query.graph({
    entity: "seller",
    fields: ["id", "stock_locations.id", "shipping_profiles.id"],
    filters: { id: SELLER_ID },
  })

  const existingLocations = existingLocLinks[0]?.stock_locations || []
  const existingProfiles = existingLocLinks[0]?.shipping_profiles || []

  if (existingLocations.length > 0 && existingProfiles.length > 0) {
    logger.info("Seller already has stock location and shipping profile. Done.")
    return
  }

  let stockLocationId = existingLocations[0]?.id as string | undefined

  if (!stockLocationId) {
    const { result: sellerStockLocations } =
      await createSellerStockLocationsWorkflow(container).run({
        input: {
          seller_id: SELLER_ID,
          locations: [
            {
              name: "New1 Warehouse",
              address: {
                city: "Milano",
                country_code: "IT",
                address_1: "Via Roma 1",
              },
            },
          ],
        },
      })
    stockLocationId = sellerStockLocations[0].id
    logger.info(`Created stock location ${stockLocationId}`)

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationId },
        [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
      })
    } catch {
      // may already exist
    }

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocationId,
        add: [SALES_CHANNEL_ID],
      },
    })

    await createLocationFulfillmentSetWorkflow(container).run({
      input: {
        location_id: stockLocationId,
        fulfillment_set_data: {
          name: "New1 delivery",
          type: "shipping",
        },
      },
    })
  }

  const {
    data: [locationWithSet],
  } = await query.graph({
    entity: "stock_location",
    fields: ["id", "fulfillment_sets.id"],
    filters: { id: stockLocationId },
  })
  const fulfillmentSetId = locationWithSet?.fulfillment_sets?.[0]?.id
  if (!fulfillmentSetId) {
    throw new Error("Fulfillment set missing for stock location")
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "countries.iso_2"],
  })
  const region = regions[0]
  const countries =
    region?.countries?.map((c: { iso_2: string }) => c.iso_2) || ["it", "de", "fr"]

  const { data: existingZones } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "service_zones.id", "service_zones.name"],
    filters: { id: fulfillmentSetId },
  })

  let serviceZoneId = existingZones[0]?.service_zones?.[0]?.id as string | undefined
  if (!serviceZoneId) {
    const { result: sellerServiceZones } = await createServiceZonesWorkflow(
      container
    ).run({
      input: {
        data: [
          {
            fulfillment_set_id: fulfillmentSetId,
            name: "Europe",
            geo_zones: countries.map((country_code: string) => ({
              country_code,
              type: "country" as const,
            })),
          },
        ],
      },
    })
    serviceZoneId = sellerServiceZones[0].id
  }

  let shippingProfileId = existingProfiles[0]?.id as string | undefined
  if (!shippingProfileId) {
    const { result: sellerShippingProfiles } =
      await createSellerShippingProfilesWorkflow(container).run({
        input: {
          seller_id: SELLER_ID,
          shipping_profiles: [{ name: "New1 Shipping", type: "default" }],
        },
      })
    shippingProfileId = sellerShippingProfiles[0].id
    logger.info(`Created shipping profile ${shippingProfileId}`)
  }

  try {
    await createSellerShippingOptionsWorkflow(container).run({
      input: {
        seller_id: SELLER_ID,
        shipping_options: [
          {
            name: "Standard Shipping",
            price_type: "flat",
            provider_id: "manual_manual",
            service_zone_id: serviceZoneId,
            shipping_profile_id: shippingProfileId,
            type: {
              label: "Standard",
              description: "Ship in 2-3 days.",
              code: "standard",
            },
            prices: [
              { currency_code: "eur", amount: 10 },
              ...(region ? [{ region_id: region.id, amount: 10 }] : []),
            ],
            rules: [
              { attribute: "enabled_in_store", value: "true", operator: "eq" },
              { attribute: "is_return", value: "false", operator: "eq" },
            ],
          },
        ],
      },
    })
    logger.info("Created standard shipping option")
  } catch (e) {
    logger.warn(
      `Shipping option create skipped/failed: ${e instanceof Error ? e.message : String(e)}`
    )
  }

  logger.info("New1 seller setup complete.")
}
