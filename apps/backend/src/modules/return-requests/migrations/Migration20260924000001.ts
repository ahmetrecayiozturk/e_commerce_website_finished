import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260924000001 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "return_request" add column if not exists "customer_id" text null;`
    )
    this.addSql(
      `create index if not exists "IDX_return_request_customer_id" on "return_request" ("customer_id") where deleted_at is null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `drop index if exists "IDX_return_request_customer_id";`
    )
    this.addSql(
      `alter table if exists "return_request" drop column if exists "customer_id";`
    )
  }
}
