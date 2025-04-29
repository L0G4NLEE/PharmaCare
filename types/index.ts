// Kiểm tra xem tất cả các type cần thiết đã được định nghĩa chưa
export interface Medicine {
  id: string
  code: string
  name: string
  description?: string
  category: string
  activeIngredient?: string
  dosage?: string
  indication?: string
  contraindication?: string
  sideEffects?: string
  storage?: string
  manufacturer?: string
  importPrice: number
  retailPrice: number
  stock: number
  expiryDate: string
  lotNumber: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  code: string
  name: string
  phone?: string
  email?: string
  address?: string
  birthdate?: string
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  code: string
  name: string
  phone: string
  email?: string
  address: string
  contactPerson: string
  taxCode?: string
  createdAt: Date
  updatedAt: Date
}

export interface Interaction {
  id: string
  medicineId1: string
  medicineId2: string
  medicine1: string
  medicine2: string
  severity: string
  description: string
  recommendation?: string
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id: string
  medicineId: string
  medicineName: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  customerId: string
  customer: string
  userId: string
  employee: string
  date: string
  paymentMethod: string
  status: string
  total: number
  note?: string
  items: InvoiceItem[]
  createdAt: Date
  updatedAt: Date
}

export interface ImportItem {
  id: string
  medicineId: string
  medicineName: string
  lotNumber: string
  expiryDate: string
  price: number
  quantity: number
  total: number
}

export interface Import {
  id: string
  supplierId: string
  supplier: string
  userId: string
  employee: string
  date: string
  status: string
  total: number
  note?: string
  items: ImportItem[]
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  medicineId: string
  medicineName: string
  quantity: number
  category: string
  expiryDate: string
  batchNumber: string
}

export interface InventoryLogItem {
  id: string
  medicineId: string
  medicineName: string
  quantity: number
  type: string
  date: string
  userId: string
  userName: string
  note?: string
}

// Form data types
export interface CustomerFormData {
  name: string
  phone?: string
  email?: string
  address?: string
  birthdate?: string
}

export interface SupplierFormData {
  name: string
  phone: string
  email?: string
  address: string
  contactPerson: string
  taxCode?: string
}

export interface MedicineFormData {
  name: string
  category: string
  description?: string
  activeIngredient?: string
  dosage?: string
  indication?: string
  contraindication?: string
  sideEffects?: string
  storage?: string
  manufacturer?: string
  importPrice?: number | string
  retailPrice?: number | string
  stock?: number | string
  expiryDate?: string
  lotNumber?: string
}

export interface InteractionFormData {
  medicineId1: string
  medicineId2: string
  severity: string
  description: string
  recommendation?: string
}

export interface InvoiceItemFormData {
  medicineId: string
  quantity: number
  price: number
  total: number
}

export interface InvoiceFormData {
  customerId: string
  paymentMethod: string
  note?: string
  items: InvoiceItemFormData[]
}

export interface ImportItemFormData {
  medicineId: string
  lotNumber: string
  expiryDate: string
  price: number
  quantity: number
  total: number
}

export interface ImportFormData {
  supplierId: string
  note?: string
  items: ImportItemFormData[]
}

export interface InventoryAdjustmentFormData {
  medicineId: string
  adjustType: "add" | "subtract" | "set"
  quantity: number
  reason?: string
}

// Extended types with additional details
export type MedicineWithDetails = Medicine
export type CustomerWithDetails = Customer
export type SupplierWithDetails = Supplier
export type InteractionWithDetails = Interaction
export type InvoiceWithDetails = Invoice
export type ImportWithDetails = Import

// Search params
export interface SearchParams {
  search?: string
  category?: string
  severity?: string
  date?: string
  stock?: string
  page?: number | string
  limit?: number | string
  [key: string]: any
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  password: string
  role: string
  createdAt: Date
  updatedAt: Date
}
