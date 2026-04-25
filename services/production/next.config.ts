import type { NextConfig } from "next";
import { withSecurityHeaders } from "../../shared/next-security.mjs";
import path from "path";

const EXTERNAL_PACKAGES = ['@prisma/client', '@prisma/adapter-pg', 'pg', 'amqplib'];

const nextConfig: NextConfig = withSecurityHeaders({
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: EXTERNAL_PACKAGES,
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      // Explicit externals to prevent webpack bundling WASM/native binaries
      const prev = Array.isArray(config.externals) ? config.externals : config.externals ? [config.externals] : [];
      config.externals = [
        ...prev,
        ...EXTERNAL_PACKAGES.map(pkg => ({ [pkg]: `commonjs ${pkg}` })),
      ];
    }
    return config;
  },
});

export default nextConfig;
