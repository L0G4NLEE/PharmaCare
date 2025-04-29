"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/date-picker"
import { toast } from "@/hooks/use-toast"
import { customerSchema } from "@/lib/validations"
import { createCustomer, updateCustomer } from "@/lib/local-storage-api"

interface CustomerFormProps {
  customer?: any
  onSuccess: (data: any) => void // Đảm bảo onSuccess nhận một tham số
  onCancel?: () => void
}

export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const isEditing = !!customer
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone: customer?.phone || "",
    email: customer?.email || "",
    address: customer?.address || "",
    birthdate: customer?.birthdate || "",
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

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}`
      setFormData((prev) => ({ ...prev, birthdate: formattedDate }))
      // Xóa lỗi khi người dùng sửa trường
      if (errors.birthdate) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.birthdate
          return newErrors
        })
      }
    }
  }

  const validateForm = () => {
    try {
      customerSchema.parse(formData)
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
      let result
      if (isEditing) {
        result = await updateCustomer(customer.id, formData)
        toast({
          title: "Cập nhật khách hàng thành công",
          description: `Khách hàng ${formData.name} đã được cập nhật.`,
        })
      } else {
        result = await createCustomer(formData)
        toast({
          title: "Thêm khách hàng mới thành công",
          description: `Khách hàng ${formData.name} đã được thêm vào hệ thống.`,
        })
      }

      onSuccess(result) // Truyền kết quả vào hàm onSuccess
    } catch (error) {
      console.error("Lỗi khi lưu khách hàng:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu thông tin khách hàng. Vui lòng thử lại sau.",
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
          <Label htmlFor="name">Họ và tên</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          {errors.name && <p className="text-sm text-red-500">{errors.name.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label>Ngày sinh</Label>
          <DatePicker
            date={formData.birthdate ? new Date(formData.birthdate) : undefined}
            onSelect={handleDateChange}
          />
          {errors.birthdate && <p className="text-sm text-red-500">{errors.birthdate.join(", ")}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Địa chỉ</Label>
        <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
        {errors.address && <p className="text-sm text-red-500">{errors.address.join(", ")}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm khách hàng"}
        </Button>
      </div>
    </form>
  )
}
