"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, RefreshCw, MoreHorizontal } from "lucide-react"
import { MedicineDetails } from "@/components/medicine-details"
import { Pagination } from "@/components/pagination"
import { toast } from "@/components/ui/use-toast"
import { fetchInventory, fetchInventoryLogs, adjustInventory, fetchMedicines } from "@/lib/local-storage-api"

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [logCurrentPage, setLogCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogPages, setTotalLogPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLogLoading, setIsLogLoading] = useState(true)
  const [lowStockCount, setLowStockCount] = useState(0)
  const [expiringCount, setExpiringCount] = useState(0)
  const [adjustData, setAdjustData] = useState({
    medicineId: "",
    adjustType: "add",
    quantity: 1,
    reason: "",
  })
  const itemsPerPage = 5
  const logsPerPage = 5

  // Lấy danh sách kho hàng
  const loadInventory = async () => {
    try {
      setIsLoading(true)
      const data = await fetchInventory({
        search: searchTerm,
        category: categoryFilter !== "all" ? categoryFilter : "",
        stock: stockFilter !== "all" ? stockFilter : "",
        page: currentPage,
        limit: itemsPerPage,
      })

      console.log("Inventory data:", data.inventory) // Debug log

      // Kết hợp dữ liệu từ inventory với medicines để có thông tin đầy đủ
      const enhancedInventory = data.inventory.map((item: any) => {
        const medicine = medicines.find((m) => m.id === item.medicineId) || {}
        return {
          ...item,
          name: item.medicineName || medicine.name,
          lotNumber: item.batchNumber || medicine.lotNumber,
          stock: item.quantity || medicine.stock,
          supplier: medicine.manufacturer || "N/A",
          lastUpdated: new Date(medicine.updatedAt || Date.now()).toLocaleDateString("vi-VN"),
        }
      })

      setInventoryItems(enhancedInventory)
      setTotalPages(data.pagination?.totalPages || 1)

      // Đếm số lượng sản phẩm sắp hết hàng và sắp hết hạn
      const lowStockItems = enhancedInventory.filter((item: any) => item.stock <= 10)
      setLowStockCount(lowStockItems.length)

      const today = new Date()
      const oneMonthLater = new Date()
      oneMonthLater.setMonth(today.getMonth() + 1)

      const expiringItems = enhancedInventory.filter((item: any) => {
        if (!item.expiryDate) return false
        const expiryDate = new Date(item.expiryDate)
        return expiryDate <= oneMonthLater
      })
      setExpiringCount(expiringItems.length)
    } catch (error) {
      console.error("Error loading inventory:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu kho hàng.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Lấy danh sách nhật ký kho
  const loadInventoryLogs = async () => {
    try {
      setIsLogLoading(true)
      const data = await fetchInventoryLogs({
        page: logCurrentPage,
        limit: logsPerPage,
      })

      console.log("Inventory logs:", data.logs) // Debug log

      // Đảm bảo dữ liệu logs có đầy đủ thông tin
      const enhancedLogs = data.logs.map((log: any) => {
        return {
          ...log,
          medicine: log.medicineName || "N/A",
          reference: log.note || "N/A",
          employee: log.userName || "Admin",
        }
      })

      setLogs(enhancedLogs)
      setTotalLogPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error loading inventory logs:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải nhật ký kho hàng.",
        variant: "destructive",
      })
    } finally {
      setIsLogLoading(false)
    }
  }

  // Lấy danh sách thuốc cho dropdown
  const loadMedicines = async () => {
    try {
      const data = await fetchMedicines({
        limit: 100, // Lấy tối đa 100 thuốc
      })
      setMedicines(data.medicines)
    } catch (error) {
      console.error("Error loading medicines:", error)
    }
  }

  // Tải danh sách thuốc khi component mount
  useEffect(() => {
    loadMedicines()
  }, [])

  // Tải lại dữ liệu khi thay đổi tìm kiếm, bộ lọc hoặc trang
  useEffect(() => {
    if (medicines.length > 0) {
      loadInventory()
    }
  }, [searchTerm, categoryFilter, stockFilter, currentPage, activeTab, medicines])

  // Tải lại nhật ký kho khi thay đổi trang
  useEffect(() => {
    loadInventoryLogs()
  }, [logCurrentPage])

  // Tải danh sách thuốc khi mở dialog điều chỉnh kho
  useEffect(() => {
    if (isAdjustDialogOpen) {
      loadMedicines()
    }
  }, [isAdjustDialogOpen])

  const handleViewMedicine = (medicineId: string) => {
    setSelectedMedicine(medicineId)
    setIsViewDialogOpen(true)
  }

  const handleAdjustInventory = () => {
    setAdjustData({
      medicineId: "",
      adjustType: "add",
      quantity: 1,
      reason: "",
    })
    setIsAdjustDialogOpen(true)
  }

  const handleViewLog = () => {
    loadInventoryLogs()
    setIsLogDialogOpen(true)
  }

  const handleAdjustChange = (field: string, value: any) => {
    setAdjustData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAdjustSubmit = async () => {
    try {
      if (!adjustData.medicineId) {
        toast({
          title: "Lỗi",
          description: "Vui lòng chọn thuốc cần điều chỉnh.",
          variant: "destructive",
        })
        return
      }

      if (adjustData.quantity <= 0) {
        toast({
          title: "Lỗi",
          description: "Số lượng phải lớn hơn 0.",
          variant: "destructive",
        })
        return
      }

      const selectedMedicine = medicines.find((m) => m.id === adjustData.medicineId)
      if (!selectedMedicine) return

      // Gọi API điều chỉnh kho
      await adjustInventory({
        medicineId: adjustData.medicineId,
        adjustType: adjustData.adjustType,
        quantity: adjustData.quantity,
        reason: adjustData.reason || "Điều chỉnh kho",
      })

      setIsAdjustDialogOpen(false)
      toast({
        title: "Điều chỉnh kho thành công",
        description: `Số lượng thuốc ${selectedMedicine.name} đã được cập nhật.`,
      })

      // Tải lại dữ liệu kho hàng
      loadInventory()
      loadInventoryLogs()
    } catch (error) {
      console.error("Error adjusting inventory:", error)
      toast({
        title: "Lỗi",
        description: "Không thể điều chỉnh kho hàng.",
        variant: "destructive",
      })
    }
  }

  // Hàm kiểm tra và định dạng quantity
  const formatQuantity = (quantity: any) => {
    if (typeof quantity === "string") {
      return quantity
    }
    // Nếu là số, chuyển thành chuỗi
    return String(quantity)
  }

  // Hàm kiểm tra xem quantity có bắt đầu bằng "+" hay không
  const isPositiveQuantity = (quantity: any) => {
    const quantityStr = formatQuantity(quantity)
    return quantityStr.startsWith("+")
  }

  return (
    <>
      <Header title="Quản lý kho hàng" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quản lý kho hàng</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-1" onClick={handleAdjustInventory}>
              <RefreshCw className="h-4 w-4" />
              Điều chỉnh kho
            </Button>
            <Button variant="outline" className="flex items-center gap-1" onClick={handleViewLog}>
              <Search className="h-4 w-4" />
              Xem nhật ký kho
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="low-stock" className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-amber-100 text-amber-800 rounded-full text-xs">
                {lowStockCount}
              </span>
              <span>Sắp hết hàng</span>
            </TabsTrigger>
            <TabsTrigger value="expiring" className="flex items-center gap-1">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-red-100 text-red-800 rounded-full text-xs">
                {expiringCount}
              </span>
              <span>Sắp hết hạn</span>
            </TabsTrigger>
          </TabsList>

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
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Lọc theo tồn kho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="low">Tồn kho thấp (≤ 10)</SelectItem>
                    <SelectItem value="medium">Tồn kho trung bình (11-50)</SelectItem>
                    <SelectItem value="high">Tồn kho cao ({">"}50)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground flex items-center">
                  Hiển thị: {inventoryItems.length} thuốc
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left font-medium p-3">Mã thuốc</th>
                    <th className="text-left font-medium p-3">Tên thuốc</th>
                    <th className="text-left font-medium p-3">Danh mục</th>
                    <th className="text-center font-medium p-3">Số lô</th>
                    <th className="text-center font-medium p-3">Tồn kho</th>
                    <th className="text-center font-medium p-3">Hạn sử dụng</th>
                    <th className="text-left font-medium p-3">Nhà sản xuất</th>
                    <th className="text-center font-medium p-3">Cập nhật cuối</th>
                    <th className="text-center font-medium p-3">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-4">
                        Không tìm thấy thuốc nào
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-3">{item.id}</td>
                        <td className="p-3">{item.name}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3 text-center">{item.lotNumber || "N/A"}</td>
                        <td className="p-3 text-center">
                          <span className={item.stock <= 10 ? "text-amber-500 font-medium" : ""}>{item.stock}</span>
                          {item.stock <= 10 && (
                            <span className="ml-1 inline-block px-1.5 py-0.5 bg-amber-50 text-amber-500 text-xs rounded-sm">
                              Sắp hết
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={
                              item.expiryDate &&
                              new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            {item.expiryDate || "N/A"}
                          </span>
                          {item.expiryDate &&
                            new Date(item.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                              <span className="ml-1 inline-block px-1.5 py-0.5 bg-red-50 text-red-500 text-xs rounded-sm">
                                Sắp hết hạn
                              </span>
                            )}
                        </td>
                        <td className="p-3">{item.supplier || "N/A"}</td>
                        <td className="p-3 text-center">{item.lastUpdated || "N/A"}</td>
                        <td className="p-3 text-center">
                          <Button variant="ghost" size="icon" onClick={() => handleViewMedicine(item.id)}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Xem chi tiết</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang cho kho hàng */}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>

          <TabsContent value="all">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-medium">Nhật ký thay đổi kho</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left font-medium p-3">Thời gian</th>
                      <th className="text-left font-medium p-3">Thuốc</th>
                      <th className="text-center font-medium p-3">Loại</th>
                      <th className="text-center font-medium p-3">Số lượng</th>
                      <th className="text-left font-medium p-3">Tham chiếu</th>
                      <th className="text-left font-medium p-3">Nhân viên</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLogLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4">
                          Đang tải dữ liệu...
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center p-4">
                          Không có nhật ký nào
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="border-t">
                          <td className="p-3">{log.date}</td>
                          <td className="p-3">{log.medicine}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                log.type === "Nhập kho"
                                  ? "bg-green-100 text-green-800"
                                  : log.type === "Bán hàng"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {log.type}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={isPositiveQuantity(log.quantity) ? "text-green-500" : "text-blue-500"}>
                              {formatQuantity(log.quantity)}
                            </span>
                          </td>
                          <td className="p-3">{log.reference}</td>
                          <td className="p-3">{log.employee}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Phân trang cho nhật ký */}
              {totalLogPages > 1 && (
                <Pagination currentPage={logCurrentPage} totalPages={totalLogPages} onPageChange={setLogCurrentPage} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog xem chi tiết thuốc */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết thuốc</DialogTitle>
          </DialogHeader>
          <MedicineDetails medicineId={selectedMedicine || ""} />
        </DialogContent>
      </Dialog>

      {/* Dialog điều chỉnh kho */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Điều chỉnh kho hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="medicine">Chọn thuốc</Label>
              <Select value={adjustData.medicineId} onValueChange={(value) => handleAdjustChange("medicineId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thuốc cần điều chỉnh" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name} - Tồn kho: {medicine.stock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustType">Loại điều chỉnh</Label>
              <Select value={adjustData.adjustType} onValueChange={(value) => handleAdjustChange("adjustType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại điều chỉnh" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Thêm vào kho</SelectItem>
                  <SelectItem value="subtract">Trừ khỏi kho</SelectItem>
                  <SelectItem value="set">Đặt giá trị mới</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={adjustData.quantity}
                onChange={(e) => handleAdjustChange("quantity", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Lý do điều chỉnh</Label>
              <Textarea
                id="reason"
                rows={2}
                placeholder="Nhập lý do điều chỉnh kho hàng"
                value={adjustData.reason}
                onChange={(e) => handleAdjustChange("reason", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleAdjustSubmit}>Lưu thay đổi</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xem nhật ký kho */}
      <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Nhật ký kho hàng</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input type="search" placeholder="Tìm theo tên thuốc..." className="pl-8" />
              </div>
              <Select>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Loại thao tác" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="import">Nhập kho</SelectItem>
                  <SelectItem value="sale">Bán hàng</SelectItem>
                  <SelectItem value="adjust">Điều chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left font-medium p-3">Thời gian</th>
                    <th className="text-left font-medium p-3">Thuốc</th>
                    <th className="text-center font-medium p-3">Loại</th>
                    <th className="text-center font-medium p-3">Số lượng</th>
                    <th className="text-left font-medium p-3">Tham chiếu</th>
                    <th className="text-left font-medium p-3">Nhân viên</th>
                  </tr>
                </thead>
                <tbody>
                  {isLogLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-4">
                        Không có nhật ký nào
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-t">
                        <td className="p-3">{log.date}</td>
                        <td className="p-3">{log.medicine}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                              log.type === "Nhập kho"
                                ? "bg-green-100 text-green-800"
                                : log.type === "Bán hàng"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={isPositiveQuantity(log.quantity) ? "text-green-500" : "text-blue-500"}>
                            {formatQuantity(log.quantity)}
                          </span>
                        </td>
                        <td className="p-3">{log.reference}</td>
                        <td className="p-3">{log.employee}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsLogDialogOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
