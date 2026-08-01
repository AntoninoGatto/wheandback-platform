import type {
  LinkDefinition,
  MedusaContainer,
} from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  confirmProductsWorkflow,
  createOffersWorkflow,
  createProductsWorkflow,
} from "@mercurjs/core/workflows"
import { ensureProductStoreVisibility } from "./utils/ensure-product-store-visibility"

/**
 * Auto-link products to their selling seller + sales channels so they appear
 * on Store `/store/products` (Mercur filters by `product_seller`).
 *
 * Note: `@mercurjs/core` types `createProductsWorkflow` hooks as `unknown[]`,
 * but the runtime exposes `validate` / `productsCreated` (Mercur docs).
 */

type CreateProductsHooks = {
  validate: (
    handler: (
      input: {
        input: {
          products: { seller_ids?: string[] }[]
          created_by: string
        }
        products: { seller_ids?: string[] }[]
      },
      context: { container: MedusaContainer }
    ) => Promise<void>
  ) => void
  productsCreated: (
    handler: (
      input: {
        products: { id: string }[]
        additional_data?: Record<string, unknown>
      },
      context: { container: MedusaContainer }
    ) => Promise<StepResponse<LinkDefinition[], LinkDefinition[]>>,
    compensate?: (
      links: LinkDefinition[] | undefined,
      context: { container: MedusaContainer }
    ) => Promise<void>
  ) => void
}

const createProductsHooks = createProductsWorkflow.hooks as CreateProductsHooks

/**
 * Vendor `POST /vendor/products` sets `created_by` but not `seller_ids`.
 * Inject the creator into `seller_ids` so Mercur's built-in associate step
 * creates the `product_seller` link.
 */
createProductsHooks.validate(async ({ input }, { container }) => {
  const createdBy = input.created_by
  if (!createdBy) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id"],
    filters: { id: createdBy },
  })

  if (!sellers?.length) {
    return
  }

  for (const product of input.products) {
    const ids = new Set(product.seller_ids ?? [])
    ids.add(createdBy)
    product.seller_ids = [...ids]
  }
})

createProductsHooks.productsCreated(
  async ({ products }, { container }) => {
    const links = await ensureProductStoreVisibility(container, {
      productIds: products.map((p) => p.id),
    })
    return new StepResponse(links, links)
  },
  async (links, { container }) => {
    await dismissLinks(container, links)
  }
)

confirmProductsWorkflow.hooks.productsConfirmed(
  async ({ product_ids }, { container }) => {
    const links = await ensureProductStoreVisibility(container, {
      productIds: product_ids,
    })
    return new StepResponse(links, links)
  },
  async (links, { container }) => {
    await dismissLinks(container, links)
  }
)

createOffersWorkflow.hooks.offersCreated(
  async ({ offers }, { container }) => {
    const sellerIdsByProductId: Record<string, string[]> = {}
    for (const offer of offers) {
      if (!offer.product_id || !offer.seller_id) {
        continue
      }
      const list = sellerIdsByProductId[offer.product_id] || []
      list.push(offer.seller_id)
      sellerIdsByProductId[offer.product_id] = list
    }

    const links = await ensureProductStoreVisibility(container, {
      productIds: Object.keys(sellerIdsByProductId),
      sellerIdsByProductId,
    })
    return new StepResponse(links, links)
  },
  async (links, { container }) => {
    await dismissLinks(container, links)
  }
)

async function dismissLinks(
  container: MedusaContainer,
  links: LinkDefinition[] | undefined
) {
  if (!links?.length) {
    return
  }
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  await link.dismiss(links)
}
