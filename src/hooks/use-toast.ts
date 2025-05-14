
import { useToast as useShadcnToast } from "@/components/ui/toast";
import { toast as shadcnToast } from "@/components/ui/toast";

// Re-export the toast hook and function
export const useToast = useShadcnToast;
export const toast = shadcnToast;

export type { ToastProps, ToastActionElement } from "@/components/ui/toast";
