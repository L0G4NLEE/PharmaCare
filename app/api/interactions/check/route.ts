import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// POST /api/interactions/check - Kiểm tra tương tác giữa hai thuốc
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = (await req.json()) as { medicine1: string; medicine2: string }
    const { medicine1, medicine2 } = data

    if (!medicine1 || !medicine2) {
      return NextResponse.json({ error: "Both medicines are required" }, { status: 400 })
    }

    // Tìm ID của thuốc từ tên
    const medicineFrom = await prisma.medicine.findFirst({
      where: { name: medicine1 },
    })

    const medicineTo = await prisma.medicine.findFirst({
      where: { name: medicine2 },
    })

    if (!medicineFrom || !medicineTo) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    // Tìm tương tác giữa hai thuốc
    const interaction = await prisma.interaction.findFirst({
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

    if (!interaction) {
      return NextResponse.json({ found: false })
    }

    return NextResponse.json({
      found: true,
      interaction: {
        id: interaction.id,
        medicine1: medicine1,
        medicine2: medicine2,
        severity: interaction.severity,
        description: interaction.description,
      },
    })
  } catch (error) {
    console.error("Error checking interaction:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
