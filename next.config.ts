import type { NextConfig } from "next"

// ─────────────────────────────────────────
// Content-Security-Policy
// ─────────────────────────────────────────
// Ajustez les sources selon vos prestataires de paiement actifs.
// 'unsafe-inline' est requis pour Next.js RSC + hydration.
// Retirez 'unsafe-eval' si vous n'utilisez pas d'évaluation dynamique.
const CSP = [
  "default-src 'self'",
  // Scripts : Next.js hydration + prestataires de paiement
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.paypalobjects.com",
  // Styles inline (Tailwind / CSS-in-JS)
  "style-src 'self' 'unsafe-inline'",
  // Polices auto-hébergées (@fontsource → bundlées)
  "font-src 'self' data:",
  // Images
  "img-src 'self' data: blob: https:",
  // Fetch / XHR / WebSocket (Socket.io)
  "connect-src 'self' https://api.stripe.com https://api.paypal.com wss: ws:",
  // iframes Stripe / PayPal
  "frame-src https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com",
  // Bloque les plugins (Flash, etc.)
  "object-src 'none'",
  // Bloque l'injection de base href
  "base-uri 'self'",
  // Les formulaires ne peuvent soumettre qu'en interne
  "form-action 'self'",
  // Bloque les iframes externes de charger notre site
  "frame-ancestors 'self'",
].join('; ')

// ─────────────────────────────────────────
// Headers de sécurité HTTP
// ─────────────────────────────────────────
const securityHeaders = [
  // HTTPS forcé 2 ans, incluant sous-domaines
  {
    key:   'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // CSP
  {
    key:   'Content-Security-Policy',
    value: CSP,
  },
  // Anti-clickjacking (doublonne X-Frame-Options du middleware pour les assets)
  {
    key:   'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Empêche le MIME sniffing
  {
    key:   'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Referer limité à l'origine lors de cross-origin
  {
    key:   'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Désactive les APIs navigateur non utilisées
  {
    key:   'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // Supprime le header qui expose la techno serveur
  {
    key:   'X-Powered-By',
    value: '',
  },
]

// ─────────────────────────────────────────
// Config Next.js
// ─────────────────────────────────────────
const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'bcrypt'],

  async headers() {
    return [
      {
        source:  '/(.*)',
        headers: securityHeaders.filter(h => h.value !== ''),
      },
    ]
  },
}

export default nextConfig
