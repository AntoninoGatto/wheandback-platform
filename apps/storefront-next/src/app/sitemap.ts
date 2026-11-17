import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002";
  const paths = [
    "/it",
    "/it/shop",
    "/it/cashback",
    "/it/invita",
    "/it/legale/privacy",
    "/it/legale/cookie",
    "/it/legale/termini",
    "/it/legale/recesso",
    "/it/legale/regolamento",
  ];
  return paths.map((path) => ({ url: `${base}${path}` }));
}
