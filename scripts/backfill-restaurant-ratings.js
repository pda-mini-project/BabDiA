const { Pool } = require("pg");

async function backfillRestaurantRatings() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updateResult = await client.query(`
      with review_averages as (
        select
          restaurant_id,
          round(avg(rating)::numeric, 1) as avg_rating
        from babdia.reviews
        group by restaurant_id
      )
      update babdia.restaurants as r
      set rating = a.avg_rating
      from review_averages as a
      where r.id = a.restaurant_id
        and r.rating is distinct from a.avg_rating
      returning r.id
    `);

    const summaryResult = await client.query(`
      select
        count(*)::int as reviewed_restaurant_count
      from (
        select restaurant_id
        from babdia.reviews
        group by restaurant_id
      ) t
    `);

    await client.query("COMMIT");

    const reviewedCount = summaryResult.rows[0]?.reviewed_restaurant_count ?? 0;
    const updatedCount = updateResult.rowCount ?? 0;
    console.log(
      `[backfill-restaurant-ratings] reviewed restaurants: ${reviewedCount}, updated rows: ${updatedCount}`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

backfillRestaurantRatings().catch((error) => {
  console.error("[backfill-restaurant-ratings] failed:", error);
  process.exit(1);
});
