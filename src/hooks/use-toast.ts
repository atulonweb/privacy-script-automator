
// Re-export toast functions from the hooks location
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";
import type { ToastProps, ToastActionElement } from "@/hooks/use-toast";

// Re-export with consistent names
export const useToast = useToastHook;
export const toast = toastFunction;
export type { ToastProps, ToastActionElement };
