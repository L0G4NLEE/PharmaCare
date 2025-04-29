export async function fetchDashboardData() {
  // Giả lập gọi API
  return {
    todayRevenue: 8520000,
    todayInvoices: 24,
    lowStockProducts: 12,
    expiringProducts: 8,
    revenueChange: 12.5,
    invoiceChange: 8.9,
  }
}

export async function fetchMedicines() {
  // Giả lập gọi API
  return [
    {
      id: "MED-1001",
      name: "Paracetamol 500mg",
      category: "Thuốc giảm đau",
      price: "15.000 đ",
      stock: 245,
      expiry: "15/12/2023",
    },
    // ... các thuốc khác
  ]
}
