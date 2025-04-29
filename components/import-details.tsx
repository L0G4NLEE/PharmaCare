"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { getImport } from "@/lib/local-storage-api"
import { Printer } from "lucide-react"
import { ImportPDF } from "@/components/import-pdf"
import { PDFGenerator } from "@/components/pdf-generator"

interface ImportDetailsProps {
  importId: string
  onClose?: () => void
}

export function ImportDetails({ importId, onClose }: ImportDetailsProps) {
  const [importData, setImportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImportData = async () => {
      try {
        const data = await getImport(importId)
        setImportData(data)
      } catch (err) {
        console.error("Error fetching import data:", err)
        setError("Không thể tải thông tin phiếu nhập. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchImportData()
  }, [importId])

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

  if (error || !importData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error || "Không tìm thấy thông tin phiếu nhập"}</div>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Chi tiết phiếu nhập #{importData.id}</CardTitle>
          <CardDescription>Ngày tạo: {importData.date}</CardDescription>
        </div>
        <PDFGenerator
          documentTitle={`Phiếu nhập hàng #${importData.id}`}
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              In phiếu nhập
            </Button>
          }
        >
          <ImportPDF importData={importData} />
        </PDFGenerator>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Thông tin nhà cung cấp</h3>
            <p className="mt-1 text-sm">{importData.supplier}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Người tạo phiếu</h3>
            <p className="mt-1 text-sm">{importData.employee}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Danh sách thuốc nhập</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Số lô</TableHead>
                  <TableHead>Hạn dùng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importData.items.map((item: any, index: number) => (
                  <TableRow key={item.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.medicineName}</TableCell>
                    <TableCell>{item.lotNumber}</TableCell>
                    <TableCell>{item.expiryDate}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)} đ</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)} đ</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex w-full justify-between border-t pt-2 md:w-1/2">
            <span className="font-medium">Tổng tiền:</span>
            <span className="font-bold">{formatCurrency(importData.total)} đ</span>
          </div>
        </div>

        {importData.note && (
          <div>
            <h3 className="text-sm font-medium">Ghi chú</h3>
            <p className="mt-1 text-sm">{importData.note}</p>
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
