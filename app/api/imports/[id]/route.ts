import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { imports, importItems, suppliers, users, medicines } from "@/lib/schema"
import { eq, sql } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id

    // Tìm phiếu nhập theo mã
    const importData = await db
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
      .where(eq(imports.code, id))
      .execute()

    if (importData.length === 0) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 })
    }

    // Lấy các mục của phiếu nhập
    const items = await db
      .select({
        id: importItems.id,
        medicineId: importItems.medicineId,
        medicineName: medicines.name,
        lotNumber: importItems.lotNumber,
        expiryDate: importItems.expiryDate,
        price: importItems.price,
        quantity: importItems.quantity,
        total: importItems.total,
      })
      .from(importItems)
      .leftJoin(medicines, eq(importItems.medicineId, medicines.id))
      .where(eq(importItems.importId, importData[0].id))
      .execute()

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedImport = {
      ...importData[0],
      date: importData[0].date.toLocaleString("vi-VN"),
      items,
    }

    return NextResponse.json(formattedImport)
  } catch (error) {
    console.error("Error fetching import:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn
    if (!["ADMIN", "INVENTORY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const id = params.id

    // Tìm phiếu nhập theo mã
    const importData = await db.select().from(imports).where(eq(imports.code, id)).execute()

    if (importData.length === 0) {
      return NextResponse.json({ error: "Import not found" }, { status: 404 })
    }

    // Lấy các mục của phiếu nhập
    const items = await db.select().from(importItems).where(eq(importItems.importId, importData[0].id)).execute()

    // Bắt đầu transaction
    return await db.transaction(async (tx) => {
      // Cập nhật lại số lượng thuốc trong kho
      for (const item of items) {
        await tx
          .update(medicines)
          .set({
            stock: sql`${medicines.stock} - ${item.quantity}`,
          })
          .where(eq(medicines.id, item.medicineId))
      }

      // Xóa các mục của phiếu nhập
      await tx.delete(importItems).where(eq(importItems.importId, importData[0].id))

      // Xóa phiếu nhập
      await tx.delete(imports).where(eq(imports.id, importData[0].id))

      return NextResponse.json({ success: true })
    })
  } catch (error) {
    console.error("Error deleting import:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
