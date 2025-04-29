"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Trash2, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function PerformanceManager() {
  const [storageUsage, setStorageUsage] = useState<{
    used: number
    total: number
    percentage: number
    items: { key: string; size: number }[]
  }>({
    used: 0,
    total: 5 * 1024 * 1024, // 5MB
    percentage: 0,
    items: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Tính toán kích thước của localStorage
  const calculateStorageUsage = () => {
    try {
      setIsLoading(true)

      // Tổng kích thước có sẵn (ước tính)
      const totalSize = 5 * 1024 * 1024 // 5MB

      // Tính toán kích thước đã sử dụng
      let usedSize = 0
      const items: { key: string; size: number }[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          const value = localStorage.getItem(key) || ""
          const size = (key.length + value.length) * 2 // UTF-16 encoding (2 bytes per character)
          usedSize += size

          // Chỉ hiển thị các khóa liên quan đến ứng dụng
          if (key.startsWith("pharmacy_") || key.startsWith("__pharmacy_")) {
            items.push({ key, size })
          }
        }
      }

      // Sắp xếp theo kích thước (lớn nhất trước)
      items.sort((a, b) => b.size - a.size)

      setStorageUsage({
        used: usedSize,
        total: totalSize,
        percentage: (usedSize / totalSize) * 100,
        items,
      })
    } catch (e) {
      console.error("Error calculating storage usage:", e)
      toast({
        title: "Lỗi",
        description: "Không thể tính toán dung lượng lưu trữ.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa một mục trong localStorage
  const deleteItem = (key: string) => {
    try {
      localStorage.removeItem(key)
      toast({
        title: "Đã xóa",
        description: `Đã xóa mục "${key}" khỏi localStorage.`,
      })
      calculateStorageUsage() // Cập nhật lại thông tin sử dụng
    } catch (e) {
      console.error("Error deleting item:", e)
      toast({
        title: "Lỗi",
        description: "Không thể xóa mục khỏi localStorage.",
        variant: "destructive",
      })
    }
  }

  // Xóa tất cả dữ liệu trong localStorage
  const clearAllData = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.")) {
      try {
        localStorage.clear()
        toast({
          title: "Đã xóa tất cả dữ liệu",
          description: "Tất cả dữ liệu đã được xóa khỏi localStorage.",
        })
        calculateStorageUsage() // Cập nhật lại thông tin sử dụng
      } catch (e) {
        console.error("Error clearing all data:", e)
        toast({
          title: "Lỗi",
          description: "Không thể xóa tất cả dữ liệu.",
          variant: "destructive",
        })
      }
    }
  }

  // Định dạng kích thước
  const formatSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} bytes`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  // Tính toán kích thước khi component được tải
  useEffect(() => {
    calculateStorageUsage()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý hiệu suất</CardTitle>
        <CardDescription>
          Theo dõi và tối ưu hóa việc sử dụng localStorage để cải thiện hiệu suất ứng dụng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="usage" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage">Sử dụng bộ nhớ</TabsTrigger>
            <TabsTrigger value="items">Chi tiết</TabsTrigger>
          </TabsList>
          <TabsContent value="usage" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Dung lượng đã sử dụng</span>
                <span>
                  {formatSize(storageUsage.used)} / {formatSize(storageUsage.total)} (
                  {storageUsage.percentage.toFixed(2)}%)
                </span>
              </div>
              <Progress value={storageUsage.percentage} className="h-2" />
            </div>

            {storageUsage.percentage > 80 && (
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Cảnh báo</AlertTitle>
                <AlertDescription>
                  Dung lượng lưu trữ đã sử dụng trên 80%. Hãy cân nhắc xóa dữ liệu không cần thiết để tránh mất dữ liệu.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={calculateStorageUsage} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
              <Button variant="destructive" size="sm" onClick={clearAllData} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa tất cả dữ liệu
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="items" className="pt-4">
            {/* Content for items tab */}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
