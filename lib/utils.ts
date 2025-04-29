import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value)
}

export function formatDate(date: Date | string): string {
  if (!date) return ""

  const d = typeof date === "string" ? new Date(date) : date

  if (isNaN(d.getTime())) {
    // Nếu chuỗi ngày không hợp lệ, thử phân tích định dạng dd/mm/yyyy
    if (typeof date === "string" && date.includes("/")) {
      const parts = date.split("/")
      if (parts.length === 3) {
        const newDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        if (!isNaN(newDate.getTime())) {
          return `${parts[0]}/${parts[1]}/${parts[2]}`
        }
      }
    }
    return ""
  }

  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
}

export function generateRandomId(prefix = ""): string {
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase()
  return `${prefix}${randomPart}`
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}
