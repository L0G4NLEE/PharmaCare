import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { medicines } from "@/lib/schema"
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
    const medicine = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, Number.parseInt(id)))
      .execute()

    if (medicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(medicine[0])
  } catch (error) {
    console.error("Error fetching medicine:", error)
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

    // Kiểm tra thuốc tồn tại
    const existingMedicine = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, Number.parseInt(id)))
      .execute()
    if (existingMedicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Cập nhật thuốc
    const [updatedMedicine] = await db
      .update(medicines)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(medicines.id, Number.parseInt(id)))
      .returning()

    return NextResponse.json(updatedMedicine)
  } catch (error) {
    console.error("Error updating medicine:", error)
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

    // Kiểm tra thuốc tồn tại
    const existingMedicine = await db
      .select()
      .from(medicines)
      .where(eq(medicines.id, Number.parseInt(id)))
      .execute()
    if (existingMedicine.length === 0) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Xóa thuốc
    await db.delete(medicines).where(eq(medicines.id, Number.parseInt(id)))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting medicine:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
