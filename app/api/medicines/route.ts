import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { medicines } from "@/lib/schema"
import { desc, eq, like, or } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""

    const skip = (page - 1) * limit

    let query = db.select().from(medicines)

    // Áp dụng tìm kiếm
    if (search) {
      query = query.where(or(like(medicines.name, `%${search}%`), like(medicines.code, `%${search}%`)))
    }

    // Áp dụng lọc theo danh mục
    if (category) {
      query = query.where(eq(medicines.category, category))
    }

    // Đếm tổng số bản ghi
    const countQuery = db.select({ count: db.fn.count() }).from(medicines)
    if (search) {
      countQuery.where(or(like(medicines.name, `%${search}%`), like(medicines.code, `%${search}%`)))
    }
    if (category) {
      countQuery.where(eq(medicines.category, category))
    }

    const [countResult] = await countQuery.execute()
    const total = Number(countResult?.count || 0)

    // Lấy dữ liệu với phân trang
    const data = await query.orderBy(desc(medicines.createdAt)).limit(limit).offset(skip).execute()

    return NextResponse.json({
      medicines: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn
    if (!["ADMIN", "INVENTORY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    // Tạo mã thuốc mới
    const medicineCount = await db.select({ count: db.fn.count() }).from(medicines).execute()
    const count = Number(medicineCount[0]?.count || 0)
    const newCode = `MED-${(1001 + count).toString()}`

    // Tạo thuốc mới
    const [medicine] = await db
      .insert(medicines)
      .values({
        code: newCode,
        name: data.name,
        description: data.description || null,
        category: data.category,
        activeIngredient: data.activeIngredient || null,
        dosage: data.dosage || null,
        indication: data.indication || null,
        contraindication: data.contraindication || null,
        sideEffects: data.sideEffects || null,
        storage: data.storage || null,
        manufacturer: data.manufacturer || null,
        importPrice: Number.parseFloat(data.importPrice) || 0,
        retailPrice: Number.parseFloat(data.retailPrice) || 0,
        stock: Number.parseInt(data.stock) || 0,
        expiryDate: data.expiryDate || null,
        lotNumber: data.lotNumber || null,
      })
      .returning()

    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    console.error("Error creating medicine:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
