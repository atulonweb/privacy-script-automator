import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  // Since we're using sonner now, this component doesn't need to show toasts itself
  // But we'll keep it for compatibility with existing code
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}
