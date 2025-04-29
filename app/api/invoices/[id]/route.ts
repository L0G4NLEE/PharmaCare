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

    const invoice = await prisma.invoice.findUnique({
      where: { id },
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

    if (!invoice) {
      return NextResponse.json({ error: "Không tìm thấy hóa đơn" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi lấy thông tin hóa đơn" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const data = await request.json()
    const { items, ...invoiceData } = data

    // Chỉ cho phép cập nhật một số trường nhất định
    const allowedFields = ["note", "paymentMethod", "status"]
    const filteredData = Object.keys(invoiceData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = invoiceData[key]
        return obj
      }, {})

    // Cập nhật hóa đơn
    const invoice = await prisma.invoice.update({
      where: { id },
      data: filteredData,
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

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi cập nhật hóa đơn" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Lấy thông tin hóa đơn trước khi xóa
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Không tìm thấy hóa đơn" }, { status: 404 })
    }

    // Xóa hóa đơn và cập nhật kho hàng trong một giao dịch
    await prisma.$transaction(async (tx) => {
      // Xóa các mục hóa đơn
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id },
      })

      // Xóa hóa đơn
      await tx.invoice.delete({
        where: { id },
      })

      // Cập nhật lại số lượng thuốc trong kho
      for (const item of invoice.items) {
        // Tăng số lượng thuốc trong bảng Medicine
        await tx.medicine.update({
          where: { id: item.medicineId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })

        // Thêm log kho hàng
        await tx.inventoryLog.create({
          data: {
            medicineId: item.medicineId,
            userId: session.user.id,
            type: "RETURN",
            quantity: item.quantity,
            reference: invoice.code,
            note: `Hủy hóa đơn ${invoice.code} của khách hàng ${invoice.customer.name}`,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi xóa hóa đơn" }, { status: 500 })
  }
}
