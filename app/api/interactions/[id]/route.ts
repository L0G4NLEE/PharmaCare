import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/interactions/[id] - Lấy chi tiết tương tác thuốc
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
      include: {
        medicineFrom: {
          select: { id: true, name: true, code: true },
        },
        medicineTo: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 })
    }

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedInteraction = {
      id: interaction.id,
      medicine1: interaction.medicineFrom.name,
      medicine1Id: interaction.medicineFrom.id,
      medicine2: interaction.medicineTo.name,
      medicine2Id: interaction.medicineTo.id,
      severity: interaction.severity,
      description: interaction.description,
    }

    return NextResponse.json(formattedInteraction)
  } catch (error) {
    console.error("Error fetching interaction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/interactions/[id] - Cập nhật tương tác thuốc
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn (chỉ Admin mới có thể cập nhật tương tác thuốc)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = (await req.json()) as { medicine1: string; medicine2: string; severity: string; description: string }

    // Kiểm tra tương tác tồn tại
    const existingInteraction = await prisma.interaction.findUnique({
      where: { id: params.id },
    })

    if (!existingInteraction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 })
    }

    // Tìm ID của thuốc từ tên
    const medicineFrom = await prisma.medicine.findFirst({
      where: { name: data.medicine1 },
    })

    const medicineTo = await prisma.medicine.findFirst({
      where: { name: data.medicine2 },
    })

    if (!medicineFrom || !medicineTo) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Kiểm tra tương tác đã tồn tại (nếu thay đổi thuốc)
    if (
      (medicineFrom.id !== existingInteraction.medicineFromId || medicineTo.id !== existingInteraction.medicineToId) &&
      (medicineFrom.id !== existingInteraction.medicineToId || medicineTo.id !== existingInteraction.medicineFromId)
    ) {
      const duplicateInteraction = await prisma.interaction.findFirst({
        where: {
          OR: [
            {
              medicineFromId: medicineFrom.id,
              medicineToId: medicineTo.id,
            },
            {
              medicineFromId: medicineTo.id,
              medicineToId: medicineFrom.id,
            },
          ],
          NOT: {
            id: params.id,
          },
        },
      })

      if (duplicateInteraction) {
        return NextResponse.json({ error: "Interaction already exists" }, { status: 400 })
      }
    }

    // Cập nhật tương tác
    const interaction = await prisma.interaction.update({
      where: { id: params.id },
      data: {
        medicineFromId: medicineFrom.id,
        medicineToId: medicineTo.id,
        severity: data.severity,
        description: data.description,
      },
    })

    return NextResponse.json({
      id: interaction.id,
      medicine1: data.medicine1,
      medicine2: data.medicine2,
      severity: interaction.severity,
      description: interaction.description,
    })
  } catch (error) {
    console.error("Error updating interaction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/interactions/[id] - Xóa tương tác thuốc
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn (chỉ Admin mới có thể xóa tương tác thuốc)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Kiểm tra tương tác tồn tại
    const interaction = await prisma.interaction.findUnique({
      where: { id: params.id },
    })

    if (!interaction) {
      return NextResponse.json({ error: "Interaction not found" }, { status: 404 })
    }

    // Xóa tương tác
    await prisma.interaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting interaction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
