import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query(`
      update "babdia"."restaurants" as r
      set "rating" = coalesce(agg.avg_rating, 0.0)::numeric(2,1)
      from (
        select
          rt."id" as restaurant_id,
          round(avg(rv."rating")::numeric, 1) as avg_rating
        from "babdia"."restaurants" rt
        left join "babdia"."reviews" rv
          on rv."restaurant_id" = rt."id"
        group by rt."id"
      ) as agg
      where r."id" = agg.restaurant_id
    `);

    console.log(
      `[refresh-ratings] Updated ${result.rowCount ?? 0} restaurant ratings.`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[refresh-ratings] Failed:", error);
  process.exit(1);
});
