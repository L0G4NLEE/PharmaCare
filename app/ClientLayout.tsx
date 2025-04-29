"use client"

import type React from "react"

import { useEffect } from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { initializeData } from "@/lib/local-storage-db"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Khởi tạo dữ liệu khi ứng dụng khởi động
    initializeData()
  }, [])

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <title>Hệ thống quản lý nhà thuốc</title>
        <meta name="description" content="Hệ thống quản lý nhà thuốc hiện đại" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
