import type { LinkDefinition, MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  MercurModules,
  ProductChangeActionType,
} from "@mercurjs/types"

type EnsureInput = {
  productIds: string[]
  /** Explicit seller ids per product (e.g. from offer create). */
  sellerIdsByProductId?: Record<string, string[]>
}

type ProductVisibilityRow = {
  id: string
  sellers?: { id: string }[] | null
  sales_channels?: { id: string }[] | null
}

/**
 * Mercur Store `/store/products` filters via `product_seller` for open sellers.
 * Vendor create does not auto-assign the creator, so products stay invisible
 * until we link them. Also ensure default sales-channel membership.
 */
export async function ensureProductStoreVisibility(
  container: MedusaContainer,
  { productIds, sellerIdsByProductId = {} }: EnsureInput
): Promise<LinkDefinition[]> {
  const uniqueIds = [...new Set(productIds.filter(Boolean))]
  if (!uniqueIds.length) {
    return []
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "sellers.id", "sales_channels.id"],
    filters: { id: uniqueIds },
  })

  const productRows = (products || []) as ProductVisibilityRow[]
  if (!productRows.length) {
    return []
  }

  const sellerIdsNeeded = await resolveSellerIdsForProducts(container, {
    products: productRows,
    sellerIdsByProductId,
  })

  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "is_disabled"],
    filters: { is_disabled: false },
  })
  const salesChannelIds = ((salesChannels || []) as { id: string }[]).map(
    (sc) => sc.id
  )

  const linksToCreate: LinkDefinition[] = []

  for (const product of productRows) {
    const existingSellerIds = new Set(
      (product.sellers || []).map((s) => s.id)
    )
    for (const sellerId of sellerIdsNeeded[product.id] || []) {
      if (existingSellerIds.has(sellerId)) {
        continue
      }
      linksToCreate.push({
        [Modules.PRODUCT]: { product_id: product.id },
        [MercurModules.SELLER]: { seller_id: sellerId },
      })
      existingSellerIds.add(sellerId)
    }

    const existingChannelIds = new Set(
      (product.sales_channels || []).map((sc) => sc.id)
    )
    for (const salesChannelId of salesChannelIds) {
      if (existingChannelIds.has(salesChannelId)) {
        continue
      }
      linksToCreate.push({
        [Modules.PRODUCT]: { product_id: product.id },
        [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannelId },
      })
      existingChannelIds.add(salesChannelId)
    }
  }

  if (!linksToCreate.length) {
    return []
  }

  await link.create(linksToCreate)
  logger.info(
    `Ensured store visibility links for ${productRows.length} product(s) (${linksToCreate.length} link(s))`
  )
  return linksToCreate
}

async function resolveSellerIdsForProducts(
  container: MedusaContainer,
  {
    products,
    sellerIdsByProductId,
  }: {
    products: ProductVisibilityRow[]
    sellerIdsByProductId: Record<string, string[]>
  }
): Promise<Record<string, string[]>> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const result: Record<string, string[]> = {}

  for (const product of products) {
    result[product.id] = [
      ...new Set(sellerIdsByProductId[product.id] || []),
    ]
  }

  const missingCreatorLookup = products
    .filter((p) => !(sellerIdsByProductId[p.id]?.length))
    .map((p) => p.id)

  if (missingCreatorLookup.length) {
    const { data: changes } = await query.graph({
      entity: "product_change",
      fields: ["id", "product_id", "created_by", "actions.action"],
      filters: { product_id: missingCreatorLookup },
    })

    const candidateSellerIds = new Set<string>()
    const creatorByProduct = new Map<string, string>()

    for (const change of (changes || []) as {
      product_id?: string
      created_by?: string | null
      actions?: { action?: string }[] | null
    }[]) {
      if (!change.product_id || !change.created_by) {
        continue
      }
      const isProductAdd = (change.actions || []).some(
        (a) => a.action === ProductChangeActionType.PRODUCT_ADD
      )
      if (!isProductAdd) {
        continue
      }
      if (!creatorByProduct.has(change.product_id)) {
        creatorByProduct.set(change.product_id, change.created_by)
        candidateSellerIds.add(change.created_by)
      }
    }

    if (candidateSellerIds.size) {
      const { data: sellers } = await query.graph({
        entity: "seller",
        fields: ["id"],
        filters: { id: [...candidateSellerIds] },
      })
      const validSellerIds = new Set(
        ((sellers || []) as { id: string }[]).map((s) => s.id)
      )

      for (const [productId, creatorId] of creatorByProduct) {
        if (validSellerIds.has(creatorId)) {
          result[productId] = [
            ...new Set([...(result[productId] || []), creatorId]),
          ]
        }
      }
    }
  }

  // Fallback: any existing offer sellers on the product
  const stillMissing = products
    .filter((p) => !(result[p.id]?.length))
    .map((p) => p.id)

  if (stillMissing.length) {
    const { data: offers } = await query.graph({
      entity: "offer",
      fields: ["id", "product_id", "seller_id"],
      filters: { product_id: stillMissing },
    })

    for (const offer of (offers || []) as {
      product_id?: string
      seller_id?: string
    }[]) {
      if (!offer.product_id || !offer.seller_id) {
        continue
      }
      result[offer.product_id] = [
        ...new Set([...(result[offer.product_id] || []), offer.seller_id]),
      ]
    }
  }

  return result
}
