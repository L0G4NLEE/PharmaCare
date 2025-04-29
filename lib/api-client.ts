import type {
  Medicine,
  SearchParams,
  SupplierFormData,
  ImportFormData,
  InteractionFormData,
  InvoiceFormData,
  CustomerFormData,
  InventoryAdjustmentFormData,
} from "@/types"

// Hàm tiện ích để xây dựng query string
function buildQueryString(params?: SearchParams): string {
  if (!params) return ""

  const queryParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  return queryString ? `?${queryString}` : ""
}

// Hàm tiện ích để xử lý lỗi
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || "Có lỗi xảy ra khi gọi API")
  }
  return response.json()
}

// ===== MEDICINES API =====
export async function fetchMedicines(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/medicines${queryString}`)
  return handleResponse(response)
}

export async function getMedicine(id: string) {
  const response = await fetch(`/api/medicines/${id}`)
  return handleResponse(response)
}

export async function createMedicine(data: Omit<Medicine, "id" | "createdAt" | "updatedAt" | "code">) {
  const response = await fetch("/api/medicines", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateMedicine(id: string, data: Partial<Medicine>) {
  const response = await fetch(`/api/medicines/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteMedicine(id: string) {
  const response = await fetch(`/api/medicines/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

// ===== SUPPLIERS API =====
export async function fetchSuppliers(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/suppliers${queryString}`)
  return handleResponse(response)
}

export async function getSupplier(id: string) {
  const response = await fetch(`/api/suppliers/${id}`)
  return handleResponse(response)
}

export async function createSupplier(data: SupplierFormData) {
  const response = await fetch("/api/suppliers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateSupplier(id: string, data: Partial<SupplierFormData>) {
  const response = await fetch(`/api/suppliers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteSupplier(id: string) {
  const response = await fetch(`/api/suppliers/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

// ===== IMPORTS API =====
export async function fetchImports(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/imports${queryString}`)
  return handleResponse(response)
}

export async function getImport(id: string) {
  const response = await fetch(`/api/imports/${id}`)
  return handleResponse(response)
}

export async function createImport(data: ImportFormData) {
  const response = await fetch("/api/imports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteImport(id: string) {
  const response = await fetch(`/api/imports/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

// ===== CUSTOMERS API =====
export async function fetchCustomers(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/customers${queryString}`)
  return handleResponse(response)
}

export async function getCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`)
  return handleResponse(response)
}

export async function getCustomerInvoices(id: string, params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/customers/${id}/invoices${queryString}`)
  return handleResponse(response)
}

export async function createCustomer(data: CustomerFormData) {
  const response = await fetch("/api/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateCustomer(id: string, data: Partial<CustomerFormData>) {
  const response = await fetch(`/api/customers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`/api/customers/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

// ===== INTERACTIONS API =====
export async function fetchInteractions(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/interactions${queryString}`)
  return handleResponse(response)
}

export async function getInteraction(id: string) {
  const response = await fetch(`/api/interactions/${id}`)
  return handleResponse(response)
}

export async function createInteraction(data: InteractionFormData) {
  const response = await fetch("/api/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function updateInteraction(id: string, data: Partial<InteractionFormData>) {
  const response = await fetch(`/api/interactions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteInteraction(id: string) {
  const response = await fetch(`/api/interactions/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

export async function checkInteraction(medicine1: string, medicine2: string) {
  const response = await fetch(`/api/interactions/check?medicine1=${medicine1}&medicine2=${medicine2}`)
  return handleResponse(response)
}

// ===== INVOICES API =====
export async function fetchInvoices(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/invoices${queryString}`)
  return handleResponse(response)
}

export async function getInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`)
  return handleResponse(response)
}

export async function createInvoice(data: InvoiceFormData) {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}

export async function deleteInvoice(id: string) {
  const response = await fetch(`/api/invoices/${id}`, {
    method: "DELETE",
  })
  return handleResponse(response)
}

// ===== INVENTORY API =====
export async function fetchInventory(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/inventory${queryString}`)
  return handleResponse(response)
}

export async function fetchInventoryLogs(params?: SearchParams) {
  const queryString = buildQueryString(params)
  const response = await fetch(`/api/inventory/logs${queryString}`)
  return handleResponse(response)
}

export async function adjustInventory(data: InventoryAdjustmentFormData) {
  const response = await fetch("/api/inventory/adjust", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse(response)
}
