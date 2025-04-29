import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
import { env } from "@/lib/env"

// Tạo pool kết nối PostgreSQL
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

// Khởi tạo drizzle với pool kết nối
export const db = drizzle(pool)

// Hàm kiểm tra kết nối
export async function testConnection() {
  try {
    const client = await pool.connect()
    console.log("Kết nối đến Neon PostgreSQL thành công!")
    client.release()
    return true
  } catch (error) {
    console.error("Lỗi kết nối đến Neon PostgreSQL:", error)
    return false
  }
}
