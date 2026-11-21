import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261120203000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table if exists "cashback_entry" add column if not exists "line_id" text null;`)
    this.addSql(`create table if not exists "variant_economics" (
      "id" text not null,
      "variant_id" text not null,
      "sku" text not null,
      "supplier_id" text not null,
      "price_list_source" text null,
      "price_list_date" text null,
      "supplier_cost_cents" text not null,
      "reference_price_cents" text not null,
      "reference_basis" text not null,
      "vat_rate_bps" text not null,
      "public_price_cents" text not null,
      "reward_base_cents" text not null,
      "min_margin_bps" text not null,
      "compliance_status" text not null,
      "image_rights" text null,
      "review_note" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "variant_economics_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_variant_economics_variant" ON "variant_economics" ("variant_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(`create table if not exists "promo_campaign" (
      "id" text not null,
      "public_code" text not null,
      "version" text not null,
      "status" text not null,
      "starts_at" text not null,
      "ends_at" text not null,
      "timezone" text not null default 'Europe/Rome',
      "budget_cents" text null,
      "max_uses" text null,
      "created_by" text not null,
      "approved_by" text null,
      "activated_at" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "promo_campaign_pkey" primary key ("id")
    );`)
    this.addSql(`create table if not exists "promo_campaign_line" (
      "id" text not null,
      "campaign_id" text not null,
      "variant_id" text not null,
      "discount_bps" text not null,
      "referral_bps_override" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "promo_campaign_line_pkey" primary key ("id")
    );`)
    this.addSql(`create table if not exists "code_reservation" (
      "id" text not null,
      "campaign_id" text not null,
      "code" text not null,
      "cart_id" text not null,
      "status" text not null,
      "expires_at" text not null,
      "idempotency_key" text not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "code_reservation_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_code_reservation_idempotency" ON "code_reservation" ("idempotency_key") WHERE deleted_at IS NULL;`
    )
    this.addSql(`create table if not exists "benefit_snapshot" (
      "id" text not null,
      "cart_id" text not null,
      "order_id" text null,
      "line_id" text not null,
      "mode" text not null,
      "sku" text not null,
      "qty" text not null,
      "initial_price_cents" text not null,
      "vat_rate_bps" text not null,
      "discount_cents" text not null,
      "price_paid_cents" text not null,
      "reward_cents" text not null,
      "internal_cents" text not null,
      "code" text null,
      "campaign_version" text null,
      "referrer_customer_id" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "benefit_snapshot_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_benefit_snapshot_cart_line" ON "benefit_snapshot" ("cart_id", "line_id") WHERE deleted_at IS NULL;`
    )
    this.addSql(`create table if not exists "support_case" (
      "id" text not null,
      "case_number" text not null,
      "email" text not null,
      "order_id" text null,
      "case_type" text not null,
      "status" text not null,
      "message" text not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "support_case_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_support_case_number" ON "support_case" ("case_number") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_case" cascade;`)
    this.addSql(`drop table if exists "benefit_snapshot" cascade;`)
    this.addSql(`drop table if exists "code_reservation" cascade;`)
    this.addSql(`drop table if exists "promo_campaign_line" cascade;`)
    this.addSql(`drop table if exists "promo_campaign" cascade;`)
    this.addSql(`drop table if exists "variant_economics" cascade;`)
    this.addSql(`alter table if exists "cashback_entry" drop column if exists "line_id";`)
  }
}
