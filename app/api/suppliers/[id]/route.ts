import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { suppliers } from "@/lib/schema"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = params.id
    const supplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, Number.parseInt(id)))
      .execute()

    if (supplier.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    return NextResponse.json(supplier[0])
  } catch (error) {
    console.error("Error fetching supplier:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const data = await request.json()

    // Kiểm tra nhà cung cấp tồn tại
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, Number.parseInt(id)))
      .execute()
    if (existingSupplier.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Cập nhật nhà cung cấp
    const [updatedSupplier] = await db
      .update(suppliers)
      .set({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        contactPerson: data.contactPerson,
        taxCode: data.taxCode || null,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, Number.parseInt(id)))
      .returning()

    return NextResponse.json(updatedSupplier)
  } catch (error) {
    console.error("Error updating supplier:", error)
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

    // Kiểm tra nhà cung cấp tồn tại
    const existingSupplier = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, Number.parseInt(id)))
      .execute()
    if (existingSupplier.length === 0) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    // Xóa nhà cung cấp
    await db.delete(suppliers).where(eq(suppliers.id, Number.parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
