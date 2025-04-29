import { z } from "zod"
import type {
  MedicineFormData,
  CustomerFormData,
  SupplierFormData,
  InteractionFormData,
  InvoiceFormData,
  ImportFormData,
  InventoryAdjustmentFormData,
} from "@/types"

// Validation schema cho Medicine
export const medicineSchema = z.object({
  name: z.string().min(1, "Tên thuốc là bắt buộc"),
  category: z.string().min(1, "Danh mục là bắt buộc"),
  description: z.string().optional(),
  activeIngredient: z.string().optional(),
  dosage: z.string().optional(),
  indication: z.string().optional(),
  contraindication: z.string().optional(),
  sideEffects: z.string().optional(),
  storage: z.string().optional(),
  manufacturer: z.string().optional(),
  importPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  retailPrice: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  stock: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  expiryDate: z.string().optional(),
  lotNumber: z.string().optional(),
})

// Validation schema cho Customer
export const customerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng là bắt buộc"),
  phone: z.string().optional(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  address: z.string().optional(),
  birthdate: z.string().optional(),
})

// Validation schema cho Invoice
export const invoiceItemSchema = z.object({
  medicineId: z.string().min(1, "Thuốc là bắt buộc"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  total: z.number().min(0, "Thành tiền phải lớn hơn hoặc bằng 0"),
})

export const invoiceSchema = z.object({
  customerId: z.string().optional(),
  paymentMethod: z.string().min(1, "Phương thức thanh toán là bắt buộc"),
  note: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "Hóa đơn phải có ít nhất một sản phẩm"),
})

// Validation schema cho Import
export const importItemSchema = z.object({
  medicineId: z.string().min(1, "Thuốc là bắt buộc"),
  lotNumber: z.string().min(1, "Số lô là bắt buộc"),
  expiryDate: z.string().min(1, "Hạn sử dụng là bắt buộc"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
  total: z.number().min(0, "Thành tiền phải lớn hơn hoặc bằng 0"),
})

export const importSchema = z.object({
  supplierId: z.string().min(1, "Nhà cung cấp là bắt buộc"),
  note: z.string().optional(),
  items: z.array(importItemSchema).min(1, "Phiếu nhập phải có ít nhất một sản phẩm"),
})

// Validation schema cho Interaction
export const interactionSchema = z.object({
  medicineId1: z.string().min(1, "Thuốc thứ nhất là bắt buộc"),
  medicineId2: z.string().min(1, "Thuốc thứ hai là bắt buộc"),
  severity: z.string().min(1, "Mức độ nghiêm trọng là bắt buộc"),
  description: z.string().min(1, "Mô tả tương tác là bắt buộc"),
  recommendation: z.string().optional(),
})

// Validation schema cho Inventory Adjustment
export const inventoryAdjustmentSchema = z.object({
  medicineId: z.string().min(1, "Thuốc là bắt buộc"),
  adjustType: z.enum(["add", "subtract", "set"], {
    required_error: "Loại điều chỉnh là bắt buộc",
  }),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
  reason: z.string().optional(),
})

// Export các kiểu dữ liệu
export type {
  MedicineFormData,
  CustomerFormData,
  SupplierFormData,
  InteractionFormData,
  InvoiceFormData,
  ImportFormData,
  InventoryAdjustmentFormData,
}
