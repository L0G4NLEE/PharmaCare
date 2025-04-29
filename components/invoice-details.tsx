"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { getInvoice } from "@/lib/local-storage-api"
import { Printer } from "lucide-react"
import { InvoicePDF } from "@/components/invoice-pdf"
import { PDFGenerator } from "@/components/pdf-generator"

interface InvoiceDetailsProps {
  invoiceId: string
  onClose?: () => void
}

export function InvoiceDetails({ invoiceId, onClose }: InvoiceDetailsProps) {
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const data = await getInvoice(invoiceId)
        setInvoice(data)
      } catch (err) {
        console.error("Error fetching invoice data:", err)
        setError("Không thể tải thông tin hóa đơn. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoiceData()
  }, [invoiceId])

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

  if (error || !invoice) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error || "Không tìm thấy thông tin hóa đơn"}</div>
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
          <CardTitle>Chi tiết hóa đơn #{invoice.id}</CardTitle>
          <CardDescription>Ngày tạo: {invoice.date}</CardDescription>
        </div>
        <PDFGenerator
          documentTitle={`Hóa đơn #${invoice.id}`}
          trigger={
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
          }
        >
          <InvoicePDF invoice={invoice} />
        </PDFGenerator>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-medium">Thông tin khách hàng</h3>
            <p className="mt-1 text-sm">{invoice.customer}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Người tạo hóa đơn</h3>
            <p className="mt-1 text-sm">{invoice.employee}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Phương thức thanh toán</h3>
            <p className="mt-1 text-sm">{invoice.paymentMethod}</p>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="mb-2 text-sm font-medium">Danh sách thuốc</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: any, index: number) => (
                  <TableRow key={item.id || index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.medicineName}</TableCell>
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
            <span className="font-bold">{formatCurrency(invoice.total)} đ</span>
          </div>
        </div>

        {invoice.note && (
          <div>
            <h3 className="text-sm font-medium">Ghi chú</h3>
            <p className="mt-1 text-sm">{invoice.note}</p>
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
