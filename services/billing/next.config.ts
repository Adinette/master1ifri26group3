import type { NextConfig } from "next";
import { withSecurityHeaders } from "../../shared/next-security.mjs";

const nextConfig: NextConfig = withSecurityHeaders({
  /* config options here */
});

export default nextConfig;
