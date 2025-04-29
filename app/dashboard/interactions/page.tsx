"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Plus, Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InteractionForm } from "@/components/forms/interaction-form"
import { toast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Pagination } from "@/components/pagination"
import {
  fetchInteractions,
  checkInteraction,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  fetchMedicines,
} from "@/lib/api-client"

interface Interaction {
  id: string
  medicine1: string
  medicine2: string
  severity: string
  description: string
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [medicine1, setMedicine1] = useState("")
  const [medicine2, setMedicine2] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedInteraction, setSelectedInteraction] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const itemsPerPage = 5

  // Lấy danh sách thuốc
  const loadMedicines = async () => {
    try {
      const data = await fetchMedicines({ limit: 100 })
      setMedicines(data.medicines)
    } catch (error) {
      console.error("Error loading medicines:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thuốc.",
        variant: "destructive",
      })
    }
  }

  // Lấy danh sách tương tác thuốc
  const loadInteractions = async () => {
    try {
      setIsLoading(true)
      const data = await fetchInteractions({
        search: searchTerm,
        severity: severityFilter === "all" ? "" : severityFilter,
        page: currentPage,
        limit: itemsPerPage,
      })
      setInteractions(data.interactions || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading interactions:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tương tác thuốc.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Tải dữ liệu ban đầu
  useEffect(() => {
    loadMedicines()
  }, [])

  // Tải lại danh sách khi thay đổi tìm kiếm, bộ lọc hoặc trang
  useEffect(() => {
    loadInteractions()
  }, [searchTerm, severityFilter, currentPage])

  const handleCheckInteraction = async () => {
    if (!medicine1 || !medicine2) {
      toast({
        title: "Vui lòng chọn đủ hai loại thuốc",
        variant: "destructive",
      })
      return
    }

    if (medicine1 === medicine2) {
      toast({
        title: "Vui lòng chọn hai loại thuốc khác nhau",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await checkInteraction(medicine1, medicine2)

      if (result.found) {
        const interaction = result.interaction
        toast({
          title: `Phát hiện tương tác ${interaction.severity.toLowerCase()}`,
          description: interaction.description,
          variant: interaction.severity === "Nghiêm trọng" ? "destructive" : "default",
        })
      } else {
        toast({
          title: "Không phát hiện tương tác",
          description: "Không tìm thấy tương tác giữa hai loại thuốc này trong cơ sở dữ liệu.",
        })
      }
    } catch (error) {
      console.error("Error checking interaction:", error)
      toast({
        title: "Lỗi",
        description: "Không thể kiểm tra tương tác thuốc.",
        variant: "destructive",
      })
    }
  }

  const handleAddInteraction = () => {
    setIsAddDialogOpen(true)
  }

  const handleEditInteraction = (interaction: Interaction) => {
    setSelectedInteraction(interaction)
    setIsEditDialogOpen(true)
  }

  const handleDeleteInteraction = (interaction: Interaction) => {
    setSelectedInteraction(interaction)
    setIsDeleteDialogOpen(true)
  }

  const handleAddSuccess = async (newInteraction: any) => {
    try {
      await createInteraction(newInteraction)
      setIsAddDialogOpen(false)
      toast({
        title: "Thêm tương tác thuốc mới thành công",
        description: `Tương tác giữa ${newInteraction.medicine1} và ${newInteraction.medicine2} đã được thêm vào hệ thống.`,
      })
      loadInteractions()
    } catch (error) {
      console.error("Error adding interaction:", error)
      toast({
        title: "Lỗi",
        description: "Không thể thêm tương tác thuốc.",
        variant: "destructive",
      })
    }
  }

  const handleEditSuccess = async (updatedInteraction: any) => {
    try {
      await updateInteraction(selectedInteraction.id, updatedInteraction)
      setIsEditDialogOpen(false)
      toast({
        title: "Cập nhật tương tác thuốc thành công",
        description: `Tương tác giữa ${updatedInteraction.medicine1} và ${updatedInteraction.medicine2} đã được cập nhật.`,
      })
      loadInteractions()
    } catch (error) {
      console.error("Error updating interaction:", error)
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tương tác thuốc.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteInteraction = async () => {
    try {
      await deleteInteraction(selectedInteraction.id)
      setIsDeleteDialogOpen(false)
      toast({
        title: "Xóa tương tác thuốc thành công",
        description: `Tương tác giữa ${selectedInteraction.medicine1} và ${selectedInteraction.medicine2} đã được xóa khỏi hệ thống.`,
      })
      loadInteractions()
    } catch (error) {
      console.error("Error deleting interaction:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa tương tác thuốc.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Header title="Quản lý tương tác thuốc" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quản lý tương tác thuốc</h1>
          <Button className="flex items-center gap-1" onClick={handleAddInteraction}>
            <Plus className="h-4 w-4" />
            Thêm tương tác mới
          </Button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm mb-6">
          <div className="p-4 border-b">
            <h2 className="font-medium">Kiểm tra tương tác thuốc</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Chọn hai loại thuốc để kiểm tra tương tác có thể xảy ra
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={medicine1} onValueChange={setMedicine1}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thuốc thứ nhất" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.name}>
                    {medicine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={medicine2} onValueChange={setMedicine2}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn thuốc thứ hai" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.name}>
                    {medicine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleCheckInteraction} disabled={!medicine1 || !medicine2}>
              Kiểm tra tương tác
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <h2 className="font-medium">Tìm kiếm và lọc</h2>
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Tìm theo tên thuốc..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Lọc theo mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="Nhẹ">Nhẹ</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Nghiêm trọng">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                Hiển thị: {interactions.length} tương tác
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left font-medium p-3">Thuốc</th>
                  <th className="text-left font-medium p-3">Tương tác với</th>
                  <th className="text-center font-medium p-3">Mức độ</th>
                  <th className="text-left font-medium p-3">Mô tả</th>
                  <th className="text-center font-medium p-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : interactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-4">
                      Không tìm thấy tương tác thuốc nào
                    </td>
                  </tr>
                ) : (
                  interactions.map((interaction) => (
                    <tr key={interaction.id} className="border-t">
                      <td className="p-3">{interaction.medicine1}</td>
                      <td className="p-3">{interaction.medicine2}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            interaction.severity === "Nghiêm trọng"
                              ? "bg-red-100 text-red-800"
                              : interaction.severity === "Trung bình"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {interaction.severity === "Nghiêm trọng" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {interaction.severity}
                        </span>
                      </td>
                      <td className="p-3">{interaction.description}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditInteraction(interaction)}>
                            Chỉnh sửa
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteInteraction(interaction)}
                          >
                            Xóa
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

      {/* Dialog thêm tương tác mới */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm tương tác thuốc mới</DialogTitle>
          </DialogHeader>
          <InteractionForm
            medicines={medicines}
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa tương tác */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tương tác thuốc</DialogTitle>
          </DialogHeader>
          <InteractionForm
            medicines={medicines}
            interaction={selectedInteraction}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa tương tác */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa tương tác thuốc"
        description={`Bạn có chắc chắn muốn xóa tương tác giữa "${selectedInteraction?.medicine1}" và "${selectedInteraction?.medicine2}" không? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteInteraction}
        variant="destructive"
      />
    </>
  )
}
