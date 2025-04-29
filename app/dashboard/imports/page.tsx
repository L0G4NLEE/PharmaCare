"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImportForm } from "@/components/import-form"
import { fetchImports, deleteImport } from "@/lib/local-storage-api"
import { Pagination } from "@/components/pagination"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { Search, Plus, FileText, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ensureDataInitialized } from "@/lib/local-storage-helper"

export default function ImportsPage() {
  const [imports, setImports] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedImport, setSelectedImport] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [importToDelete, setImportToDelete] = useState<string | null>(null)

  useEffect(() => {
    // Đảm bảo dữ liệu đã được khởi tạo
    ensureDataInitialized()
    loadImports()
  }, [pagination.page, searchTerm])

  const loadImports = async () => {
    setLoading(true)
    try {
      const response = await fetchImports({
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit,
      })
      setImports(response.imports)
      setPagination(response.pagination)
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể tải dữ liệu phiếu nhập. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleCreateSuccess = () => {
    setShowForm(false)
    loadImports()
    toast({
      title: "Tạo phiếu nhập thành công",
      description: "Phiếu nhập mới đã được tạo thành công.",
    })
  }

  const handleUpdateSuccess = () => {
    setShowForm(false)
    setSelectedImport(null)
    loadImports()
    toast({
      title: "Cập nhật phiếu nhập thành công",
      description: "Phiếu nhập đã được cập nhật thành công.",
    })
  }

  const handleDelete = async () => {
    if (!importToDelete) return

    try {
      await deleteImport(importToDelete)
      loadImports()
      toast({
        title: "Xóa phiếu nhập thành công",
        description: "Phiếu nhập đã được xóa thành công.",
      })
    } catch (error) {
      console.error("Lỗi khi xóa phiếu nhập:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể xóa phiếu nhập. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setImportToDelete(null)
      setShowDeleteConfirm(false)
    }
  }

  const confirmDelete = (id: string) => {
    setImportToDelete(id)
    setShowDeleteConfirm(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy")
    } catch (error) {
      return dateString
    }
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">{selectedImport ? "Cập nhật phiếu nhập" : "Tạo phiếu nhập mới"}</h2>
          <ImportForm
            importData={selectedImport}
            onSuccess={selectedImport ? handleUpdateSuccess : handleCreateSuccess}
            onCancel={() => {
              setShowForm(false)
              setSelectedImport(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý nhập hàng</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Tạo phiếu nhập
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Tìm kiếm phiếu nhập..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Mã phiếu nhập</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nhà cung cấp</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ngày nhập</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : imports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center">
                    Không có phiếu nhập nào
                  </td>
                </tr>
              ) : (
                imports.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">{item.supplier}</td>
                    <td className="px-4 py-3">{formatDate(item.date)}</td>
                    <td className="px-4 py-3">{formatCurrency(item.total)} đ</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === "Hoàn thành" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedImport(item)
                            setShowForm(true)
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Xóa phiếu nhập"
        description="Bạn có chắc chắn muốn xóa phiếu nhập này? Hành động này không thể hoàn tác."
        onConfirm={handleDelete}
      />
    </div>
  )
}
