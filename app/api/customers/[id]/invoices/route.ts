import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

interface Params {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const skip = (page - 1) * limit

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { customerId: id },
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              medicine: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.invoice.count({
        where: { customerId: id },
      }),
    ])

    return NextResponse.json({
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching customer invoices:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi lấy hóa đơn của khách hàng" }, { status: 500 })
  }
}
