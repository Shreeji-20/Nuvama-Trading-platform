import React, { useEffect } from "react";

export type ModalPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "custom";

export type ModalButton = {
  key: string;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  className?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: React.ReactNode;
  position?: ModalPosition;
  width?: string; // tailwind friendly e.g. 'w-full md:w-1/2' or raw css like '400px'
  height?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  footerButtons?: ModalButton[];
  backdropClassName?: string;
  modalClassName?: string; // extra custom classes for the inner modal
  style?: React.CSSProperties; // pass raw styles (useful for pixel sizes)
};

const positionToClasses = (pos?: ModalPosition) => {
  switch (pos) {
    case "top":
      return "items-start justify-center pt-12";
    case "bottom":
      return "items-end justify-center pb-12";
    case "left":
      return "items-center justify-start pl-6";
    case "right":
      return "items-center justify-end pr-6";
    case "custom":
      return ""; // user can provide custom styles via modalClassName or style prop
    case "center":
    default:
      return "items-center justify-center";
  }
};

export default function FlexibleModal({
  isOpen,
  onClose,
  children,
  title,
  position = "center",
  width = "w-full max-w-lg",
  height,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  footerButtons = [],
  backdropClassName = "bg-black/40",
  modalClassName = "bg-white rounded-2xl shadow-2xl p-4",
  style,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc) onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden"; // prevent background scroll when modal open

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (!closeOnBackdropClick) return;
    // click on backdrop only if target === currentTarget (not clicking inside modal)
    if (e.target === e.currentTarget) onClose();
  };

  const posClasses = positionToClasses(position);

  // allow width to be raw css (contains px) or tailwind classes
  const widthClass = /px|%/.test(width) ? "" : width;
  const modalStyle: React.CSSProperties = {
    ...(style || {}),
    ...(/px|%/.test(width) ? { width } : {}),
    ...(height ? { height } : {}),
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex ${posClasses} px-4`}
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      <div className={`absolute inset-0 ${backdropClassName}`} />

      <div
        className={`relative z-10 ${widthClass} ${modalClassName}`}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()} // prevent inner clicks from bubbling to backdrop
      >
        <div className="flex items-start justify-between gap-4">
          {title ? (
            <div className="text-lg font-semibold">{title}</div>
          ) : (
            <div />
          )}
          {showCloseButton && (
            <button
              aria-label="Close modal"
              onClick={onClose}
              className="ml-auto inline-flex items-center justify-center rounded-full p-1 hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="mt-3">{children}</div>

        {footerButtons && footerButtons.length > 0 && (
          <div className="mt-6 flex items-center justify-end gap-3">
            {footerButtons.map((b) => (
              <button
                key={b.key}
                onClick={() => b.onClick && b.onClick()}
                disabled={b.disabled}
                className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                  b.className
                    ? b.className
                    : b.variant === "primary"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : b.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*
  USAGE EXAMPLES:

  1) Centered modal with simple content

  <FlexibleModal isOpen={open} onClose={() => setOpen(false)} title="Hello">
    <p>This is the content area — put forms, lists, or any react nodes here.</p>
  </FlexibleModal>

  2) Bottom-positioned modal with footer buttons and fixed pixel width

  <FlexibleModal
    isOpen={open}
    onClose={() => setOpen(false)}
    position="bottom"
    width="380px"
    footerButtons={[
      { key: 'cancel', label: 'Cancel', onClick: () => setOpen(false) },
      { key: 'save', label: 'Save', variant: 'primary', onClick: handleSave }
    ]}
  >
    <MyForm />
  </FlexibleModal>

  3) Right-side drawer style

  <FlexibleModal
    isOpen={drawerOpen}
    onClose={() => setDrawerOpen(false)}
    position="right"
    width="w-full md:w-96"
    modalClassName="bg-white h-full rounded-l-2xl shadow-2xl p-6"
  >
    <DrawerContent />
  </FlexibleModal>

*/
