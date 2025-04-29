"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Download } from "lucide-react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface PDFGeneratorProps {
  title: string
  filename: string
  type?: "invoice" | "import"
  data?: any
  children: React.ReactNode
}

export function PDFGenerator({ title, filename, children }: PDFGeneratorProps) {
  const [isClient, setIsClient] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const generatePDF = async () => {
    if (!isClient) return

    setIsGenerating(true)

    try {
      const content = document.getElementById("pdf-content")
      if (!content) return

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!isClient) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải...
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div id="pdf-content" className="bg-white p-6 rounded-lg border">
        {children}
      </div>

      <Button onClick={generatePDF} disabled={isGenerating} className="w-full">
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang tạo PDF...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Tải xuống PDF
          </>
        )}
      </Button>
    </div>
  )
}
