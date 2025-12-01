import React, { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = "info",
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-500 dark:border-green-700",
          text: "text-green-800 dark:text-green-200",
          icon: (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ),
        };
      case "error":
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-500 dark:border-red-700",
          text: "text-red-800 dark:text-red-200",
          icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-500 dark:border-yellow-700",
          text: "text-yellow-800 dark:text-yellow-200",
          icon: (
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          ),
        };
      case "info":
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-500 dark:border-blue-700",
          text: "text-blue-800 dark:text-blue-200",
          icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg w-full ${
        styles.bg
      } ${styles.border} ${styles.text} ${
        isExiting
          ? "animate-slide-out-right opacity-0"
          : "animate-slide-in-right"
      } transition-all duration-300`}
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <p className="flex-1 text-sm font-medium break-words word-break min-w-0">
        {message}
      </p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemove: (id: string) => void;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = "top-right",
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  return (
    <div
      className={`fixed ${getPositionStyles()} z-50 flex flex-col gap-3 w-full max-w-md px-4`}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onRemove} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (
    message: string,
    type: ToastType = "info",
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      showToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
  };
};
