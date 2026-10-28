import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
// Dev previews are embedded in an iframe on a different origin, so framing has
// to be allowed while developing. Production keeps the strict same-origin rules.
const frameAncestors = isProduction
  ? "frame-ancestors 'self'"
  : "frame-ancestors 'self' https://*.e2b.app http://localhost:*";
// Next.js App Router emits required inline bootstrap scripts; blocking them breaks hydration/runtime.
const scriptSrc = isProduction
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https:",
  "font-src 'self'",
  "connect-src 'self' https: wss:",
  frameAncestors,
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'"
].join("; ");

const nextConfig: NextConfig = {
  compress: true,
  allowedDevOrigins: ['*.e2b.app'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          ...(isProduction
            ? [
                {
                  key: 'X-Frame-Options',
                  value: 'SAMEORIGIN'
                }
              ]
            : []),
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: contentSecurityPolicy
          }
        ]
      }
    ];
  },
};

export default nextConfig;
