"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLocalStorageData } from "@/lib/local-storage-helper"
import { Skeleton } from "@/components/ui/skeleton"

interface DataDisplayProps {
  storageKey: string
  title: string
  fields?: string[]
  limit?: number
}

export default function DataDisplay({ storageKey, title, fields, limit = 5 }: DataDisplayProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      setIsLoading(true)
      const storedData = getLocalStorageData<any[]>(storageKey, [])
      setData(storedData)
      setIsLoading(false)
    }

    loadData()
    window.addEventListener("storage", loadData)

    return () => {
      window.removeEventListener("storage", loadData)
    }
  }, [storageKey])

  // Xác định các trường hiển thị
  const displayFields =
    fields ||
    (data.length > 0
      ? Object.keys(data[0])
          .filter((key) => typeof data[0][key] !== "object" || data[0][key] === null)
          .slice(0, 4)
      : [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground">Không có dữ liệu</p>
        ) : (
          <div className="space-y-2">
            {data.slice(0, limit).map((item, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-2">
                  {displayFields.map((field) => (
                    <div key={field} className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{field}</span>
                      <span className="text-sm font-medium truncate">
                        {typeof item[field] === "object"
                          ? JSON.stringify(item[field]).substring(0, 30)
                          : String(item[field]).substring(0, 30)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {data.length > limit && (
              <p className="text-xs text-muted-foreground text-right">
                Hiển thị {limit}/{data.length} bản ghi
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
