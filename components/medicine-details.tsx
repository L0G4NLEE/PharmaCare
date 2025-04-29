"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { getMedicine } from "@/lib/local-storage-api"

interface MedicineDetailsProps {
  medicineId: string
  onClose?: () => void
}

export function MedicineDetails({ medicineId, onClose }: MedicineDetailsProps) {
  const [medicine, setMedicine] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMedicineData = async () => {
      try {
        const data = await getMedicine(medicineId)
        setMedicine(data)
      } catch (err) {
        console.error("Error fetching medicine data:", err)
        setError("Không thể tải thông tin thuốc. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchMedicineData()
  }, [medicineId])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !medicine) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error || "Không tìm thấy thông tin thuốc"}</div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{medicine.name}</CardTitle>
            <CardDescription>Mã thuốc: {medicine.code}</CardDescription>
          </div>
          <Badge variant="outline">{medicine.category}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium">Hoạt chất chính</h3>
            <p className="mt-1 text-sm">{medicine.activeIngredient || "Không có"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Nhà sản xuất</h3>
            <p className="mt-1 text-sm">{medicine.manufacturer || "Không có"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Liều lượng</h3>
            <p className="mt-1 text-sm">{medicine.dosage || "Không có"}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium">Giá nhập</h3>
            <p className="mt-1 text-sm">{formatCurrency(medicine.importPrice)} đ</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Giá bán</h3>
            <p className="mt-1 text-sm font-bold">{formatCurrency(medicine.retailPrice)} đ</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Tồn kho</h3>
            <p className="mt-1 text-sm">{medicine.stock} đơn vị</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Số lô</h3>
            <p className="mt-1 text-sm">{medicine.lotNumber || "Không có"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Hạn sử dụng</h3>
            <p className="mt-1 text-sm">{medicine.expiryDate || "Không có"}</p>
          </div>
        </div>

        <Separator />

        {medicine.description && (
          <div>
            <h3 className="text-sm font-medium">Mô tả</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{medicine.description}</p>
          </div>
        )}

        {medicine.indication && (
          <div>
            <h3 className="text-sm font-medium">Chỉ định</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{medicine.indication}</p>
          </div>
        )}

        {medicine.contraindication && (
          <div>
            <h3 className="text-sm font-medium">Chống chỉ định</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{medicine.contraindication}</p>
          </div>
        )}

        {medicine.sideEffects && (
          <div>
            <h3 className="text-sm font-medium">Tác dụng phụ</h3>
            <p className="mt-1 text-sm whitespace-pre-line">{medicine.sideEffects}</p>
          </div>
        )}

        {medicine.storage && (
          <div>
            <h3 className="text-sm font-medium">Bảo quản</h3>
            <p className="mt-1 text-sm">{medicine.storage}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Đóng
        </Button>
      </CardFooter>
    </Card>
  )
}
