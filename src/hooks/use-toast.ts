
"use client";

import * as React from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

// Create a compatible type for our toast props
export type ToastProps = ExternalToast & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
};

export type ToasterToast = ToastProps & {
  id: string;
};

// Create the useToast hook for React components
const useToast = () => {
  // Create the toast function
  const toast = React.useMemo(() => {
    // Base toast function
    const toastFn = (props: ToastProps) => {
      // Map our variant to sonner's style
      let style: Record<string, unknown> = {};
      if (props.variant === "destructive") {
        style = { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" };
      } else if (props.variant === "success") {
        style = { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" };
      }

      return sonnerToast(props.title as string, {
        description: props.description,
        action: props.action,
        style,
        ...props,
      });
    };

    // Add variant methods
    toastFn.success = (props: Omit<ToastProps, "variant">) => {
      return sonnerToast.success(props.title as string, {
        description: props.description,
        action: props.action,
        ...props,
      });
    };

    toastFn.error = (props: Omit<ToastProps, "variant">) => {
      return sonnerToast.error(props.title as string, {
        description: props.description,
        action: props.action,
        ...props,
      });
    };

    toastFn.warning = (props: Omit<ToastProps, "variant">) => {
      return sonnerToast.warning(props.title as string, {
        description: props.description,
        action: props.action,
        ...props,
      });
    };

    toastFn.info = (props: Omit<ToastProps, "variant">) => {
      return sonnerToast.info(props.title as string, {
        description: props.description,
        action: props.action,
        ...props,
      });
    };

    // Add toast dismiss function
    toastFn.dismiss = (toastId?: string) => {
      sonnerToast.dismiss(toastId);
    };

    return toastFn;
  }, []);

  // Return the custom toast function
  return {
    toast,
    // For compatibility with shadcn toast
    toasts: [],
  };
};

// For direct usage without the hook
const toast = (props: ToastProps) => {
  // Map our variant to sonner's style
  let style: Record<string, unknown> = {};
  if (props.variant === "destructive") {
    style = { backgroundColor: "hsl(var(--destructive))", color: "hsl(var(--destructive-foreground))" };
  } else if (props.variant === "success") {
    style = { backgroundColor: "hsl(var(--success))", color: "hsl(var(--success-foreground))" };
  }
  
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    style,
    ...props,
  });
};

// Add variant methods
toast.success = (props: Omit<ToastProps, "variant">) => {
  return sonnerToast.success(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
  });
};

toast.error = (props: Omit<ToastProps, "variant">) => {
  return sonnerToast.error(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
  });
};

toast.warning = (props: Omit<ToastProps, "variant">) => {
  return sonnerToast.warning(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
  });
};

toast.info = (props: Omit<ToastProps, "variant">) => {
  return sonnerToast.info(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
  });
};

// Add toast dismiss function
toast.dismiss = (toastId?: string) => {
  sonnerToast.dismiss(toastId);
};

export { useToast, toast };
export type Toast = typeof toast;
export type ToastActionElement = React.ReactElement;
