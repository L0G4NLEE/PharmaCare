import { Skeleton } from "@/components/ui/skeleton"
import { Header } from "@/components/header"

export default function LoadingSuppliers() {
  return (
    <>
      <Header title="Quản lý nhà cung cấp" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-6 flex-1" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t flex justify-center">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </main>
    </>
  )
}
