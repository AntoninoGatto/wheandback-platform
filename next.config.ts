import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oszzfaidnujxytrohjrb.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cf.cjdropshipping.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cc-west-usa.oss-us-west-1.aliyuncs.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
