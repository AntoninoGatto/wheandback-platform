/** Ask the storefront to drop cached campaign tags. No-op when the URL is unset. */
export async function revalidateStorefrontTags(
  tags: string[],
  env: NodeJS.ProcessEnv = process.env,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: boolean; skipped?: boolean }> {
  const url = (env.STOREFRONT_REVALIDATE_URL || "").trim()
  if (!url) return { ok: false, skipped: true }
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.REVALIDATE_SECRET || ""}`,
    },
    body: JSON.stringify({ tags }),
  })
  return { ok: response.ok }
}
