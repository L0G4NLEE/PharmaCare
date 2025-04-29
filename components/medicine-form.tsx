"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"
import { toast } from "@/hooks/use-toast"
import { medicineSchema, type MedicineFormData } from "@/lib/validations"
import { createMedicine, updateMedicine } from "@/lib/api-client"

interface MedicineFormProps {
  medicine?: any
  onSuccess?: (data: any) => void
  onCancel?: () => void
}

export function MedicineForm({ medicine, onSuccess, onCancel }: MedicineFormProps) {
  const isEditing = !!medicine
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<MedicineFormData>({
    name: medicine?.name || "",
    category: medicine?.category || "",
    description: medicine?.description || "",
    activeIngredient: medicine?.activeIngredient || "",
    dosage: medicine?.dosage || "",
    indication: medicine?.indication || "",
    contraindication: medicine?.contraindication || "",
    sideEffects: medicine?.sideEffects || "",
    storage: medicine?.storage || "",
    manufacturer: medicine?.manufacturer || "",
    importPrice: medicine?.importPrice || "",
    retailPrice: medicine?.retailPrice || "",
    stock: medicine?.stock || "",
    expiryDate: medicine?.expiryDate || medicine?.expiry || "",
    lotNumber: medicine?.lotNumber || "",
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})

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

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`
      setFormData((prev) => ({ ...prev, expiryDate: formattedDate }))
      // Xóa lỗi khi người dùng sửa trường
      if (errors.expiryDate) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.expiryDate
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    try {
      medicineSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const formattedErrors: Record<string, string[]> = {}
      error.errors.forEach((err: any) => {
        const path = err.path[0]
        if (!formattedErrors[path]) {
          formattedErrors[path] = []
        }
        formattedErrors[path].push(err.message)
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
      // Định dạng giá bán để hiển thị
      const price = `${Number(formData.retailPrice).toLocaleString("vi-VN")} đ`

      // Tạo đối tượng thuốc để trả về
      const medicineData = {
        ...formData,
        price,
        expiry: formData.expiryDate,
      }

      if (isEditing) {
        await updateMedicine(medicine.id, formData)
        toast({
          title: "Cập nhật thuốc thành công",
          description: `Thuốc ${formData.name} đã được cập nhật.`,
        })
      } else {
        await createMedicine(formData)
        toast({
          title: "Thêm thuốc mới thành công",
          description: `Thuốc ${formData.name} đã được thêm vào hệ thống.`,
        })
      }

      if (onSuccess) onSuccess(medicineData)
    } catch (error) {
      console.error("Lỗi khi lưu thuốc:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu thông tin thuốc. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Tên thuốc</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          {errors.name && <p className="text-sm text-red-500">{errors.name.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Danh mục</Label>
          <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Thuốc giảm đau">Thuốc giảm đau</SelectItem>
              <SelectItem value="Vitamin &amp; Thực phẩm chức năng">Vitamin &amp; Thực phẩm chức năng</SelectItem>
              <SelectItem value="Kháng sinh">Kháng sinh</SelectItem>
              <SelectItem value="Thuốc đường tiêu hóa">Thuốc đường tiêu hóa</SelectItem>
              <SelectItem value="Thuốc kháng dị ứng">Thuốc kháng dị ứng</SelectItem>
              <SelectItem value="Thuốc đái tháo đường">Thuốc đái tháo đường</SelectItem>
              <SelectItem value="Thuốc tim mạch">Thuốc tim mạch</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500">{errors.category.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="activeIngredient">Hoạt chất chính</Label>
          <Input
            id="activeIngredient"
            name="activeIngredient"
            value={formData.activeIngredient}
            onChange={handleChange}
          />
          {errors.activeIngredient && <p className="text-sm text-red-500">{errors.activeIngredient.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="manufacturer">Nhà sản xuất</Label>
          <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
          {errors.manufacturer && <p className="text-sm text-red-500">{errors.manufacturer.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="importPrice">Giá nhập (đ)</Label>
          <Input
            id="importPrice"
            name="importPrice"
            type="number"
            value={formData.importPrice}
            onChange={handleChange}
          />
          {errors.importPrice && <p className="text-sm text-red-500">{errors.importPrice.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="retailPrice">Giá bán (đ)</Label>
          <Input
            id="retailPrice"
            name="retailPrice"
            type="number"
            value={formData.retailPrice}
            onChange={handleChange}
            required
          />
          {errors.retailPrice && <p className="text-sm text-red-500">{errors.retailPrice.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Số lượng tồn kho</Label>
          <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label>Hạn sử dụng</Label>
          <DatePicker
            date={formData.expiryDate ? new Date(formData.expiryDate.split("/").reverse().join("-")) : undefined}
            onSelect={handleDateChange}
          />
          {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate.join(", ")}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.join(", ")}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm thuốc"}
        </Button>
      </div>
    </form>
  )
}
