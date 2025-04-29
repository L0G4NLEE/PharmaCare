import { execSync } from "child_process"
import fs from "fs"
import path from "path"

// Đường dẫn đến thư mục node_modules/.prisma
const prismaDir = path.join(process.cwd(), "node_modules", ".prisma")

// Xóa thư mục .prisma nếu tồn tại
if (fs.existsSync(prismaDir)) {
  console.log("Đang xóa thư mục .prisma...")
  fs.rmSync(prismaDir, { recursive: true, force: true })
  console.log("Đã xóa thư mục .prisma")
}

// Chạy lại prisma generate
console.log("Đang chạy prisma generate...")
execSync("npx prisma generate", { stdio: "inherit" })
console.log("Đã chạy prisma generate thành công")

console.log("Quá trình khởi tạo lại Prisma Client đã hoàn tất")
