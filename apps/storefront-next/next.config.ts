import type { NextConfig } from "next";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

// The prototype lockfile one level up would otherwise become the Turbopack
// root on Vercel. Do not set outputFileTracingRoot here: the last green
// Vercel deploy used only this root, and a custom tracing root makes the
// builder look for .next in the wrong directory.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
};

export default withNextIntl(nextConfig);
