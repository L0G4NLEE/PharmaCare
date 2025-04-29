"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { Trash2, Plus } from "lucide-react"
import { fetchSuppliers, fetchMedicines, createImport } from "@/lib/api-client"
import { toast } from "@/hooks/use-toast"

interface ImportFormProps {
  onSuccess: (data: any) => void
  onCancel: () => void
  importData?: any
}

export function ImportForm({ onSuccess, onCancel, importData }: ImportFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [note, setNote] = useState("")
  const [items, setItems] = useState<any[]>([
    {
      medicineId: "",
      medicineName: "",
      lotNumber: "",
      expiryDate: new Date(),
      price: 0,
      quantity: 1,
      total: 0,
    },
  ])

  // Tải danh sách nhà cung cấp và thuốc
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Tải danh sách nhà cung cấp
        const suppliersResponse = await fetchSuppliers()
        setSuppliers(suppliersResponse.suppliers || [])

        // Tải danh sách thuốc
        const medicinesResponse = await fetchMedicines()
        setMedicines(medicinesResponse.medicines || [])

        // Nếu có dữ liệu phiếu nhập, điền vào form
        if (importData) {
          setSupplierId(importData.supplierId)
          setNote(importData.note || "")

          if (Array.isArray(importData.items) && importData.items.length > 0) {
            setItems(
              importData.items.map((item: any) => ({
                medicineId: item.medicineId,
                medicineName: item.medicineName,
                lotNumber: item.lotNumber,
                expiryDate: new Date(item.expiryDate),
                price: item.price,
                quantity: item.quantity,
                total: item.total,
              })),
            )
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [importData])

  // Thêm mục mới
  const addItem = () => {
    setItems([
      ...items,
      {
        medicineId: "",
        medicineName: "",
        lotNumber: "",
        expiryDate: new Date(),
        price: 0,
        quantity: 1,
        total: 0,
      },
    ])
  }

  // Xóa mục
  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  // Cập nhật mục
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Nếu thay đổi thuốc, cập nhật tên thuốc và giá
    if (field === "medicineId") {
      const medicine = medicines.find((m) => m.id === value)
      if (medicine) {
        newItems[index].medicineName = medicine.name
        newItems[index].price = medicine.importPrice
        // Tính lại tổng tiền
        newItems[index].total = medicine.importPrice * newItems[index].quantity
      }
    }

    // Nếu thay đổi số lượng hoặc giá, tính lại tổng tiền
    if (field === "quantity" || field === "price") {
      newItems[index].total = newItems[index].price * newItems[index].quantity
    }

    setItems(newItems)
  }

  // Tính tổng tiền của phiếu nhập
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0)
  }

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!supplierId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn nhà cung cấp",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0 || items.some((item) => !item.medicineId)) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một thuốc",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const data = {
        supplierId,
        note,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          lotNumber: item.lotNumber || "N/A",
          expiryDate: item.expiryDate.toISOString().split("T")[0],
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        })),
      }

      const result = await createImport(data)
      onSuccess(result)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo phiếu nhập. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="supplier">Nhà cung cấp</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger id="supplier">
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="font-medium mb-2">Danh sách thuốc nhập</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Label htmlFor={`medicine-${index}`}>Thuốc</Label>
                  <Select value={item.medicineId} onValueChange={(value) => updateItem(index, "medicineId", value)}>
                    <SelectTrigger id={`medicine-${index}`}>
                      <SelectValue placeholder="Chọn thuốc" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicines.map((medicine) => (
                        <SelectItem key={medicine.id} value={medicine.id}>
                          {medicine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`lot-${index}`}>Số lô</Label>
                  <Input
                    id={`lot-${index}`}
                    value={item.lotNumber}
                    onChange={(e) => updateItem(index, "lotNumber", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`expiry-${index}`}>Hạn sử dụng</Label>
                  <DatePicker date={item.expiryDate} onSelect={(date) => updateItem(index, "expiryDate", date)} />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`price-${index}`}>Giá nhập</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`quantity-${index}`}>Số lượng</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`total-${index}`}>Thành tiền</Label>
                  <Input id={`total-${index}`} value={item.total.toLocaleString("vi-VN")} disabled />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Thêm thuốc
            </Button>
          </div>
        </div>

        <div>
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Nhập ghi chú (nếu có)"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-medium">
            Tổng tiền: <span className="text-primary">{calculateTotal().toLocaleString("vi-VN")} đ</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : importData ? "Cập nhật" : "Tạo phiếu nhập"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
