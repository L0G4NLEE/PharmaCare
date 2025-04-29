"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CalendarIcon, Plus, Search, MoreHorizontal, FileText } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { InvoiceDetails } from "@/components/invoice-details"
import { InvoiceForm } from "@/components/forms/invoice-form"
import { PDFGenerator } from "@/components/pdf-generator"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Pagination } from "@/components/pagination"
import { fetchInvoices, createInvoice, deleteInvoice } from "@/lib/api-client"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date>()
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Lấy danh sách hóa đơn
  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      const dateParam = date ? format(date, "yyyy-MM-dd") : undefined
      const data = await fetchInvoices({
        search: searchTerm,
        date: dateParam,
        page: currentPage,
        limit: itemsPerPage,
      })
      setInvoices(data.invoices || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading invoices:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách hóa đơn.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Tải lại danh sách khi thay đổi tìm kiếm, ngày hoặc trang
  useEffect(() => {
    loadInvoices()
  }, [searchTerm, date, currentPage])

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewDialogOpen(true)
  }

  const handlePrintInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsPrintDialogOpen(true)
  }

  const handleDeleteInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSuccess = async (newInvoice: any) => {
    try {
      await createInvoice(newInvoice)
      setIsAddDialogOpen(false)
      toast({
        title: "Tạo hóa đơn mới thành công",
        description: `Hóa đơn đã được tạo thành công.`,
      })
      loadInvoices()
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo hóa đơn mới.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteInvoice = async () => {
    try {
      await deleteInvoice(selectedInvoice.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Xóa hóa đơn thành công",
        description: `Hóa đơn ${selectedInvoice.id} đã được xóa khỏi hệ thống.`,
      })
      loadInvoices()
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa hóa đơn.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header title="Hóa đơn bán hàng" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Hóa đơn bán hàng</h1>
          <Button className="flex items-center gap-1" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Tạo hóa đơn mới
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-medium">Tìm kiếm và lọc</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Tìm theo mã hoặc tên khách hàng..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full md:w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
              <div className="text-sm text-muted-foreground flex items-center">Hiển thị: {invoices.length} hóa đơn</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium p-3">Mã hóa đơn</th>
                  <th className="text-left font-medium p-3">Ngày tạo</th>
                  <th className="text-left font-medium p-3">Khách hàng</th>
                  <th className="text-left font-medium p-3">Nhân viên</th>
                  <th className="text-right font-medium p-3">Tổng tiền</th>
                  <th className="text-center font-medium p-3">Thanh toán</th>
                  <th className="text-center font-medium p-3">Trạng thái</th>
                  <th className="text-center font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Không tìm thấy hóa đơn nào
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t">
                      <td className="p-3">{invoice.id}</td>
                      <td className="p-3">{invoice.date}</td>
                      <td className="p-3">{invoice.customer}</td>
                      <td className="p-3">{invoice.employee}</td>
                      <td className="p-3 text-right">{formatCurrency(invoice.total)} đ</td>
                      <td className="p-3 text-center">{invoice.paymentMethod}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            invoice.status === "Hoàn thành"
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                            <Search className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handlePrintInvoice(invoice)}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">In hóa đơn</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteInvoice(invoice)}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Thêm thao tác</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </main>

      {/* Dialog xem chi tiết hóa đơn */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          <InvoiceDetails invoiceId={selectedInvoice?.id} />
        </DialogContent>
      </Dialog>

      {/* Dialog tạo hóa đơn mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tạo hóa đơn mới</DialogTitle>
          </DialogHeader>
          <InvoiceForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog in hóa đơn */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>In hóa đơn</DialogTitle>
          </DialogHeader>
          <PDFGenerator title={`Hóa đơn ${selectedInvoice?.id}`} filename={`hoa-don-${selectedInvoice?.id}`}>
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">PharmaCare</h2>
                  <p className="text-sm text-muted-foreground">456 Lê Lợi, Quận 1, TP.HCM</p>
                  <p className="text-sm text-muted-foreground">SĐT: 028 1234 5678</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-bold">HÓA ĐƠN BÁN HÀNG</h3>
                  <p className="text-sm">Mã hóa đơn: {selectedInvoice?.id}</p>
                  <p className="text-sm">Ngày: {selectedInvoice?.date}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tên khách hàng</p>
                    <p>{selectedInvoice?.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nhân viên bán hàng</p>
                    <p>{selectedInvoice?.employee}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Danh sách thuốc</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium py-2">STT</th>
                        <th className="text-left font-medium py-2">Tên thuốc</th>
                        <th className="text-right font-medium py-2">Đơn giá</th>
                        <th className="text-center font-medium py-2">Số lượng</th>
                        <th className="text-right font-medium py-2">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2">1</td>
                        <td className="py-2">Paracetamol 500mg</td>
                        <td className="py-2 text-right">15.000 đ</td>
                        <td className="py-2 text-center">2</td>
                        <td className="py-2 text-right">30.000 đ</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">2</td>
                        <td className="py-2">Vitamin C 1000mg</td>
                        <td className="py-2 text-right">80.000 đ</td>
                        <td className="py-2 text-center">1</td>
                        <td className="py-2 text-right">80.000 đ</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2">3</td>
                        <td className="py-2">Omeprazole 20mg</td>
                        <td className="py-2 text-right">120.000 đ</td>
                        <td className="py-2 text-center">2</td>
                        <td className="py-2 text-right">240.000 đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-start">
                <div>
                  <h3 className="font-medium mb-2">Ghi chú</h3>
                  <p className="text-sm italic">{selectedInvoice?.note || "Không có ghi chú"}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Phương thức thanh toán</p>
                    <p>{selectedInvoice?.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground">Tổng tiền</p>
                  <p className="text-xl font-bold">{formatCurrency(selectedInvoice?.total || 0)} đ</p>
                </div>
              </div>
            </div>
          </PDFGenerator>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa hóa đơn */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa hóa đơn"
        description={`Bạn có chắc chắn muốn xóa hóa đơn "${selectedInvoice?.id}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteInvoice}
        variant="destructive"
      />
    </>
  )
}
