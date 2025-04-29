"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { invoiceSchema, type InvoiceFormData } from "@/lib/validations"
import { createInvoice, updateInvoice, fetchCustomers, fetchMedicines } from "@/lib/local-storage-api"

interface InvoiceFormProps {
  invoice?: any
  onSuccess?: (data: any) => void // Sửa kiểu dữ liệu
  onCancel?: () => void
}

export function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const isEditing = !!invoice
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [formData, setFormData] = useState<InvoiceFormData>({
    customerId: invoice?.customerId || "",
    note: invoice?.note || "",
    paymentMethod: invoice?.paymentMethod || "Tiền mặt",
    items: invoice?.items || [{ medicineId: "", quantity: 1, price: 0, total: 0 }],
  })
  const [errors, setErrors] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, medicinesResponse] = await Promise.all([fetchCustomers(), fetchMedicines()])
        setCustomers(customersResponse.customers || [])
        setMedicines(medicinesResponse.medicines || [])
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        toast({
          title: "Có lỗi xảy ra",
          description: "Không thể tải dữ liệu khách hàng và thuốc. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]

    if (field === "medicineId") {
      const medicine = medicines.find((m) => m.id === value)
      newItems[index] = {
        ...newItems[index],
        medicineId: value as string,
        price: medicine?.retailPrice || 0,
        total: (medicine?.retailPrice || 0) * (newItems[index].quantity || 1),
      }
    } else if (field === "quantity") {
      const quantity = Number(value) || 0
      newItems[index] = {
        ...newItems[index],
        quantity,
        total: (newItems[index].price || 0) * quantity,
      }
    }

    setFormData((prev) => ({ ...prev, items: newItems }))

    // Xóa lỗi khi người dùng sửa trường
    if (errors.items && errors.items[index] && errors.items[index][field]) {
      const newErrors = { ...errors }
      delete newErrors.items[index][field]
      setErrors(newErrors)
    }
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { medicineId: "", quantity: 1, price: 0, total: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = [...formData.items]
      newItems.splice(index, 1)
      setFormData((prev) => ({ ...prev, items: newItems }))

      // Cập nhật lỗi nếu có
      if (errors.items) {
        const newItemErrors = [...errors.items]
        newItemErrors.splice(index, 1)
        setErrors((prev) => ({ ...prev, items: newItemErrors }))
      }
    }
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0)
  }

  const validateForm = () => {
    try {
      invoiceSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const formattedErrors: Record<string, any> = {}
      error.errors.forEach((err: any) => {
        const path = err.path
        if (path.length === 1) {
          const field = path[0]
          if (!formattedErrors[field]) {
            formattedErrors[field] = []
          }
          formattedErrors[field].push(err.message)
        } else if (path.length === 3 && path[0] === "items") {
          const index = path[1]
          const field = path[2]
          if (!formattedErrors.items) {
            formattedErrors.items = []
          }
          if (!formattedErrors.items[index]) {
            formattedErrors.items[index] = {}
          }
          if (!formattedErrors.items[index][field]) {
            formattedErrors.items[index][field] = []
          }
          formattedErrors.items[index][field].push(err.message)
        }
      })
      setErrors(formattedErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Lỗi nhập liệu",
        description: "Vui lòng kiểm tra lại thông tin đã nhập.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      if (isEditing) {
        await updateInvoice(invoice.id, formData)
        toast({
          title: "Cập nhật hóa đơn thành công",
          description: `Hóa đơn đã được cập nhật thành công.`,
        })
      } else {
        await createInvoice(formData)
        toast({
          title: "Tạo hóa đơn mới thành công",
          description: `Hóa đơn đã được tạo thành công.`,
        })
      }

      if (onSuccess) onSuccess(formData)
    } catch (error) {
      console.error("Lỗi khi lưu hóa đơn:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu hóa đơn. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerId">Khách hàng</Label>
          <Select value={formData.customerId} onValueChange={(value) => handleSelectChange("customerId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khách hàng" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} ({customer.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.customerId && (
            <p className="text-sm text-red-500">
              {Array.isArray(errors.customerId) ? errors.customerId.join(", ") : errors.customerId}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => handleSelectChange("paymentMethod", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phương thức thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
              <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
              <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMethod && (
            <p className="text-sm text-red-500">
              {Array.isArray(errors.paymentMethod) ? errors.paymentMethod.join(", ") : errors.paymentMethod}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Danh sách thuốc</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Thêm thuốc
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6 space-y-2">
                <Label htmlFor={`medicine-${index}`}>Thuốc</Label>
                <Select value={item.medicineId} onValueChange={(value) => handleItemChange(index, "medicineId", value)}>
                  <SelectTrigger id={`medicine-${index}`}>
                    <SelectValue placeholder="Chọn thuốc" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((medicine) => (
                      <SelectItem key={medicine.id} value={medicine.id}>
                        {medicine.name} - {formatCurrency(medicine.retailPrice)} đ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.items && errors.items[index] && errors.items[index].medicineId && (
                  <p className="text-sm text-red-500">{errors.items[index].medicineId.join(", ")}</p>
                )}
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor={`quantity-${index}`}>Số lượng</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                />
                {errors.items && errors.items[index] && errors.items[index].quantity && (
                  <p className="text-sm text-red-500">{errors.items[index].quantity.join(", ")}</p>
                )}
              </div>
              <div className="col-span-3 space-y-2">
                <Label>Thành tiền</Label>
                <Input value={`${formatCurrency(item.total)} đ`} readOnly disabled />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú</Label>
        <Textarea id="note" name="note" value={formData.note} onChange={handleChange} rows={2} />
        {errors.note && (
          <p className="text-sm text-red-500">{Array.isArray(errors.note) ? errors.note.join(", ") : errors.note}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-lg font-medium">
          Tổng tiền: <span className="text-xl font-bold">{formatCurrency(calculateTotal())} đ</span>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo hóa đơn"}
          </Button>
        </div>
      </div>
    </form>
  )
}
