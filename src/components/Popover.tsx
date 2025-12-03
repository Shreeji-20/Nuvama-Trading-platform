import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";

export type PopoverPlacement =
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
  | "right-end"
  | "auto";

export interface PopoverProps {
  /** The trigger button/element */
  trigger: React.ReactElement;
  /** The content to display in the popover */
  children: React.ReactNode;
  /** Position relative to trigger element */
  placement?: PopoverPlacement;
  /** Offset from trigger (in pixels) */
  offset?: number;
  /** Custom width */
  width?: string | number;
  /** Custom max width */
  maxWidth?: string | number;
  /** Custom min width */
  minWidth?: string | number;
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
  /** Show close button */
  showCloseButton?: boolean;
  /** Show backdrop overlay */
  showBackdrop?: boolean;
  /** Title for the popover */
  title?: string;
  /** Custom className for popover content */
  className?: string;
  /** Custom className for trigger wrapper */
  triggerClassName?: string;
  /** z-index value */
  zIndex?: number;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Arrow pointing to trigger */
  showArrow?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Trigger mode */
  triggerMode?: "click" | "hover" | "focus";
  /** Hover delay in ms (only for hover mode) */
  hoverDelay?: number;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  placement = "bottom",
  offset = 8,
  width = "auto",
  maxWidth = "20rem",
  minWidth,
  closeOnClickOutside = true,
  closeOnEscape = true,
  showCloseButton = false,
  showBackdrop = false,
  title,
  className = "",
  triggerClassName = "",
  zIndex = 1000,
  animationDuration = 200,
  showArrow = true,
  disabled = false,
  open: controlledOpen,
  onOpenChange,
  triggerMode = "click",
  hoverDelay = 200,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [actualPlacement, setActualPlacement] =
    useState<PopoverPlacement>(placement);
  const [isAnimating, setIsAnimating] = useState(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if popover is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (disabled) return;

      if (!isControlled) {
        setInternalOpen(value);
      }
      onOpenChange?.(value);
    },
    [disabled, isControlled, onOpenChange]
  );

  // Calculate best placement when "auto" is selected
  const calculateBestPlacement = useCallback(
    (triggerRect: DOMRect, popoverRect: DOMRect): PopoverPlacement => {
      if (placement !== "auto") return placement;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const spaceTop = triggerRect.top;
      const spaceBottom = viewportHeight - triggerRect.bottom;
      const spaceLeft = triggerRect.left;
      const spaceRight = viewportWidth - triggerRect.right;

      // Determine best vertical position
      const preferBottom =
        spaceBottom >= popoverRect.height || spaceBottom > spaceTop;

      // Determine best horizontal alignment
      const preferCenter =
        triggerRect.left + triggerRect.width / 2 > popoverRect.width / 2 &&
        viewportWidth - (triggerRect.left + triggerRect.width / 2) >
          popoverRect.width / 2;

      if (preferBottom) {
        if (preferCenter) return "bottom";
        if (spaceRight > spaceLeft) return "bottom-start";
        return "bottom-end";
      } else {
        if (preferCenter) return "top";
        if (spaceRight > spaceLeft) return "top-start";
        return "top-end";
      }
    },
    [placement]
  );

  // Calculate position based on trigger and placement
  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !popoverRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();

    const bestPlacement = calculateBestPlacement(triggerRect, popoverRect);
    setActualPlacement(bestPlacement);

    let top = 0;
    let left = 0;

    const arrowOffset = showArrow ? 8 : 0;

    // Calculate position based on placement
    switch (bestPlacement) {
      case "top":
        top = triggerRect.top - popoverRect.height - offset - arrowOffset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        break;
      case "top-start":
        top = triggerRect.top - popoverRect.height - offset - arrowOffset;
        left = triggerRect.left;
        break;
      case "top-end":
        top = triggerRect.top - popoverRect.height - offset - arrowOffset;
        left = triggerRect.right - popoverRect.width;
        break;
      case "bottom":
        top = triggerRect.bottom + offset + arrowOffset;
        left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
        break;
      case "bottom-start":
        top = triggerRect.bottom + offset + arrowOffset;
        left = triggerRect.left;
        break;
      case "bottom-end":
        top = triggerRect.bottom + offset + arrowOffset;
        left = triggerRect.right - popoverRect.width;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        left = triggerRect.left - popoverRect.width - offset - arrowOffset;
        break;
      case "left-start":
        top = triggerRect.top;
        left = triggerRect.left - popoverRect.width - offset - arrowOffset;
        break;
      case "left-end":
        top = triggerRect.bottom - popoverRect.height;
        left = triggerRect.left - popoverRect.width - offset - arrowOffset;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2;
        left = triggerRect.right + offset + arrowOffset;
        break;
      case "right-start":
        top = triggerRect.top;
        left = triggerRect.right + offset + arrowOffset;
        break;
      case "right-end":
        top = triggerRect.bottom - popoverRect.height;
        left = triggerRect.right + offset + arrowOffset;
        break;
    }

    // Keep popover within viewport with padding
    const viewportPadding = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < viewportPadding) left = viewportPadding;
    if (left + popoverRect.width > viewportWidth - viewportPadding) {
      left = viewportWidth - popoverRect.width - viewportPadding;
    }
    if (top < viewportPadding) top = viewportPadding;
    if (top + popoverRect.height > viewportHeight - viewportPadding) {
      top = viewportHeight - popoverRect.height - viewportPadding;
    }

    setPosition({ top, left });
  }, [offset, showArrow, calculateBestPlacement]);

  // Update position when popover opens or window resizes
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Handle click outside
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    // Small delay to prevent immediate close on trigger click
    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeOnClickOutside, setOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeOnEscape, setOpen]);

  // Animation effect
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, animationDuration]);

  // Handle trigger click/hover/focus
  const handleTriggerClick = () => {
    if (triggerMode === "click") {
      setOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (triggerMode === "hover") {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, hoverDelay);
    }
  };

  const handleMouseLeave = () => {
    if (triggerMode === "hover") {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, hoverDelay);
    }
  };

  const handleFocus = () => {
    if (triggerMode === "focus") {
      setOpen(true);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (triggerMode === "focus") {
      // Don't close if focus moved to popover content
      if (!popoverRef.current?.contains(e.relatedTarget as Node)) {
        setOpen(false);
      }
    }
  };

  // Get arrow style based on placement
  const getArrowStyle = (): React.CSSProperties => {
    const arrowSize = 8;
    const base: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
    };

    if (actualPlacement.startsWith("top")) {
      return {
        ...base,
        bottom: -arrowSize,
        left:
          actualPlacement === "top-end"
            ? "auto"
            : actualPlacement === "top-start"
            ? "1rem"
            : "50%",
        right: actualPlacement === "top-end" ? "1rem" : "auto",
        transform: actualPlacement === "top" ? "translateX(-50%)" : "none",
        borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
        borderColor:
          "var(--popover-border-color) transparent transparent transparent",
      };
    } else if (actualPlacement.startsWith("bottom")) {
      return {
        ...base,
        top: -arrowSize,
        left:
          actualPlacement === "bottom-end"
            ? "auto"
            : actualPlacement === "bottom-start"
            ? "1rem"
            : "50%",
        right: actualPlacement === "bottom-end" ? "1rem" : "auto",
        transform: actualPlacement === "bottom" ? "translateX(-50%)" : "none",
        borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
        borderColor:
          "transparent transparent var(--popover-border-color) transparent",
      };
    } else if (actualPlacement.startsWith("left")) {
      return {
        ...base,
        right: -arrowSize,
        top:
          actualPlacement === "left-end"
            ? "auto"
            : actualPlacement === "left-start"
            ? "1rem"
            : "50%",
        bottom: actualPlacement === "left-end" ? "1rem" : "auto",
        transform: actualPlacement === "left" ? "translateY(-50%)" : "none",
        borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
        borderColor:
          "transparent transparent transparent var(--popover-border-color)",
      };
    } else {
      return {
        ...base,
        left: -arrowSize,
        top:
          actualPlacement === "right-end"
            ? "auto"
            : actualPlacement === "right-start"
            ? "1rem"
            : "50%",
        bottom: actualPlacement === "right-end" ? "1rem" : "auto",
        transform: actualPlacement === "right" ? "translateY(-50%)" : "none",
        borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
        borderColor:
          "transparent var(--popover-border-color) transparent transparent",
      };
    }
  };

  // Clone trigger element and attach ref and handlers
  const triggerElement = React.cloneElement(trigger, {
    ref: triggerRef,
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      handleTriggerClick();
    },
    onMouseEnter: (e: React.MouseEvent) => {
      trigger.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      trigger.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onFocus: (e: React.FocusEvent) => {
      trigger.props.onFocus?.(e);
      handleFocus();
    },
    onBlur: (e: React.FocusEvent) => {
      trigger.props.onBlur?.(e);
      handleBlur(e);
    },
    disabled: disabled || trigger.props.disabled,
    "aria-expanded": isOpen,
    "aria-haspopup": "true",
  } as any);

  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const maxWidthStyle =
    typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth;
  const minWidthStyle =
    typeof minWidth === "number" ? `${minWidth}px` : minWidth;

  return (
    <>
      <div className={`inline-block ${triggerClassName}`}>{triggerElement}</div>

      {isOpen && (
        <>
          {/* Backdrop */}
          {showBackdrop && (
            <div
              className="fixed inset-0 bg-black/20 dark:bg-black/40 transition-opacity"
              style={{
                zIndex: zIndex - 1,
                opacity: isAnimating ? 0 : 1,
                transition: `opacity ${animationDuration}ms ease-in-out`,
              }}
              onClick={() => setOpen(false)}
            />
          )}

          {/* Popover Content */}
          <div
            ref={popoverRef}
            className={`
              fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700
              ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}
              transition-all duration-${animationDuration}
              ${className}
            `}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: widthStyle,
              maxWidth: maxWidthStyle,
              minWidth: minWidthStyle,
              zIndex: zIndex,
              transformOrigin: actualPlacement.includes("top")
                ? "bottom"
                : actualPlacement.includes("bottom")
                ? "top"
                : actualPlacement.includes("left")
                ? "right"
                : "left",
              // @ts-ignore - CSS variable
              "--popover-border-color": "rgb(229, 231, 235)",
            }}
            onMouseEnter={
              triggerMode === "hover" ? handleMouseEnter : undefined
            }
            onMouseLeave={
              triggerMode === "hover" ? handleMouseLeave : undefined
            }
          >
            {/* Arrow */}
            {showArrow && <div style={getArrowStyle()} />}

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
                    onClick={() => setOpen(false)}
                    className="ml-auto p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Close popover"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Hook for controlling popover state
export const usePopover = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
};
