import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Pool } from "pg"
import { env } from "@/lib/env"

// Hàm thực hiện migration
export async function runMigrations() {
  const pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  const db = drizzle(pool)

  console.log("Đang chạy migrations...")

  try {
    await migrate(db, { migrationsFolder: "drizzle" })
    console.log("Migrations hoàn tất!")
  } catch (error) {
    console.error("Lỗi khi chạy migrations:", error)
  } finally {
    await pool.end()
  }
}

// Chạy migrations nếu được gọi trực tiếp
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Lỗi không xử lý được:", err)
      process.exit(1)
    })
}
