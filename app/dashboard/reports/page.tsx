"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Download } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Dữ liệu mẫu - trong thực tế sẽ được lấy từ API
const revenueData = [
  { name: "10/07", value: 5800000 },
  { name: "11/07", value: 6200000 },
  { name: "12/07", value: 7200000 },
  { name: "13/07", value: 7300000 },
  { name: "14/07", value: 7200000 },
  { name: "15/07", value: 7500000 },
  { name: "16/07", value: 7800000 },
]

const monthlyRevenueData = [
  { name: "T1", value: 150000000 },
  { name: "T2", value: 160000000 },
  { name: "T3", value: 180000000 },
  { name: "T4", value: 170000000 },
  { name: "T5", value: 190000000 },
  { name: "T6", value: 210000000 },
  { name: "T7", value: 200000000 },
]

const categoryData = [
  { name: "Thuốc giảm đau", value: 35 },
  { name: "Vitamin & Thực phẩm chức năng", value: 25 },
  { name: "Kháng sinh", value: 20 },
  { name: "Thuốc đường tiêu hóa", value: 15 },
  { name: "Thuốc kháng dị ứng", value: 5 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

const topProducts = [
  {
    id: "MED-1",
    name: "Paracetamol 500mg",
    category: "Thuốc giảm đau",
    sales: 245,
    revenue: "4.900.000 đ",
    trend: "+12.4%",
  },
  {
    id: "MED-2",
    name: "Vitamin C 1000mg",
    category: "Vitamin & Thực phẩm chức năng",
    sales: 198,
    revenue: "3.960.000 đ",
    trend: "+8.2%",
  },
  {
    id: "MED-3",
    name: "Amoxicillin 500mg",
    category: "Kháng sinh",
    sales: 156,
    revenue: "3.120.000 đ",
    trend: "+5.7%",
  },
  {
    id: "MED-4",
    name: "Omeprazole 20mg",
    category: "Thuốc đường tiêu hóa",
    sales: 142,
    revenue: "2.840.000 đ",
    trend: "+3.1%",
  },
  {
    id: "MED-5",
    name: "Cetirizine 10mg",
    category: "Thuốc kháng dị ứng",
    sales: 128,
    revenue: "2.560.000 đ",
    trend: "+2.8%",
  },
]

const lowStockProducts = [
  {
    id: "MED-1005",
    name: "Cetirizine 10mg",
    category: "Thuốc kháng dị ứng",
    stock: 8,
    expiryDate: "15/08/2023",
    value: "160.000 đ",
  },
  {
    id: "MED-1006",
    name: "Ibuprofen 400mg",
    category: "Thuốc giảm đau",
    stock: 5,
    expiryDate: "30/06/2023",
    value: "75.000 đ",
  },
]

const expiringProducts = [
  {
    id: "MED-1005",
    name: "Cetirizine 10mg",
    category: "Thuốc kháng dị ứng",
    stock: 8,
    expiryDate: "15/08/2023",
    daysLeft: 30,
  },
  {
    id: "MED-1006",
    name: "Ibuprofen 400mg",
    category: "Thuốc giảm đau",
    stock: 5,
    expiryDate: "30/06/2023",
    daysLeft: 0,
  },
  {
    id: "MED-1002",
    name: "Vitamin C 1000mg",
    category: "Vitamin & Thực phẩm chức năng",
    stock: 198,
    expiryDate: "10/05/2023",
    daysLeft: -20,
  },
]

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [activeTab, setActiveTab] = useState("revenue")

  const handleExportReport = () => {
    // Trong thực tế, sẽ gọi API để xuất báo cáo
    alert("Đang xuất báo cáo...")
  }

  return (
    <>
      <Header title="Báo cáo và thống kê" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Báo cáo và thống kê</h1>
          <Button variant="outline" className="flex items-center gap-1" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
            <TabsTrigger value="product">Sản phẩm</TabsTrigger>
          </TabsList>

          <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Từ ngày:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[180px] justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Đến ngày:</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn("w-[180px] justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus locale={vi} />
                </PopoverContent>
              </Popover>
            </div>

            <Button className="ml-auto">Áp dụng</Button>
          </div>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Tổng doanh thu</h3>
                <p className="text-2xl font-bold">53.920.000 đ</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="text-green-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                        clipRule="evenodd"
                      />
                    </svg>
                    8.7%
                  </span>
                  <span className="ml-1">so với kỳ trước</span>
                </p>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Doanh thu trung bình / ngày</h3>
                <p className="text-2xl font-bold">7.702.857 đ</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="text-green-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                        clipRule="evenodd"
                      />
                    </svg>
                    5.4%
                  </span>
                  <span className="ml-1">so với kỳ trước</span>
                </p>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Số lượng bán ra</h3>
                <p className="text-2xl font-bold">869</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span className="text-green-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3 mr-1"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.387l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.061l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042-.815a.75.75 0 01-.53-.919z"
                        clipRule="evenodd"
                      />
                    </svg>
                    12.3%
                  </span>
                  <span className="ml-1">so với kỳ trước</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Doanh thu theo ngày</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`${formatCurrency(value)} đ`, "Doanh thu"]} />
                      <Bar dataKey="value" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Doanh thu theo danh mục</h3>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-medium mb-4">Xu hướng doanh thu theo tháng</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${formatCurrency(value)} đ`, "Doanh thu"]} />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-medium mb-4">Top sản phẩm bán chạy</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left font-medium p-2">Mã thuốc</th>
                      <th className="text-left font-medium p-2">Tên thuốc</th>
                      <th className="text-left font-medium p-2">Danh mục</th>
                      <th className="text-center font-medium p-2">Số lượng đã bán</th>
                      <th className="text-right font-medium p-2">Doanh thu</th>
                      <th className="text-right font-medium p-2">Tăng trưởng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="p-2">{product.id}</td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">{product.category}</td>
                        <td className="p-2 text-center">{product.sales}</td>
                        <td className="p-2 text-right">{product.revenue}</td>
                        <td className="p-2 text-right text-green-500">{product.trend}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Thuốc sắp hết hàng</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Mã thuốc</th>
                        <th className="text-left font-medium p-2">Tên thuốc</th>
                        <th className="text-left font-medium p-2">Danh mục</th>
                        <th className="text-center font-medium p-2">Tồn kho</th>
                        <th className="text-center font-medium p-2">Hạn sử dụng</th>
                        <th className="text-right font-medium p-2">Giá trị tồn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2">{product.id}</td>
                          <td className="p-2">{product.name}</td>
                          <td className="p-2">{product.category}</td>
                          <td className="p-2 text-center text-amber-500 font-medium">{product.stock}</td>
                          <td className="p-2 text-center">{product.expiryDate}</td>
                          <td className="p-2 text-right">{product.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Thuốc sắp hết hạn</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Mã thuốc</th>
                        <th className="text-left font-medium p-2">Tên thuốc</th>
                        <th className="text-left font-medium p-2">Danh mục</th>
                        <th className="text-center font-medium p-2">Tồn kho</th>
                        <th className="text-center font-medium p-2">Hạn sử dụng</th>
                        <th className="text-center font-medium p-2">Còn lại</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiringProducts.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2">{product.id}</td>
                          <td className="p-2">{product.name}</td>
                          <td className="p-2">{product.category}</td>
                          <td className="p-2 text-center">{product.stock}</td>
                          <td className="p-2 text-center">{product.expiryDate}</td>
                          <td className="p-2 text-center text-red-500">
                            {product.daysLeft < 0
                              ? "Đã hết hạn"
                              : product.daysLeft === 0
                                ? "Hết hạn hôm nay"
                                : `${product.daysLeft} ngày`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-medium mb-4">Phân tích giá trị tồn kho theo danh mục</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" name="Phần trăm giá trị" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="product" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Phân tích doanh số theo danh mục</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg border shadow-sm p-4">
                <h3 className="font-medium mb-4">Top sản phẩm bán chạy</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium p-2">Tên thuốc</th>
                        <th className="text-center font-medium p-2">Số lượng đã bán</th>
                        <th className="text-right font-medium p-2">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-2">{product.name}</td>
                          <td className="p-2 text-center">{product.sales}</td>
                          <td className="p-2 text-right">{product.revenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
