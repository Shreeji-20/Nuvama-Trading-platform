import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export interface PopperProps {
  /** Whether the popper is open */
  open: boolean;
  /** Callback when popper should close */
  onClose: () => void;
  /** The trigger element (button, etc.) */
  trigger?: React.ReactNode;
  /** The content to display in the popper */
  children: React.ReactNode;
  /** Position relative to trigger */
  placement?:
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "left"
    | "left-start"
    | "left-end"
    | "right"
    | "right-start"
    | "right-end";
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom width */
  width?: string;
  /** Custom max width */
  maxWidth?: string;
  /** Show backdrop overlay */
  showBackdrop?: boolean;
  /** Title for the popper */
  title?: string;
  /** Custom className for content */
  className?: string;
  /** Offset from trigger (in pixels) */
  offset?: number;
  /** z-index value */
  zIndex?: number;
}

export const Popper: React.FC<PopperProps> = ({
  open,
  onClose,
  trigger,
  children,
  placement = "bottom-start",
  closeOnClickOutside = true,
  closeOnEscape = true,
  showCloseButton = true,
  width = "auto",
  maxWidth = "32rem",
  showBackdrop = false,
  title,
  className = "",
  offset = 8,
  zIndex = 50,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on trigger and placement
  useEffect(() => {
    if (!open || !triggerRef.current || !popperRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const popperRect = popperRef.current!.getBoundingClientRect();

      let top = 0;
      let left = 0;

      // Calculate position based on placement
      switch (placement) {
        case "top":
          top = triggerRect.top - popperRect.height - offset;
          left =
            triggerRect.left + triggerRect.width / 2 - popperRect.width / 2;
          break;
        case "top-start":
          top = triggerRect.top - popperRect.height - offset;
          left = triggerRect.left;
          break;
        case "top-end":
          top = triggerRect.top - popperRect.height - offset;
          left = triggerRect.right - popperRect.width;
          break;
        case "bottom":
          top = triggerRect.bottom + offset;
          left =
            triggerRect.left + triggerRect.width / 2 - popperRect.width / 2;
          break;
        case "bottom-start":
          top = triggerRect.bottom + offset;
          left = triggerRect.left;
          break;
        case "bottom-end":
          top = triggerRect.bottom + offset;
          left = triggerRect.right - popperRect.width;
          break;
        case "left":
          top =
            triggerRect.top + triggerRect.height / 2 - popperRect.height / 2;
          left = triggerRect.left - popperRect.width - offset;
          break;
        case "left-start":
          top = triggerRect.top;
          left = triggerRect.left - popperRect.width - offset;
          break;
        case "left-end":
          top = triggerRect.bottom - popperRect.height;
          left = triggerRect.left - popperRect.width - offset;
          break;
        case "right":
          top =
            triggerRect.top + triggerRect.height / 2 - popperRect.height / 2;
          left = triggerRect.right + offset;
          break;
        case "right-start":
          top = triggerRect.top;
          left = triggerRect.right + offset;
          break;
        case "right-end":
          top = triggerRect.bottom - popperRect.height;
          left = triggerRect.right + offset;
          break;
      }

      // Keep popper within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (left < 0) left = 8;
      if (left + popperRect.width > viewportWidth)
        left = viewportWidth - popperRect.width - 8;
      if (top < 0) top = 8;
      if (top + popperRect.height > viewportHeight)
        top = viewportHeight - popperRect.height - 8;

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, placement, offset]);

  // Handle click outside
  useEffect(() => {
    if (!open || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, closeOnClickOutside, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  if (!open) return trigger ? <div ref={triggerRef}>{trigger}</div> : null;

  return (
    <>
      {trigger && <div ref={triggerRef}>{trigger}</div>}

      {/* Backdrop */}
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 transition-opacity"
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
        />
      )}

      {/* Popper Content */}
      <div
        ref={popperRef}
        className={`fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: width,
          maxWidth: maxWidth,
          zIndex: zIndex,
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </>
  );
};

// Hook for controlling popper state
export const usePopper = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);
  const openPopper = () => setIsOpen(true);

  return {
    open: isOpen,
    toggle,
    close,
    openPopper,
    setOpen: setIsOpen,
  };
};
