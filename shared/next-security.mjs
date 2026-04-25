const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "connect-src 'self' http: https: ws: wss:",
  "frame-src 'self' https://accounts.google.com",
  "form-action 'self' https://accounts.google.com",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

export function withSecurityHeaders(config = {}) {
  return {
    ...config,
    poweredByHeader: false,
    async headers() {
      const existingHeaders = typeof config.headers === 'function' ? await config.headers() : []

      return [
        ...existingHeaders,
        {
          source: '/:path*',
          headers: securityHeaders,
        },
      ]
    },
  }
}