"use client"

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { formatDate, formatCurrency } from "@/lib/utils"

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

interface ImportItem {
  id: string
  medicineId: string
  medicineName?: string
  lotNumber: string
  expiryDate: string | Date
  quantity: number
  price: number
  total: number
}

interface Import {
  id: string
  code: string
  date: string | Date
  supplierId: string
  supplierName?: string
  userId: string
  userName?: string
  note?: string
  status: string
  total: number
  items: ImportItem[]
}

interface ImportPDFProps {
  importData: Import
  pharmacyName: string
  pharmacyAddress: string
  pharmacyPhone: string
}

export function ImportPDF({ importData, pharmacyName, pharmacyAddress, pharmacyPhone }: ImportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{pharmacyName}</Text>
          <Text style={styles.subtitle}>{pharmacyAddress}</Text>
          <Text style={styles.subtitle}>Điện thoại: {pharmacyPhone}</Text>
        </View>

        {/* Import Info */}
        <View style={styles.section}>
          <Text style={styles.title}>PHIẾU NHẬP KHO</Text>
          <Text style={styles.subtitle}>Mã phiếu: {importData.code}</Text>
          <Text style={styles.subtitle}>Ngày: {formatDate(importData.date)}</Text>
          <Text style={styles.subtitle}>Nhà cung cấp: {importData.supplierName || ""}</Text>
          <Text style={styles.subtitle}>Nhân viên: {importData.userName || ""}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết phiếu nhập</Text>

          {/* Header Row */}
          <View style={styles.row}>
            <Text style={[styles.column, styles.columnHeader]}>STT</Text>
            <Text style={[{ flex: 2 }, styles.columnHeader]}>Tên thuốc</Text>
            <Text style={[styles.column, styles.columnHeader]}>Số lô</Text>
            <Text style={[styles.column, styles.columnHeader]}>HSD</Text>
            <Text style={[styles.column, styles.columnHeader]}>SL</Text>
            <Text style={[styles.column, styles.columnHeader]}>Đơn giá</Text>
            <Text style={[styles.column, styles.columnHeader]}>Thành tiền</Text>
          </View>

          {/* Item Rows */}
          {importData.items.map((item, index) => (
            <View style={styles.row} key={item.id}>
              <Text style={styles.column}>{index + 1}</Text>
              <Text style={{ flex: 2 }}>{item.medicineName}</Text>
              <Text style={styles.column}>{item.lotNumber}</Text>
              <Text style={styles.column}>{formatDate(item.expiryDate)}</Text>
              <Text style={styles.column}>{item.quantity}</Text>
              <Text style={styles.column}>{formatCurrency(item.price)}</Text>
              <Text style={styles.column}>{formatCurrency(item.total)}</Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalValue}>{formatCurrency(importData.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Trạng thái: {importData.status}</Text>
          {importData.note && <Text>Ghi chú: {importData.note}</Text>}
        </View>
      </Page>
    </Document>
  )
}
