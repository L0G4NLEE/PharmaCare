// Kiểm tra xem file này tồn tại và được import đúng
import { useToast as useToastOriginal } from "@/components/ui/use-toast"

export const useToast = useToastOriginal
export { toast } from "@/components/ui/use-toast"
