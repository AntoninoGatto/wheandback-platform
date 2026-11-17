import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20261117120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`create table if not exists "cashback_entry" (
      "id" text not null,
      "customer_id" text not null,
      "order_id" text null,
      "entry_type" text not null,
      "amount_cents" text not null,
      "currency_code" text not null default 'eur',
      "source_entry_id" text null,
      "idempotency_key" text not null,
      "note" text null,
      "actor_id" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "cashback_entry_pkey" primary key ("id")
    );`)
    this.addSql(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_cashback_entry_idempotency" ON "cashback_entry" ("idempotency_key") WHERE deleted_at IS NULL;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "cashback_entry" cascade;`)
  }
}
