import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  // Monorepo: avoid picking the repo-root lockfile as Turbopack root on Vercel
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withNextIntl(nextConfig);
