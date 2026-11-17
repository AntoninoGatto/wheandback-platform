import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261117133000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "loyalty_plan" (
      "id" text not null,
      "status" text not null,
      "created_by" text not null,
      "approved_by" text null,
      "starts_at" text not null,
      "ends_at" text null,
      "referral_orders" text not null,
      "monthly_cap_cents" text not null,
      "tiers_json" text not null,
      "rules_json" text not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "loyalty_plan_pkey" primary key ("id")
    );`)
    this.addSql(`create table if not exists "referral_link" (
      "id" text not null,
      "referrer_customer_id" text not null,
      "code" text not null,
      "referred_customer_id" text null,
      "referred_email" text null,
      "payment_fingerprint" text null,
      "address_fingerprint" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "referral_link_pkey" primary key ("id")
    );`)
    this.addSql(`create table if not exists "reward_snapshot" (
      "id" text not null,
      "order_id" text not null,
      "product_id" text not null,
      "plan_id" text not null,
      "cashback_rate" text not null,
      "referral_rate" text not null,
      "rule_scope" text not null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "reward_snapshot_pkey" primary key ("id")
    );`)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "reward_snapshot" cascade;`)
    this.addSql(`drop table if exists "referral_link" cascade;`)
    this.addSql(`drop table if exists "loyalty_plan" cascade;`)
  }
}
