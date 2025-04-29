import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/inventory/logs - Lấy nhật ký kho
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const type = url.searchParams.get("type") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Xây dựng điều kiện tìm kiếm
    const where: Record<string, any> = {}

    if (search) {
      where.OR = [
        {
          medicine: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        { reference: { contains: search, mode: "insensitive" } },
      ]
    }

    if (type && type !== "all") {
      where.type = type
    }

    // Đếm tổng số log thỏa mãn điều kiện
    const total = await prisma.inventoryLog.count({ where })

    // Lấy danh sách log với phân trang
    const logs = await prisma.inventoryLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        medicine: {
          select: { name: true },
        },
        user: {
          select: { name: true },
        },
      },
    })

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      date: log.createdAt.toLocaleString("vi-VN"),
      medicine: log.medicine.name,
      type: getLogTypeText(log.type),
      quantity: log.quantity > 0 ? `+${log.quantity}` : `${log.quantity}`,
      reference: log.reference || "",
      employee: log.user.name,
    }))

    return NextResponse.json({
      logs: formattedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching inventory logs:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Hàm chuyển đổi loại log thành text hiển thị
function getLogTypeText(type: string): string {
  switch (type) {
    case "IMPORT":
      return "Nhập kho"
    case "SALE":
      return "Bán hàng"
    case "RETURN":
      return "Hoàn trả"
    case "ADJUSTMENT_ADD":
      return "Điều chỉnh tăng"
    case "ADJUSTMENT_SUBTRACT":
      return "Điều chỉnh giảm"
    case "IMPORT_CANCEL":
      return "Hủy nhập kho"
    case "INITIAL":
      return "Khởi tạo"
    default:
      return type
  }
}
