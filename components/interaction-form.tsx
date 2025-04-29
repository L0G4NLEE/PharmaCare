"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { interactionSchema, type InteractionFormData } from "@/lib/validations"
import { createInteraction, updateInteraction } from "@/lib/local-storage-api"
import type { Interaction, Medicine } from "@/types"

export interface InteractionFormProps {
  interaction?: Interaction
  medicines: Medicine[] // Đảm bảo medicines là required
  onSuccess?: (data: Interaction) => void
  onCancel?: () => void
}

export function InteractionForm({ interaction, medicines = [], onSuccess, onCancel }: InteractionFormProps) {
  const isEditing = !!interaction
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<InteractionFormData>({
    medicineId1: interaction?.medicineId1 || "",
    medicineId2: interaction?.medicineId2 || "",
    severity: interaction?.severity || "",
    description: interaction?.description || "",
    recommendation: interaction?.recommendation || "",
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

  const validateForm = () => {
    try {
      interactionSchema.parse(formData)
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
      if (isEditing) {
        await updateInteraction(interaction.id, formData)
        toast({
          title: "Cập nhật tương tác thuốc thành công",
          description: "Thông tin tương tác thuốc đã được cập nhật.",
        })
      } else {
        const newInteraction = await createInteraction(formData)
        toast({
          title: "Thêm tương tác thuốc mới thành công",
          description: "Tương tác thuốc mới đã được thêm vào hệ thống.",
        })
        if (onSuccess) onSuccess(newInteraction)
      }

      if (onSuccess) onSuccess(null)
    } catch (error) {
      console.error("Lỗi khi lưu tương tác thuốc:", error)
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể lưu tương tác thuốc. Vui lòng thử lại sau.",
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
          <Label htmlFor="medicineId1">Thuốc thứ nhất</Label>
          <Select value={formData.medicineId1} onValueChange={(value) => handleSelectChange("medicineId1", value)}>
            <SelectTrigger>
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
          {errors.medicineId1 && <p className="text-sm text-red-500">{errors.medicineId1.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicineId2">Thuốc thứ hai</Label>
          <Select value={formData.medicineId2} onValueChange={(value) => handleSelectChange("medicineId2", value)}>
            <SelectTrigger>
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
          {errors.medicineId2 && <p className="text-sm text-red-500">{errors.medicineId2.join(", ")}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="severity">Mức độ nghiêm trọng</Label>
          <Select value={formData.severity} onValueChange={(value) => handleSelectChange("severity", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nhẹ">Nhẹ</SelectItem>
              <SelectItem value="Trung bình">Trung bình</SelectItem>
              <SelectItem value="Nghiêm trọng">Nghiêm trọng</SelectItem>
              <SelectItem value="Chống chỉ định">Chống chỉ định</SelectItem>
            </SelectContent>
          </Select>
          {errors.severity && <p className="text-sm text-red-500">{errors.severity.join(", ")}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả tương tác</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.join(", ")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="recommendation">Khuyến nghị</Label>
        <Textarea
          id="recommendation"
          name="recommendation"
          value={formData.recommendation}
          onChange={handleChange}
          rows={3}
        />
        {errors.recommendation && <p className="text-sm text-red-500">{errors.recommendation.join(", ")}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm tương tác"}
        </Button>
      </div>
    </form>
  )
}
