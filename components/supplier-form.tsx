"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { createSupplier, updateSupplier } from "@/lib/local-storage-api"
import type { Supplier, SupplierFormData } from "@/types"

// Định nghĩa schema validation
const supplierSchema = z.object({
  name: z.string().min(1, "Tên nhà cung cấp không được để trống"),
  phone: z.string().min(1, "Số điện thoại không được để trống"),
  email: z.string().email("Email không hợp lệ").or(z.string().length(0)),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  contactPerson: z.string().min(1, "Người liên hệ không được để trống"),
  taxCode: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierSchema>

export interface SupplierFormProps {
  supplier?: Supplier
  onSuccess?: (data: SupplierFormData) => void
  onCancel?: () => void
}

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormValues>({
    name: supplier?.name || "",
    phone: supplier?.phone || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    contactPerson: supplier?.contactPerson || "",
    taxCode: supplier?.taxCode || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof SupplierFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Xóa lỗi khi người dùng sửa trường
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      const validatedData = supplierSchema.parse(formData)

      if (supplier) {
        // Update existing supplier
        await updateSupplier(supplier.id, validatedData)
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin nhà cung cấp đã được cập nhật.",
        })
      } else {
        // Create new supplier
        await createSupplier(validatedData)
        toast({
          title: "Thêm mới thành công",
          description: "Nhà cung cấp mới đã được thêm vào hệ thống.",
        })
      }

      // Gọi callback onSuccess với dữ liệu đã validate
      if (onSuccess) {
        onSuccess(validatedData)
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Chuyển đổi lỗi Zod thành định dạng dễ sử dụng
        const fieldErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          const field = err.path[0] as string
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)

        toast({
          title: "Lỗi",
          description: "Vui lòng kiểm tra lại thông tin nhà cung cấp.",
          variant: "destructive",
        })
      } else {
        console.error("Form submission error:", error)
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi khi lưu thông tin nhà cung cấp.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">
            Tên nhà cung cấp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxCode">Mã số thuế</Label>
          <Input
            id="taxCode"
            value={formData.taxCode}
            onChange={(e) => handleChange("taxCode", e.target.value)}
            className={errors.taxCode ? "border-red-500" : ""}
          />
          {errors.taxCode && <p className="text-sm text-red-500">{errors.taxCode}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPerson">
            Người liên hệ <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contactPerson"
            value={formData.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
            className={errors.contactPerson ? "border-red-500" : ""}
          />
          {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">
          Địa chỉ <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className={errors.address ? "border-red-500" : ""}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang lưu..." : supplier ? "Cập nhật" : "Thêm mới"}
        </Button>
      </div>
    </form>
  )
}
