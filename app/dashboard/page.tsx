"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { Users, Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react"

// Thêm import DataStats
import DataStats from "@/components/data-stats"
// Thêm import DataDisplay
import DataDisplay from "@/components/data-display"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalMedicines: 0,
    totalOrders: 0,
    lowStockItems: 0,
    expiringItems: 0,
  })

  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu thống kê
    const fetchStats = async () => {
      try {
        // Giả lập gọi API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setStats({
          totalSales: 15750000,
          totalCustomers: 128,
          totalMedicines: 245,
          totalOrders: 87,
          lowStockItems: 12,
          expiringItems: 8,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <Header title="Tổng quan" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Tổng quan</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoading ? "Đang tải..." : formatCurrency(stats.totalSales) + " đ"}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 inline-flex items-center">
                    {/* <ArrowUpRight className="h-3 w-3 mr-1" /> */}
                    +12.5%
                  </span>{" "}
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Đang tải..." : stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 inline-flex items-center">
                    {/* <ArrowUpRight className="h-3 w-3 mr-1" /> */}
                    +5.2%
                  </span>{" "}
                  so với tháng trước
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Thuốc</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Đang tải..." : stats.totalMedicines}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-amber-500 inline-flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {stats.lowStockItems} sắp hết hàng
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "Đang tải..." : stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-500 inline-flex items-center">
                    {/* <ArrowDownRight className="h-3 w-3 mr-1" /> */}
                    -2.5%
                  </span>{" "}
                  so với tháng trước
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="analytics">Phân tích</TabsTrigger>
              <TabsTrigger value="reports">Báo cáo</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
            </TabsList>
            {/* Thêm component DataStats vào trong TabsContent value="overview" */}
            <TabsContent value="overview" className="space-y-4">
              {/* Thay thế Card "Thuốc sắp hết hàng" và "Thuốc sắp hết hạn" bằng DataDisplay */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DataDisplay
                  storageKey="pharmacy_medicines"
                  title="Danh sách thuốc"
                  fields={["name", "category", "stock", "expiryDate"]}
                  limit={5}
                />

                <DataDisplay
                  storageKey="pharmacy_customers"
                  title="Danh sách khách hàng"
                  fields={["name", "phone", "email", "address"]}
                  limit={5}
                />
              </div>

              {/* Thêm DataStats ở đây */}
              <DataStats />

              {/* Thay thế Card "Đơn hàng gần đây" bằng DataDisplay */}
              <DataDisplay
                storageKey="pharmacy_invoices"
                title="Đơn hàng gần đây"
                fields={["id", "customer", "date", "total"]}
                limit={5}
              />
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Phân tích doanh thu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tính năng đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Báo cáo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tính năng đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông báo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tính năng đang được phát triển...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
