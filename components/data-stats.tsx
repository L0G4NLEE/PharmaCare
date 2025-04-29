"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"

export default function DataStats() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = () => {
      setIsLoading(true)
      try {
        const dataStats: Record<string, number> = {}
        const keys = [
          "pharmacy_medicines",
          "pharmacy_customers",
          "pharmacy_suppliers",
          "pharmacy_interactions",
          "pharmacy_invoices",
          "pharmacy_imports",
          "pharmacy_inventory",
          "pharmacy_inventory_logs",
          "pharmacy_users",
        ]

        keys.forEach((key) => {
          const value = localStorage.getItem(key)
          if (value) {
            try {
              const parsedData = JSON.parse(value)
              dataStats[key] = Array.isArray(parsedData) ? parsedData.length : 1
            } catch (e) {
              console.error(`Error parsing ${key}:`, e)
              dataStats[key] = 0
            }
          } else {
            dataStats[key] = 0
          }
        })

        setStats(dataStats)
      } catch (error) {
        console.error("Error loading stats from localStorage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
    window.addEventListener("storage", loadStats)

    return () => {
      window.removeEventListener("storage", loadStats)
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Thống kê dữ liệu</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Đang tải...</p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Thuốc</span>
                </div>
                <span className="font-medium">{stats["pharmacy_medicines"] || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Khách hàng</span>
                </div>
                <span className="font-medium">{stats["pharmacy_customers"] || 0}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Nhà cung cấp</span>
                </div>
                <span className="font-medium">{stats["pharmacy_suppliers"] || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Hóa đơn</span>
                </div>
                <span className="font-medium">{stats["pharmacy_invoices"] || 0}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
