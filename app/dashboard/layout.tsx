import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { HiddenResetButton } from "@/components/hidden-reset-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <HiddenResetButton />
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
