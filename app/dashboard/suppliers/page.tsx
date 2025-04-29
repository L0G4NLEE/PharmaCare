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
import { SupplierForm } from "@/components/forms/supplier-form"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/api/supplier"

// Định nghĩa kiểu dữ liệu cho nhà cung cấp
interface Supplier {
  id: string
  code: string
  name: string
  phone: string
  email: string
  address: string
  contactPerson: string
  taxCode: string
}

// Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
// const initialSuppliers: Supplier[] = [
//   {
//     id: "SUP-1001",
//     code: "SUP-1001",
//     name: "Công ty Dược phẩm Hà Nội",
//     phone: "024 3825 7941",
//     email: "contact@hanoipharma.com",
//     address: "Số 2 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
//     contactPerson: "Nguyễn Văn A",
//     taxCode: "0100107518",
//   },
//   {
//     id: "SUP-1002",
//     code: "SUP-1002",
//     name: "Công ty CP Dược phẩm Imexpharm",
//     phone: "028 3829 7243",
//     email: "info@imexpharm.com",
//     address: "Số 4 Đường 30/4, Phường 1, TP Cao Lãnh, Đồng Tháp",
//     contactPerson: "Trần Thị B",
//     taxCode: "1400384433",
//   },
//   {
//     id: "SUP-1003",
//     code: "SUP-1003",
//     name: "Công ty CP Dược Hậu Giang",
//     phone: "0292 3891 433",
//     email: "dhgpharma@dhgpharma.com.vn",
//     address: "288 Bis Nguyễn Văn Cừ, An Hòa, Ninh Kiều, Cần Thơ",
//     contactPerson: "Lê Văn C",
//     taxCode: "1800156801",
//   },
// ]

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Lọc nhà cung cấp dựa trên tìm kiếm
  // const filteredSuppliers = suppliers.filter((supplier) => {
  //   return (
  //     supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     supplier.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  //   )
  // })

  // Tính toán số trang
  // const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)

  // Lấy nhà cung cấp cho trang hiện tại
  // const currentSuppliers = filteredSuppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset về trang 1 khi thay đổi tìm kiếm
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleAddSupplier = () => {
    setIsAddDialogOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsEditDialogOpen(true)
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteDialogOpen(true)
  }

  // Lấy danh sách nhà cung cấp
  const loadSuppliers = async () => {
    try {
      setIsLoading(true)
      const response = await fetchSuppliers({
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage,
      })
      setSuppliers(response.suppliers || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading suppliers:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhà cung cấp.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadSuppliers()
  }, [searchTerm, currentPage])

  // Thay thế các hàm xử lý thêm, sửa, xóa nhà cung cấp
  const handleAddSuccess = async (newSupplier: Omit<Supplier, "id" | "code">) => {
    try {
      const createdSupplier = await createSupplier(newSupplier)
      setIsAddDialogOpen(false)
      toast({
        title: "Thêm nhà cung cấp mới thành công",
        description: `Nhà cung cấp ${createdSupplier.name} đã được thêm vào hệ thống.`,
      })
      loadSuppliers()
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhà cung cấp mới.",
        variant: "destructive",
      })
    }
  }

  const handleEditSuccess = async (updatedSupplier: Omit<Supplier, "id" | "code">) => {
    try {
      if (!selectedSupplier) return

      const updated = await updateSupplier(selectedSupplier.id, updatedSupplier)
      setIsEditDialogOpen(false)
      toast({
        title: "Cập nhật nhà cung cấp thành công",
        description: `Nhà cung cấp ${updated.name} đã được cập nhật.`,
      })
      loadSuppliers()
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật nhà cung cấp.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteSupplier = async () => {
    try {
      if (!selectedSupplier) return

      await deleteSupplier(selectedSupplier.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Xóa nhà cung cấp thành công",
        description: `Nhà cung cấp ${selectedSupplier.name} đã được xóa khỏi hệ thống.`,
      })
      loadSuppliers()
    } catch (error) {
      console.error("Error deleting supplier:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhà cung cấp.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header title="Quản lý nhà cung cấp" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quản lý nhà cung cấp</h1>
          <Button className="flex items-center gap-1" onClick={handleAddSupplier}>
            <Plus className="h-4 w-4" />
            Thêm nhà cung cấp mới
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-medium">Tìm kiếm nhà cung cấp</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên, mã, số điện thoại hoặc email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                Hiển thị: {suppliers.length} nhà cung cấp
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium p-3">Mã nhà cung cấp</th>
                  <th className="text-left font-medium p-3">Tên nhà cung cấp</th>
                  <th className="text-left font-medium p-3">Số điện thoại</th>
                  <th className="text-left font-medium p-3">Email</th>
                  <th className="text-left font-medium p-3">Địa chỉ</th>
                  <th className="text-left font-medium p-3">Người liên hệ</th>
                  <th className="text-center font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4">
                      Không tìm thấy nhà cung cấp nào
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-t">
                      <td className="p-3">{supplier.code}</td>
                      <td className="p-3">{supplier.name}</td>
                      <td className="p-3">{supplier.phone}</td>
                      <td className="p-3">{supplier.email}</td>
                      <td className="p-3">{supplier.address}</td>
                      <td className="p-3">{supplier.contactPerson}</td>
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
                            <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteSupplier(supplier)}>
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

      {/* Dialog thêm nhà cung cấp mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm nhà cung cấp mới</DialogTitle>
          </DialogHeader>
          <SupplierForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa nhà cung cấp */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhà cung cấp</DialogTitle>
          </DialogHeader>
          <SupplierForm
            supplier={selectedSupplier}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa nhà cung cấp */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedSupplier?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteSupplier}
        variant="destructive"
      />
    </>
  )
}
