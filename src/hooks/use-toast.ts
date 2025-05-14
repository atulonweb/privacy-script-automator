
"use client";

import * as React from "react";
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

// Create a compatible type for our toast props
export type ToastProps = Omit<SonnerToast, "id"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
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
      return sonnerToast(props.title as string, {
        description: props.description,
        action: props.action,
        ...(props as any),
      });
    };

    // Add variant methods
    toastFn.success = (props: ToastProps) => {
      return sonnerToast.success(props.title as string, {
        description: props.description,
        action: props.action,
        ...(props as any),
      });
    };

    toastFn.error = (props: ToastProps) => {
      return sonnerToast.error(props.title as string, {
        description: props.description,
        action: props.action,
        ...(props as any),
      });
    };

    toastFn.warning = (props: ToastProps) => {
      return sonnerToast.warning(props.title as string, {
        description: props.description,
        action: props.action,
        ...(props as any),
      });
    };

    toastFn.info = (props: ToastProps) => {
      return sonnerToast.info(props.title as string, {
        description: props.description,
        action: props.action,
        ...(props as any),
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
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...(props as any),
  });
};

// Add variant methods
toast.success = (props: ToastProps) => {
  return sonnerToast.success(props.title as string, {
    description: props.description,
    action: props.action,
    ...(props as any),
  });
};

toast.error = (props: ToastProps) => {
  return sonnerToast.error(props.title as string, {
    description: props.description,
    action: props.action,
    ...(props as any),
  });
};

toast.warning = (props: ToastProps) => {
  return sonnerToast.warning(props.title as string, {
    description: props.description,
    action: props.action,
    ...(props as any),
  });
};

toast.info = (props: ToastProps) => {
  return sonnerToast.info(props.title as string, {
    description: props.description,
    action: props.action,
    ...(props as any),
  });
};

// Add toast dismiss function
toast.dismiss = (toastId?: string) => {
  sonnerToast.dismiss(toastId);
};

export { useToast, toast };
export type Toast = typeof toast;
export type ToastActionElement = React.ReactElement;
