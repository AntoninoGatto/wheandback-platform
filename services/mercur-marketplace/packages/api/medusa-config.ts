import { loadEnv } from '@medusajs/framework/utils'
import { withMercur } from '@mercurjs/core'
import fs from 'fs'
import path from 'path'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const isPlaceholderSecret = (value: string | undefined) =>
  !value || value === 'supersecret' || value.startsWith('replace-with-')

if (
  process.env.ENFORCE_PROD_SECRETS === 'true' &&
  (isPlaceholderSecret(process.env.JWT_SECRET) ||
    isPlaceholderSecret(process.env.COOKIE_SECRET))
) {
  throw new Error(
    'JWT_SECRET and COOKIE_SECRET must be long unique random strings in production.'
  )
}

// Railway public Postgres often needs TLS. Private networking usually does not.
// Leave DATABASE_SSL unset locally and on the private URL.
const databaseDriverOptions =
  process.env.DATABASE_SSL === 'true'
    ? { connection: { ssl: { rejectUnauthorized: false } } }
    : undefined

// Resolves where a dashboard app lives:
// - in the source tree (development): ../../apps/<name>
// - in the production build artifact: hosts that deploy only `.medusa/server` (for example
//   Medusa Cloud) get the panels bundled into ./dashboards/<name> by
//   scripts/bundle-dashboards.mjs during `build`. The compiled config runs from the
//   artifact root, so __dirname points there.
const dashboardAppDir = (name: string) => {
  const bundled = path.join(__dirname, 'dashboards', name)
  return fs.existsSync(bundled) ? bundled : path.join(__dirname, `../../apps/${name}`)
}

module.exports = withMercur({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    ...(databaseDriverOptions ? { databaseDriverOptions } : {}),
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      vendorCors: process.env.VENDOR_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  featureFlags: {
    seller_registration: true
  },
  modules: [
    {
      resolve: '@mercurjs/core/modules/admin-ui',
      options: {
        appDir: dashboardAppDir('admin'),
        path: '/dashboard',
      }
    },
    {
      resolve: '@mercurjs/core/modules/vendor-ui',
      options: {
        appDir: dashboardAppDir('vendor'),
        path: '/seller',
      }
    },
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              // The local provider bakes this into every uploaded file URL.
              // It must be the publicly reachable origin in production, or
              // images resolve to localhost and render broken.
              backend_url: process.env.FILE_BACKEND_URL || 'http://localhost:9000/static',
            },
          },
        ],
      },
    },
    // Self-hosted Medusa does not switch these to Redis from projectConfig.redisUrl.
    // Without them the process boots on the in-memory event bus and locking.
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: '@medusajs/medusa/event-bus-redis',
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: '@medusajs/medusa/cache-redis',
            options: { redisUrl: process.env.REDIS_URL },
          },
          {
            resolve: '@medusajs/medusa/workflow-engine-redis',
            options: { redis: { url: process.env.REDIS_URL } },
          },
          {
            resolve: '@medusajs/medusa/locking',
            options: {
              providers: [
                {
                  id: 'locking-redis',
                  resolve: '@medusajs/medusa/locking-redis',
                  is_default: true,
                  options: { redisUrl: process.env.REDIS_URL },
                },
              ],
            },
          },
        ]
      : []),
    // Absent key: keep Medusa's default payment module so the process can boot.
    // Set STRIPE_API_KEY and enable the provider on the Region before checkout.
    ...(process.env.STRIPE_API_KEY
      ? [
          {
            resolve: '@medusajs/medusa/payment',
            options: {
              providers: [
                {
                  resolve: '@medusajs/medusa/payment-stripe',
                  id: 'stripe',
                  options: {
                    apiKey: process.env.STRIPE_API_KEY,
                    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
                    capture: true,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
