import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { phone: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate),
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate),
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: true,
          user: true,
        },
        skip,
        take: limit,
        orderBy: { date: "desc" },
      }),
      prisma.invoice.count({ where }),
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
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi lấy dữ liệu hóa đơn" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    const { items, ...invoiceData } = data

    // Tạo mã hóa đơn tự động nếu không được cung cấp
    if (!invoiceData.code) {
      const invoiceCount = await prisma.invoice.count()
      invoiceData.code = `INV-${(invoiceCount + 1).toString().padStart(5, "0")}`
    }

    // Thêm userId từ session
    invoiceData.userId = session.user.id

    // Tính tổng tiền nếu không được cung cấp
    if (!invoiceData.total) {
      invoiceData.total = items.reduce((sum: number, item: any) => sum + item.total, 0)
    }

    // Tạo hóa đơn và các mục hóa đơn trong một giao dịch
    const invoice = await prisma.$transaction(async (tx) => {
      // Tạo hóa đơn
      const newInvoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          items: {
            create: items.map((item: any) => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          customer: true,
          user: true,
          items: {
            include: {
              medicine: true,
            },
          },
        },
      })

      // Cập nhật số lượng thuốc trong kho
      for (const item of items) {
        // Giảm số lượng thuốc trong bảng Medicine
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })

        // Thêm log kho hàng
        await tx.inventoryLog.create({
          data: {
            medicineId: item.medicineId,
            userId: session.user.id,
            type: "SALE",
            quantity: -item.quantity,
            reference: newInvoice.code,
            note: `Bán hàng cho khách hàng ${newInvoice.customer.name}`,
          },
        })
      }

      return newInvoice
    })

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi tạo hóa đơn mới" }, { status: 500 })
  }
}
