
import { Toast, toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function useToast() {
  const showToast = ({ title, description, action, variant }: ToastProps) => {
    const toastOptions: Toast = {
      description,
      action,
    };

    if (variant === "destructive") {
      return toast.error(title, toastOptions);
    }

    return toast.success(title, toastOptions);
  };

  return { toast: showToast };
}

export { toast };
