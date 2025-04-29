import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { imports, importItems, medicines, suppliers, users, inventoryLogs } from "@/lib/schema"
import { desc, eq, like, or } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sql } from "drizzle-orm"

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
    const dateStr = searchParams.get("date") || ""

    const skip = (page - 1) * limit

    // Xây dựng query phức tạp với join
    let query = db
      .select({
        id: imports.id,
        code: imports.code,
        date: imports.date,
        supplier: suppliers.name,
        employee: users.name,
        total: imports.total,
        status: imports.status,
        supplierId: imports.supplierId,
        userId: imports.userId,
        note: imports.note,
      })
      .from(imports)
      .leftJoin(suppliers, eq(imports.supplierId, suppliers.id))
      .leftJoin(users, eq(imports.userId, users.id))

    // Áp dụng tìm kiếm
    if (search) {
      query = query.where(or(like(imports.code, `%${search}%`), like(suppliers.name, `%${search}%`)))
    }

    // Áp dụng lọc theo ngày
    if (dateStr) {
      const date = new Date(dateStr)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query.where(sql`${imports.date} >= ${startOfDay} AND ${imports.date} <= ${endOfDay}`)
    }

    // Đếm tổng số bản ghi
    const countQuery = db
      .select({ count: db.fn.count() })
      .from(imports)
      .leftJoin(suppliers, eq(imports.supplierId, suppliers.id))

    if (search) {
      countQuery.where(or(like(imports.code, `%${search}%`), like(suppliers.name, `%${search}%`)))
    }

    if (dateStr) {
      const date = new Date(dateStr)
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      countQuery.where(sql`${imports.date} >= ${startOfDay} AND ${imports.date} <= ${endOfDay}`)
    }

    const [countResult] = await countQuery.execute()
    const total = Number(countResult?.count || 0)

    // Lấy dữ liệu với phân trang
    const data = await query.orderBy(desc(imports.date)).limit(limit).offset(skip).execute()

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedImports = data.map((importItem) => ({
      id: importItem.code,
      date: importItem.date.toLocaleString("vi-VN"),
      supplier: importItem.supplier,
      employee: importItem.employee,
      total: importItem.total,
      status: importItem.status,
      supplierId: importItem.supplierId,
      userId: importItem.userId,
      note: importItem.note,
    }))

    return NextResponse.json({
      imports: formattedImports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching imports:", error)
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

    // Tạo mã phiếu nhập mới
    const importCount = await db.select({ count: db.fn.count() }).from(imports).execute()
    const count = Number(importCount[0]?.count || 0)
    const newCode = `IMP-${(1000000 + count + 1).toString().substring(1)}`

    // Tìm nhà cung cấp
    const supplier = await db.select().from(suppliers).where(eq(suppliers.id, data.supplierId)).execute()
    if (supplier.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Tính tổng tiền
    let total = 0
    if (Array.isArray(data.items)) {
      total = data.items.reduce((sum, item) => sum + (item.total || 0), 0)
    }

    // Bắt đầu transaction
    return await db.transaction(async (tx) => {
      // Tạo phiếu nhập mới
      const [importItem] = await tx
        .insert(imports)
        .values({
          code: newCode,
          date: new Date(),
          supplierId: data.supplierId,
          userId: session.user.id,
          note: data.note || null,
          status: "Hoàn thành",
          total,
        })
        .returning()

      // Tạo các mục phiếu nhập
      if (Array.isArray(data.items) && data.items.length > 0) {
        for (const item of data.items) {
          // Tìm thuốc
          const medicine = await tx.select().from(medicines).where(eq(medicines.id, item.medicineId)).execute()
          if (medicine.length === 0) continue

          // Tạo mục phiếu nhập
          await tx.insert(importItems).values({
            importId: importItem.id,
            medicineId: item.medicineId,
            lotNumber: item.lotNumber,
            expiryDate: item.expiryDate,
            quantity: item.quantity,
            price: item.price,
            total: item.total || item.quantity * item.price,
          })

          // Cập nhật số lượng tồn kho
          await tx
            .update(medicines)
            .set({
              stock: sql`${medicines.stock} + ${item.quantity}`,
              lotNumber: item.lotNumber,
              expiryDate: item.expiryDate,
            })
            .where(eq(medicines.id, item.medicineId))

          // Tạo log kho
          await tx.insert(inventoryLogs).values({
            medicineId: item.medicineId,
            userId: session.user.id,
            type: "IMPORT",
            quantity: item.quantity,
            reference: newCode,
            note: `Nhập hàng từ ${supplier[0].name}`,
          })
        }
      }

      return NextResponse.json(
        {
          id: newCode,
          ...importItem,
        },
        { status: 201 },
      )
    })
  } catch (error) {
    console.error("Error creating import:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
