"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { InvoiceWithDetails } from "@/types"

// Định nghĩa styles cho PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #eaeaea",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    borderBottomStyle: "solid",
    paddingTop: 8,
    paddingBottom: 8,
  },
  column: {
    flex: 1,
  },
  columnHeader: {
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    borderTopStyle: "solid",
    paddingTop: 10,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    borderTopStyle: "solid",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
})

export interface InvoiceItem {
  id: string
  medicineId: string
  medicineName?: string
  quantity: number
  price: number
  total: number
}

export interface Invoice {
  id: string
  code: string
  date: string | Date
  customerId?: string
  customerName?: string
  userId: string
  userName?: string
  note?: string
  paymentMethod: string
  status: string
  total: number
  items: InvoiceItem[]
}

export interface InvoicePDFProps {
  invoice: Invoice
  pharmacyName: string
  pharmacyAddress: string
  pharmacyPhone: string
}

export function InvoicePDF({ invoice, pharmacyName, pharmacyAddress, pharmacyPhone }: InvoicePDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{pharmacyName}</Text>
          <Text style={styles.subtitle}>{pharmacyAddress}</Text>
          <Text style={styles.subtitle}>Điện thoại: {pharmacyPhone}</Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <Text style={styles.title}>HÓA ĐƠN BÁN HÀNG</Text>
          <Text style={styles.subtitle}>Mã hóa đơn: {invoice.code}</Text>
          <Text style={styles.subtitle}>Ngày: {formatDate(invoice.date)}</Text>
          <Text style={styles.subtitle}>Khách hàng: {invoice.customerName || "Khách lẻ"}</Text>
          <Text style={styles.subtitle}>Nhân viên: {invoice.userName || ""}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>

          {/* Header Row */}
          <View style={styles.row}>
            <Text style={[styles.column, styles.columnHeader]}>STT</Text>
            <Text style={[{ flex: 3 }, styles.columnHeader]}>Tên thuốc</Text>
            <Text style={[styles.column, styles.columnHeader]}>SL</Text>
            <Text style={[styles.column, styles.columnHeader]}>Đơn giá</Text>
            <Text style={[styles.column, styles.columnHeader]}>Thành tiền</Text>
          </View>

          {/* Item Rows */}
          {invoice.items.map((item, index) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.column}>{index + 1}</Text>
              <Text style={{ flex: 3 }}>{item.medicineName}</Text>
              <Text style={styles.column}>{item.quantity}</Text>
              <Text style={styles.column}>{formatCurrency(item.price)}</Text>
              <Text style={styles.column}>{formatCurrency(item.total)}</Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Phương thức thanh toán: {invoice.paymentMethod}</Text>
          <Text>Trạng thái: {invoice.status}</Text>
          {invoice.note && <Text>Ghi chú: {invoice.note}</Text>}
        </View>
      </Page>
    </Document>
  )
}

export function InvoicePdf({ invoiceData }: { invoiceData: InvoiceWithDetails }) {
  // Chuyển đổi dữ liệu từ invoiceData sang định dạng Invoice
  const invoice: Invoice = {
    id: invoiceData.id || "",
    code: invoiceData.id || "",
    date: invoiceData.createdAt || new Date(),
    customerId: invoiceData.customer?.id,
    customerName: invoiceData.customer?.name || "Khách lẻ",
    userId: invoiceData.userId || "",
    userName: invoiceData.user?.name || "",
    note: invoiceData.note,
    paymentMethod: invoiceData.paymentMethod || "Tiền mặt",
    status: invoiceData.status || "Đã thanh toán",
    total: invoiceData.total || 0,
    items: (invoiceData.items || []).map((item: any) => ({
      id: item.id || "",
      medicineId: item.medicineId || item.medicine?.id || "",
      medicineName: item.medicine?.name || "Không xác định",
      quantity: item.quantity || 0,
      price: item.price || 0,
      total: item.total || 0,
    })),
  }

  return (
    <InvoicePDF
      invoice={invoice}
      pharmacyName="Nhà thuốc ABC"
      pharmacyAddress="123 Đường XYZ, Quận 1, TP.HCM"
      pharmacyPhone="0123456789"
    />
  )
}
