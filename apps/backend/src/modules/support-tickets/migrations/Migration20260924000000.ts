import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260924000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "support_ticket" add column if not exists "customer_id" text null;`
    )
    this.addSql(
      `create index if not exists "IDX_support_ticket_customer_id" on "support_ticket" ("customer_id") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `drop index if exists "IDX_support_ticket_customer_id";`
    )
    this.addSql(
      `alter table if exists "support_ticket" drop column if exists "customer_id";`
    )
  }
}
