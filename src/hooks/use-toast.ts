
"use client";

import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type ToastProps = React.ComponentPropsWithoutRef<typeof sonnerToast>;

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const useToast = () => {
  const toast = (props: ToasterToast) => {
    return sonnerToast(props.title as string, {
      description: props.description,
      action: props.action,
      ...props,
    });
  };

  toast.success = (props: Omit<ToasterToast, "variant">) => {
    return toast({ ...props, variant: "default" });
  };

  toast.error = (props: Omit<ToasterToast, "variant">) => {
    return toast({ ...props, variant: "destructive" });
  };

  toast.warning = (props: Omit<ToasterToast, "variant">) => {
    return toast({ ...props, variant: "warning" });
  };

  toast.info = (props: Omit<ToasterToast, "variant">) => {
    return toast({ ...props, variant: "default" });
  };

  return toast;
};

export { useToast };

// For direct usage without the hook
const directToast = (props: ToasterToast) => {
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
  });
};

directToast.success = (props: Omit<ToasterToast, "variant">) => {
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
    variant: "default",
  });
};

directToast.error = (props: Omit<ToasterToast, "variant">) => {
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
    variant: "destructive",
  });
};

directToast.warning = (props: Omit<ToasterToast, "variant">) => {
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
    variant: "warning",
  });
};

directToast.info = (props: Omit<ToasterToast, "variant">) => {
  return sonnerToast(props.title as string, {
    description: props.description,
    action: props.action,
    ...props,
    variant: "default",
  });
};

export const toast = directToast;

export type Toast = typeof toast;
export type ToastActionElement = React.ReactElement;
