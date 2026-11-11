import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createOffersWorkflow,
  createProductsWorkflow,
} from "@mercurjs/core/workflows"
import { ensureProductStoreVisibility } from "../workflows/hooks/utils/ensure-product-store-visibility"

/**
 * Step 2 catalog: ensure ≥10 published products visible on the storefront.
 *
 *   npx medusa exec ./src/scripts/seed-step2-catalog.ts
 *
 * Demo SKUs only — replace with real supplier products when shortlist is ready.
 */

const CATALOG: Array<{
  title: string
  handle: string
  description: string
  sku: string
  priceEur: number
  weight: number
  image: string
}> = [
  {
    title: "Bottiglia termica inox 500 ml",
    handle: "wb-bottiglia-termica-500",
    description:
      "Bottiglia in acciaio inox a doppia parete, mantiene caldo o freddo per ore. Ideale per sport e ufficio. Capacità 500 ml, senza BPA.",
    sku: "WB-BOTTLE-500",
    priceEur: 24.9,
    weight: 350,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
  },
  {
    title: "Asciugamano cotone organico",
    handle: "wb-asciugamano-cotone",
    description:
      "Asciugamano in cotone organico, morbido e assorbente. Misura bagno standard. Lavabile in lavatrice a 40°C.",
    sku: "WB-TOWEL-ORG",
    priceEur: 19.9,
    weight: 400,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
  },
  {
    title: "Set posate in bamboo (4 pezzi)",
    handle: "wb-posate-bamboo",
    description:
      "Set da viaggio: forchetta, coltello, cucchiaio e stecchino in bamboo naturale. Custodia in tessuto inclusa. Riusabile e leggero.",
    sku: "WB-BAMBOO-CUTLERY",
    priceEur: 12.5,
    weight: 120,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
  },
  {
    title: "Cuscino memory foam da viaggio",
    handle: "wb-cuscino-viaggio",
    description:
      "Cuscino cervicale in memory foam con fodera sfoderabile. Compatto per aereo e auto. Supporto ergonomico per il collo.",
    sku: "WB-PILLOW-TRAVEL",
    priceEur: 29.9,
    weight: 300,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
  },
  {
    title: "Lampada LED da scrivania",
    handle: "wb-lampada-led-scrivania",
    description:
      "Lampada LED regolabile con tre temperature di colore. Braccio flessibile, base stabile. Alimentazione USB. Ideale per studio e smart working.",
    sku: "WB-LED-DESK",
    priceEur: 34.9,
    weight: 600,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
  },
  {
    title: "Tappetino yoga antiscivolo",
    handle: "wb-tappetino-yoga",
    description:
      "Tappetino yoga in TPE antiscivolo, spessore 6 mm. Dimensioni standard, leggero da trasportare. Facile da pulire.",
    sku: "WB-YOGA-MAT",
    priceEur: 27.9,
    weight: 900,
    image:
      "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
  },
]

export default async function seedStep2Catalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: [
      "id",
      "name",
      "status",
      "stock_locations.id",
      "shipping_profiles.id",
      "members.id",
      "members.email",
    ],
  })

  const seller = (sellers || []).find((s) => {
    const row = s as {
      status?: string | null
      stock_locations?: unknown[] | null
      shipping_profiles?: unknown[] | null
      members?: unknown[] | null
    }
    return (
      (row.status === "open" || row.status === "active") &&
      (row.stock_locations?.length ?? 0) > 0 &&
      (row.shipping_profiles?.length ?? 0) > 0 &&
      (row.members?.length ?? 0) > 0
    )
  }) as
    | {
        id: string
        name: string
        stock_locations: { id: string }[]
        shipping_profiles: { id: string }[]
        members: { id: string; email?: string }[]
      }
    | undefined

  if (!seller) {
    throw new Error(
      "Nessun seller attivo con stock location + shipping profile + member. Esegui seed / setup-new1-seller prima."
    )
  }

  const memberId = seller.members[0].id
  const locationId = seller.stock_locations[0].id
  const shippingProfileId = seller.shipping_profiles[0].id

  logger.info(
    `Using seller ${seller.name} (${seller.id}) member=${memberId}`
  )

  const { data: existing } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status"],
    filters: { handle: CATALOG.map((p) => p.handle) },
  })

  const existingHandles = new Set(
    ((existing || []) as { handle: string }[]).map((p) => p.handle)
  )
  const toCreate = CATALOG.filter((p) => !existingHandles.has(p.handle))

  if (toCreate.length) {
    logger.info(`Creating ${toCreate.length} Step 2 product(s)…`)
    await createProductsWorkflow(container).run({
      input: {
        created_by: memberId,
        products: toCreate.map((p) => ({
          title: p.title,
          handle: p.handle,
          description: p.description,
          weight: p.weight,
          status: ProductStatus.PUBLISHED,
          seller_ids: [seller.id],
          images: [{ url: p.image }],
          attributes: [
            { title: "Default", values: ["Standard"], is_variant_axis: true },
          ],
          variants: [
            {
              title: "Standard",
              sku: p.sku,
              options: { Default: "Standard" },
              manage_inventory: false,
            },
          ],
        })),
      },
    })
  } else {
    logger.info("Step 2 catalog products already exist.")
  }

  // Re-query catalog products + create missing offers (idempotent-ish by offer sku).
  const { data: catalogRows } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "handle",
      "variants.id",
      "variants.sku",
      "variants.offers.id",
      "variants.offers.sku",
    ],
    filters: { handle: CATALOG.map((p) => p.handle) },
  })

  const catalogProducts = (catalogRows || []) as {
    id: string
    handle: string
    variants?: {
      id: string
      sku?: string | null
      offers?: { id: string; sku?: string | null }[] | null
    }[]
  }[]

  const handleToPrice = Object.fromEntries(
    CATALOG.map((p) => [p.handle, p.priceEur])
  )

  const offers = catalogProducts.flatMap((product) =>
    (product.variants || [])
      .filter((variant) => !(variant.offers && variant.offers.length > 0))
      .map((variant) => ({
        seller_id: seller.id,
        created_by: memberId,
        sku: `OFFER-${variant.sku || product.handle}`,
        variant_id: variant.id,
        shipping_profile_id: shippingProfileId,
        inventory_items: [
          {
            sku: `OFFER-${variant.sku || product.handle}`,
            stock_levels: [
              {
                location_id: locationId,
                stocked_quantity: 100,
              },
            ],
          },
        ],
        prices: [
          {
            amount: handleToPrice[product.handle] ?? 19.9,
            currency_code: "eur",
          },
        ],
      }))
  )

  if (offers.length) {
    await createOffersWorkflow(container).run({ input: { offers } })
    logger.info(`Created ${offers.length} offer(s).`)
  } else {
    logger.info("All catalog variants already have offers.")
  }

  await ensureProductStoreVisibility(container, {
    productIds: catalogProducts.map((p) => p.id),
    sellerIdsByProductId: Object.fromEntries(
      catalogProducts.map((p) => [p.id, [seller.id]])
    ),
  })

  const { data: published } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
    filters: { status: "published" },
  })

  logger.info(
    `Step 2 done. Published products now: ${(published || []).length}`
  )
}
