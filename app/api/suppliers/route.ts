import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { suppliers } from "@/lib/schema"
import { desc, like, or } from "drizzle-orm"
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

    const skip = (page - 1) * limit

    let query = db.select().from(suppliers)

    // Áp dụng tìm kiếm
    if (search) {
      query = query.where(
        or(
          like(suppliers.name, `%${search}%`),
          like(suppliers.code, `%${search}%`),
          like(suppliers.phone, `%${search}%`),
          like(suppliers.email, `%${search}%`),
        ),
      )
    }

    // Đếm tổng số bản ghi
    const countQuery = db.select({ count: db.fn.count() }).from(suppliers)
    if (search) {
      countQuery.where(
        or(
          like(suppliers.name, `%${search}%`),
          like(suppliers.code, `%${search}%`),
          like(suppliers.phone, `%${search}%`),
          like(suppliers.email, `%${search}%`),
        ),
      )
    }

    const [countResult] = await countQuery.execute()
    const total = Number(countResult?.count || 0)

    // Lấy dữ liệu với phân trang
    const data = await query.orderBy(desc(suppliers.createdAt)).limit(limit).offset(skip).execute()

    return NextResponse.json({
      suppliers: data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
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

    // Tạo mã nhà cung cấp mới
    const supplierCount = await db.select({ count: db.fn.count() }).from(suppliers).execute()
    const count = Number(supplierCount[0]?.count || 0)
    const newCode = `SUP-${(1001 + count).toString()}`

    // Tạo nhà cung cấp mới
    const [supplier] = await db
      .insert(suppliers)
      .values({
        code: newCode,
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        contactPerson: data.contactPerson,
        taxCode: data.taxCode || null,
      })
      .returning()

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
