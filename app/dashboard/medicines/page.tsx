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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Search } from "lucide-react"
import { MedicineForm } from "@/components/forms/medicine-form"
import { MedicineDetails } from "@/components/medicine-details"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import { fetchMedicines, deleteMedicine } from "@/lib/api-client"

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Lấy danh sách thuốc
  const loadMedicines = async () => {
    try {
      setIsLoading(true)
      const response = await fetchMedicines({
        search: searchTerm,
        category: categoryFilter !== "all" ? categoryFilter : "",
        page: currentPage,
        limit: itemsPerPage,
      })

      setMedicines(response.medicines || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading medicines:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thuốc.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Tải lại danh sách khi thay đổi tìm kiếm, bộ lọc hoặc trang
  useEffect(() => {
    loadMedicines()
  }, [searchTerm, categoryFilter, currentPage])

  const handleAddMedicine = () => {
    setIsAddDialogOpen(true)
  }

  const handleEditMedicine = (medicine: any) => {
    setSelectedMedicine(medicine)
    setIsEditDialogOpen(true)
  }

  const handleViewMedicine = (medicine: any) => {
    setSelectedMedicine(medicine)
    setIsViewDialogOpen(true)
  }

  const handleDeleteMedicine = (medicine: any) => {
    setSelectedMedicine(medicine)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSuccess = (newMedicine: any) => {
    setIsAddDialogOpen(false)
    toast({
      title: "Thêm thuốc mới thành công",
      description: `Thuốc ${newMedicine.name} đã được thêm vào hệ thống.`,
    })
    loadMedicines()
  }

  const handleEditSuccess = (updatedMedicine: any) => {
    setIsEditDialogOpen(false)
    toast({
      title: "Cập nhật thuốc thành công",
      description: `Thuốc ${updatedMedicine.name} đã được cập nhật.`,
    })
    loadMedicines()
  }

  const confirmDeleteMedicine = async () => {
    try {
      await deleteMedicine(selectedMedicine.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Xóa thuốc thành công",
        description: `Thuốc ${selectedMedicine.name} đã được xóa khỏi hệ thống.`,
      })
      loadMedicines()
    } catch (error) {
      console.error("Error deleting medicine:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa thuốc.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header title="Quản lý thuốc" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quản lý thuốc</h1>
          <Button className="flex items-center gap-1" onClick={handleAddMedicine}>
            <Plus className="h-4 w-4" />
            Thêm thuốc mới
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
                  placeholder="Tìm theo tên hoặc mã thuốc..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Lọc theo danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="Thuốc giảm đau">Thuốc giảm đau</SelectItem>
                  <SelectItem value="Vitamin & Thực phẩm chức năng">Vitamin & Thực phẩm chức năng</SelectItem>
                  <SelectItem value="Kháng sinh">Kháng sinh</SelectItem>
                  <SelectItem value="Thuốc đường tiêu hóa">Thuốc đường tiêu hóa</SelectItem>
                  <SelectItem value="Thuốc kháng dị ứng">Thuốc kháng dị ứng</SelectItem>
                  <SelectItem value="Thuốc đái tháo đường">Thuốc đái tháo đường</SelectItem>
                  <SelectItem value="Thuốc tim mạch">Thuốc tim mạch</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">Hiển thị: {medicines.length} thuốc</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium p-3">Mã thuốc</th>
                  <th className="text-left font-medium p-3">Tên thuốc</th>
                  <th className="text-left font-medium p-3">Danh mục</th>
                  <th className="text-right font-medium p-3">Giá bán</th>
                  <th className="text-center font-medium p-3">Tồn kho</th>
                  <th className="text-center font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-4">
                      Không tìm thấy thuốc nào
                    </td>
                  </tr>
                ) : (
                  medicines.map((medicine) => (
                    <tr key={medicine.id} className="border-t">
                      <td className="p-3">{medicine.code}</td>
                      <td className="p-3">{medicine.name}</td>
                      <td className="p-3">{medicine.category}</td>
                      <td className="p-3 text-right">{medicine.retailPrice?.toLocaleString("vi-VN") || 0} đ</td>
                      <td className="p-3 text-center">
                        <span className={medicine.stock <= 10 ? "text-amber-500 font-medium" : ""}>
                          {medicine.stock}
                        </span>
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
                            <DropdownMenuItem onClick={() => handleViewMedicine(medicine)}>
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditMedicine(medicine)}>Chỉnh sửa</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteMedicine(medicine)}>
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

      {/* Dialog thêm thuốc mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm thuốc mới</DialogTitle>
          </DialogHeader>
          <MedicineForm onSuccess={handleAddSuccess} onCancel={() => setIsAddDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa thuốc */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thuốc</DialogTitle>
          </DialogHeader>
          <MedicineForm
            medicine={selectedMedicine}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xem chi tiết thuốc */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thuốc</DialogTitle>
          </DialogHeader>
          <MedicineDetails medicineId={selectedMedicine?.id} />
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa thuốc */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa thuốc"
        description={`Bạn có chắc chắn muốn xóa thuốc "${selectedMedicine?.name}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteMedicine}
        variant="destructive"
      />
    </>
  )
}
