import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import type { InventoryAdjustmentFormData } from "@/types"

// POST /api/inventory/adjust - Điều chỉnh kho
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn (chỉ Admin và Inventory Manager mới có thể điều chỉnh kho)
    if (!["ADMIN", "INVENTORY_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = (await req.json()) as InventoryAdjustmentFormData
    const { medicineId, adjustType, quantity, reason } = data

    if (!medicineId || !adjustType || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Tìm thuốc
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    })

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    let newStock = medicine.stock
    let logQuantity = 0

    // Xử lý điều chỉnh kho
    if (adjustType === "add") {
      newStock += Number(quantity)
      logQuantity = Number(quantity)
    } else if (adjustType === "subtract") {
      if (medicine.stock < Number(quantity)) {
        return NextResponse.json({ error: "Not enough stock" }, { status: 400 })
      }
      newStock -= Number(quantity)
      logQuantity = -Number(quantity)
    } else if (adjustType === "set") {
      newStock = Number(quantity)
      logQuantity = Number(quantity) - medicine.stock
    } else {
      return NextResponse.json({ error: "Invalid adjustment type" }, { status: 400 })
    }

    // Cập nhật số lượng tồn kho
    await prisma.medicine.update({
      where: { id: medicineId },
      data: { stock: newStock },
    })

    // Tạo log kho
    await prisma.inventoryLog.create({
      data: {
        medicineId,
        userId: session.user.id,
        type: logQuantity > 0 ? "ADJUSTMENT_ADD" : "ADJUSTMENT_SUBTRACT",
        quantity: logQuantity,
        note: reason || "Điều chỉnh kho",
      },
    })

    return NextResponse.json({
      success: true,
      medicine: {
        ...medicine,
        stock: newStock,
      },
    })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
