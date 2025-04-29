"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Pill,
  FileText,
  PackageOpen,
  Users,
  Package,
  AlertCircle,
  Settings,
  LogOut,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { signOut } from "next-auth/react"

const menuItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Quản lý thuốc",
    href: "/dashboard/medicines",
    icon: Pill,
  },
  {
    title: "Hóa đơn bán hàng",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Nhập hàng",
    href: "/dashboard/imports",
    icon: PackageOpen,
  },
  {
    title: "Khách hàng",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Kho hàng",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "Báo cáo",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    title: "Tương tác thuốc",
    href: "/dashboard/interactions",
    icon: AlertCircle,
  },
  {
    title: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Kiểm tra localStorage",
    href: "/dashboard/inspect-storage",
    icon: Database,
  },
  {
    title: "Xem Dữ Liệu",
    href: "/dashboard/data-viewer",
    icon: Database,
  },
  {
    title: "Cập Nhật Dữ Liệu",
    href: "/dashboard/update-data",
    icon: Database,
  },
  {
    title: "Xem Dữ Liệu",
    href: "/dashboard/view-data",
    icon: Database,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <div className="w-64 border-r h-screen flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <div className="bg-blue-500 text-white p-1 rounded">
          <Pill className="h-5 w-5" />
        </div>
        <h1 className="font-bold text-lg">PharmaCare</h1>
      </div>

      <div className="flex-1 py-4 overflow-auto">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-100",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500"
          size="sm"
          onClick={() => setIsLogoutDialogOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Đăng xuất
        </Button>
      </div>

      {/* Dialog xác nhận đăng xuất */}
      <ConfirmDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?"
        onConfirm={handleLogout}
        confirmText="Đăng xuất"
        cancelText="Hủy"
      />
    </div>
  )
}
