import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// GET /api/interactions - Lấy danh sách tương tác thuốc
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const search = url.searchParams.get("search") || ""
    const severity = url.searchParams.get("severity") || ""
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // Xây dựng điều kiện tìm kiếm
    const where: Record<string, any> = {}

    if (search) {
      where.OR = [
        {
          medicineFrom: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          medicineTo: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          description: { contains: search, mode: "insensitive" },
        },
      ]
    }

    if (severity && severity !== "all") {
      where.severity = severity
    }

    // Đếm tổng số tương tác thỏa mãn điều kiện
    const total = await prisma.interaction.count({ where })

    // Lấy danh sách tương tác với phân trang
    const interactions = await prisma.interaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        medicineFrom: {
          select: { id: true, name: true, code: true },
        },
        medicineTo: {
          select: { id: true, name: true, code: true },
        },
      },
    })

    // Định dạng lại dữ liệu để phù hợp với frontend
    const formattedInteractions = interactions.map((interaction) => ({
      id: interaction.id,
      medicine1: interaction.medicineFrom.name,
      medicine1Id: interaction.medicineFrom.id,
      medicine2: interaction.medicineTo.name,
      medicine2Id: interaction.medicineTo.id,
      severity: interaction.severity,
      description: interaction.description,
    }))

    return NextResponse.json({
      interactions: formattedInteractions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching interactions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/interactions - Thêm tương tác thuốc mới
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Kiểm tra quyền hạn (chỉ Admin mới có thể thêm tương tác thuốc)
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = (await req.json()) as { medicine1: string; medicine2: string; severity: string; description: string }

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

    // Kiểm tra tương tác đã tồn tại
    const existingInteraction = await prisma.interaction.findFirst({
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
      },
    })

    if (existingInteraction) {
      return NextResponse.json({ error: "Interaction already exists" }, { status: 400 })
    }

    // Tạo tương tác mới
    const interaction = await prisma.interaction.create({
      data: {
        medicineFromId: medicineFrom.id,
        medicineToId: medicineTo.id,
        severity: data.severity,
        description: data.description,
      },
    })

    return NextResponse.json(
      {
        id: interaction.id,
        medicine1: data.medicine1,
        medicine2: data.medicine2,
        severity: interaction.severity,
        description: interaction.description,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating interaction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
