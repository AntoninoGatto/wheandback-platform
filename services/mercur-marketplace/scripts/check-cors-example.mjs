/**
 * Loads packages/api/.env.example the same way Medusa does (dotenv + expand)
 * and checks STORE_CORS / AUTH_CORS allow the storefront origins we deploy.
 */
import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const { parseCorsOrigins } = require("@medusajs/framework/utils")
const dotenv = require("dotenv")
const { expand } = require("dotenv-expand")

const examplePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../packages/api/.env.example"
)
const parsed = dotenv.parse(fs.readFileSync(examplePath, "utf8"))
expand({ parsed, processEnv: {} })

const allows = (list, origin) =>
  list.some((entry) => (entry instanceof RegExp ? entry.test(origin) : entry === origin))

const cases = [
  ["STORE_CORS", "http://localhost:3002", true],
  ["STORE_CORS", "http://127.0.0.1:3002", true],
  ["STORE_CORS", "https://wheback.vercel.app", true],
  ["STORE_CORS", "https://wheback-git-main-team.vercel.app", true],
  ["STORE_CORS", "https://evil.com", false],
  ["STORE_CORS", "https://notvercel.app", false],
  ["STORE_CORS", "https://shop.vercel.app.evil.com", false],
  ["AUTH_CORS", "http://localhost:3002", true],
  ["AUTH_CORS", "https://wheback-abc123.vercel.app", true],
  ["AUTH_CORS", "https://evil.com", false],
  ["ADMIN_CORS", "http://localhost:9000", true],
  ["VENDOR_CORS", "http://localhost:7001", true],
]

let failed = 0
for (const [key, origin, expected] of cases) {
  const list = parseCorsOrigins(parsed[key])
  const actual = allows(list, origin)
  if (actual !== expected) {
    failed += 1
    console.error(`FAIL ${key} ${origin}: expected ${expected}, got ${actual}`)
    console.error("  parsed value:", parsed[key])
  }
}

if (!parsed.DATABASE_URL || !parsed.REDIS_URL || !parsed.JWT_SECRET || !parsed.COOKIE_SECRET) {
  failed += 1
  console.error("FAIL .env.example is missing DATABASE_URL, REDIS_URL, JWT_SECRET, or COOKIE_SECRET")
}

if (failed > 0) {
  process.exit(1)
}

console.log("CORS example ok")
