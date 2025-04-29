import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/inventory - Lấy danh sách kho hàng
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const category = url.searchParams.get("category") || ""
    const stock = url.searchParams.get("stock") || "all"
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Xây dựng điều kiện tìm kiếm
    const where: Record<string, any> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.category = category
    }

    // Lọc theo tồn kho
    if (stock === "low") {
      where.stock = { lte: 10 }
    } else if (stock === "medium") {
      where.stock = { gt: 10, lte: 50 }
    } else if (stock === "high") {
      where.stock = { gt: 50 }
    }

    // Đếm tổng số thuốc thỏa mãn điều kiện
    const total = await prisma.medicine.count({ where })

    // Lấy danh sách thuốc với phân trang
    const medicines = await prisma.medicine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        inventoryItems: {
          orderBy: { expiryDate: "asc" },
          take: 1,
        },
      },
    })

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedInventory = medicines.map((medicine) => {
      const inventoryItem = medicine.inventoryItems[0]

      return {
        id: medicine.code,
        name: medicine.name,
        category: medicine.category,
        stock: medicine.stock,
        expiryDate: inventoryItem ? inventoryItem.expiryDate.toLocaleDateString("vi-VN") : "N/A",
        lotNumber: inventoryItem ? inventoryItem.lotNumber : "N/A",
        supplier: medicine.manufacturer || "N/A",
        lastUpdated: medicine.updatedAt.toLocaleDateString("vi-VN"),
      }
    })

    return NextResponse.json({
      inventory: formattedInventory,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
