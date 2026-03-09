import type { Config } from "drizzle-kit";

// .env는 프로젝트 루트에 두고, 터미널에서 로드되거나 dotenv 설치 시 import "dotenv/config"
const databaseUrl = process.env.DATABASE_URL ?? "";

export default {
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  schemaFilter: ["babdia"],
} satisfies Config;
