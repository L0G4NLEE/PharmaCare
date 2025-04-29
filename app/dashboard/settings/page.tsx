"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackupRestoreManager } from "@/components/backup-restore-manager"
import { DataIntegrityChecker } from "@/components/data-integrity-checker"
import { LocalStorageStatus } from "@/components/local-storage-status"
import { PerformanceManager } from "@/components/performance-manager"
import { Button } from "@/components/ui/button"
import { resetAllData } from "@/lib/local-storage-db"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)

  const handleResetData = async () => {
    if (confirm("Bạn có chắc chắn muốn đặt lại tất cả dữ liệu? Hành động này không thể hoàn tác.")) {
      setIsResetting(true)
      try {
        await resetAllData()
        toast({
          title: "Đặt lại dữ liệu thành công",
          description: "Tất cả dữ liệu đã được đặt lại về mặc định.",
          variant: "default",
        })
      } catch (error) {
        toast({
          title: "Lỗi khi đặt lại dữ liệu",
          description: "Đã xảy ra lỗi khi đặt lại dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        })
      } finally {
        setIsResetting(false)
      }
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Cài đặt</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="data">Dữ liệu</TabsTrigger>
          <TabsTrigger value="performance">Hiệu suất</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>Quản lý cài đặt chung của ứng dụng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Đặt lại dữ liệu</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Đặt lại tất cả dữ liệu về trạng thái mặc định. Hành động này không thể hoàn tác.
                  </p>
                  <Button variant="destructive" onClick={handleResetData} disabled={isResetting}>
                    {isResetting ? "Đang đặt lại..." : "Đặt lại dữ liệu"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid gap-4">
            <BackupRestoreManager />
            <DataIntegrityChecker />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceManager />
        </TabsContent>

        <TabsContent value="system">
          <LocalStorageStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
