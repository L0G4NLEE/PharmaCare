"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Nếu tổng số trang ít hơn hoặc bằng maxPagesToShow, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1)

      // Tính toán trang bắt đầu và kết thúc để hiển thị
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Điều chỉnh nếu đang ở gần đầu hoặc cuối
      if (currentPage <= 3) {
        endPage = 4
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
      }

      // Thêm dấu ... nếu cần
      if (startPage > 2) {
        pageNumbers.push(-1) // -1 đại diện cho dấu ...
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Thêm dấu ... nếu cần
      if (endPage < totalPages - 1) {
        pageNumbers.push(-2) // -2 đại diện cho dấu ... khác
      }

      // Luôn hiển thị trang cuối cùng
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button variant="outline" size="icon" onClick={() => onPageChange(1)} disabled={!canGoPrevious} title="Trang đầu">
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        title="Trang trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-1">
        {getPageNumbers().map((pageNumber, index) => {
          if (pageNumber === -1 || pageNumber === -2) {
            return (
              <span key={`ellipsis-${index}`} className="px-2">
                ...
              </span>
            )
          }
          return (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNumber)}
              className="w-8 h-8 p-0"
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        title="Trang sau"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={!canGoNext}
        title="Trang cuối"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
