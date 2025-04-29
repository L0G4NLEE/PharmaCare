"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Search } from "lucide-react"
import { CustomerForm } from "@/components/forms/customer-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import { fetchCustomers, deleteCustomer } from "@/lib/api-client"

interface Customer {
  id: string
  code: string
  name: string
  phone: string
  email: string
  address: string
  birthdate?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isViewPurchaseHistoryOpen, setIsViewPurchaseHistoryOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Lấy danh sách khách hàng
  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetchCustomers({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      })

      // Đảm bảo cấu trúc dữ liệu trả về đúng
      setCustomers(response.customers || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading customers:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khách hàng.",
        variant: "destructive",
      })
      setCustomers([])
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }

  // Tải lại danh sách khi thay đổi tìm kiếm hoặc trang
  useEffect(() => {
    loadCustomers()
  }, [searchTerm, currentPage])

  const handleAddCustomer = () => {
    setIsAddDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleViewPurchaseHistory = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsViewPurchaseHistoryOpen(true)
  }

  const handleAddSuccess = (newCustomer: any) => {
    setIsAddDialogOpen(false)
    toast({
      title: "Thêm khách hàng mới thành công",
      description: `Khách hàng ${newCustomer.name} đã được thêm vào hệ thống.`,
    })
    loadCustomers()
  }

  const handleEditSuccess = (updatedCustomer: any) => {
    setIsEditDialogOpen(false)
    toast({
      title: "Cập nhật khách hàng thành công",
      description: `Khách hàng ${updatedCustomer.name} đã được cập nhật.`,
    })
    loadCustomers()
  }

  const confirmDeleteCustomer = async () => {
    try {
      if (selectedCustomer) {
        await deleteCustomer(selectedCustomer.id)
        setIsDeleteDialogOpen(false)
        toast({
          title: "Xóa khách hàng thành công",
          description: `Khách hàng ${selectedCustomer.name} đã được xóa khỏi hệ thống.`,
        })
        loadCustomers()
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa khách hàng.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header title="Quản lý khách hàng" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quản lý khách hàng</h1>
          <Button className="flex items-center gap-1" onClick={handleAddCustomer}>
            <Plus className="h-4 w-4" />
            Thêm khách hàng mới
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-medium">Tìm kiếm khách hàng</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên, số điện thoại hoặc email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                Hiển thị: {customers.length} khách hàng
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium p-3">ID</th>
                  <th className="text-left font-medium p-3">Tên khách hàng</th>
                  <th className="text-left font-medium p-3">Số điện thoại</th>
                  <th className="text-left font-medium p-3">Email</th>
                  <th className="text-left font-medium p-3">Địa chỉ</th>
                  <th className="text-center font-medium p-3">Ngày sinh</th>
                  <th className="text-center font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Không tìm thấy khách hàng nào
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-t">
                      <td className="p-3">{customer.code}</td>
                      <td className="p-3">{customer.name}</td>
                      <td className="p-3">{customer.phone || "-"}</td>
                      <td className="p-3">{customer.email || "-"}</td>
                      <td className="p-3">{customer.address || "-"}</td>
                      <td className="p-3 text-center">
                        {customer.birthdate ? new Date(customer.birthdate).toLocaleDateString("vi-VN") : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewPurchaseHistory(customer)}>
                              Xem lịch sử mua hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteCustomer(customer)}>
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Dialog thêm khách hàng mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
          </DialogHeader>
          <CustomerForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa khách hàng */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xem lịch sử mua hàng */}
      <Dialog open={isViewPurchaseHistoryOpen} onOpenChange={setIsViewPurchaseHistoryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lịch sử mua hàng - {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Mã hóa đơn</th>
                    <th className="text-left font-medium p-2">Ngày mua</th>
                    <th className="text-right font-medium p-2">Tổng tiền</th>
                    <th className="text-center font-medium p-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Trong thực tế, dữ liệu này sẽ được lấy từ API */}
                  <tr className="border-b">
                    <td className="p-2">INV-00234</td>
                    <td className="p-2">15/07/2023 12:45</td>
                    <td className="p-2 text-right">350.000 đ</td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">INV-00220</td>
                    <td className="p-2">10/07/2023 09:30</td>
                    <td className="p-2 text-right">180.000 đ</td>
                    <td className="p-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsViewPurchaseHistoryOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa khách hàng */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa khách hàng"
        description={`Bạn có chắc chắn muốn xóa khách hàng "${selectedCustomer?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteCustomer}
        variant="destructive"
      />
    </>
  )
}
