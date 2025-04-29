import { db } from "@/lib/db"
import { users, medicines, customers, suppliers } from "@/lib/schema"
import { hash } from "bcrypt"

// Hàm seed dữ liệu mẫu
export async function seedDatabase() {
  console.log("Đang seed dữ liệu mẫu...")

  try {
    // Seed users
    const hashedPassword = await hash("admin123", 10)
    await db
      .insert(users)
      .values({
        name: "Admin",
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "ADMIN",
      })
      .onConflictDoNothing()

    // Seed medicines
    await db
      .insert(medicines)
      .values([
        {
          code: "MED-0001",
          name: "Paracetamol 500mg",
          description: "Thuốc giảm đau, hạ sốt thông dụng",
          category: "Thuốc giảm đau",
          activeIngredient: "Paracetamol",
          dosage: "500mg",
          indication: "Giảm đau nhẹ đến vừa, hạ sốt",
          contraindication: "Mẫn cảm với paracetamol, bệnh gan nặng",
          sideEffects: "Hiếm gặp: phát ban, ngứa, buồn nôn",
          storage: "Nơi khô ráo, tránh ánh sáng, nhiệt độ dưới 30°C",
          manufacturer: "Công ty Dược phẩm ABC",
          importPrice: 15000,
          retailPrice: 20000,
          stock: 150,
          expiryDate: "2025-12-31",
          lotNumber: "LOT-123456",
        },
        {
          code: "MED-0002",
          name: "Amoxicillin 500mg",
          description: "Kháng sinh nhóm beta-lactam",
          category: "Kháng sinh",
          activeIngredient: "Amoxicillin",
          dosage: "500mg",
          indication: "Điều trị nhiễm khuẩn đường hô hấp, tiết niệu, da",
          contraindication: "Mẫn cảm với penicillin",
          sideEffects: "Tiêu chảy, buồn nôn, phát ban",
          storage: "Nơi khô ráo, nhiệt độ dưới 25°C",
          manufacturer: "Công ty Dược phẩm XYZ",
          importPrice: 25000,
          retailPrice: 35000,
          stock: 100,
          expiryDate: "2024-10-15",
          lotNumber: "LOT-789012",
        },
      ])
      .onConflictDoNothing()

    // Seed customers
    await db
      .insert(customers)
      .values([
        {
          code: "KH-0001",
          name: "Nguyễn Văn A",
          phone: "0901234567",
          email: "nguyenvana@example.com",
          address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
          birthdate: "1985-05-15",
        },
        {
          code: "KH-0002",
          name: "Trần Thị B",
          phone: "0912345678",
          email: "tranthib@example.com",
          address: "456 Đường Nguyễn Huệ, Quận 1, TP.HCM",
          birthdate: "1990-08-20",
        },
      ])
      .onConflictDoNothing()

    // Seed suppliers
    await db
      .insert(suppliers)
      .values([
        {
          code: "SUP-0001",
          name: "Công ty Dược phẩm Hà Nội",
          phone: "024 3825 7941",
          email: "contact@hanoipharma.com",
          address: "Số 2 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
          contactPerson: "Nguyễn Văn A",
          taxCode: "0100107518",
        },
      ])
      .onConflictDoNothing()

    console.log("Seed dữ liệu mẫu hoàn tất!")
  } catch (error) {
    console.error("Lỗi khi seed dữ liệu:", error)
  }
}

// Chạy seed nếu được gọi trực tiếp
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Lỗi không xử lý được:", err)
      process.exit(1)
    })
}
