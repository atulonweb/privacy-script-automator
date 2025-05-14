
// Re-export toast functions from the hooks location
import { useToast, toast } from "@/hooks/use-toast";
import type { ToastProps, ToastActionElement } from "@/hooks/use-toast";

export { useToast, toast };
export type { ToastProps, ToastActionElement };
