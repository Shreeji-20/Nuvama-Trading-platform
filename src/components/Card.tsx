import React from "react";

type PaddingOption = boolean | string;

const cx = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

export type CardProps = {
  children?: React.ReactNode;

  /** Optional card header content (renders above body). */
  header?: React.ReactNode;

  /** Convenience header title (ignored if `header` is provided). */
  title?: React.ReactNode;

  /** Convenience header subtitle (ignored if `header` is provided). */
  subtitle?: React.ReactNode;

  /** Right-side header content (e.g., buttons). Ignored if `header` is provided. */
  actions?: React.ReactNode;

  /** Optional card footer content (renders below body). */
  footer?: React.ReactNode;

  /** Extra Tailwind classes for the outer card wrapper. */
  className?: string;

  /** Extra Tailwind classes for header/body/footer wrappers. */
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;

  /** Pass raw styles when needed (e.g., fixed width/height). */
  style?: React.CSSProperties;

  /**
   * Control padding in header/body/footer.
   * - `true` (default): uses sensible defaults
   * - `false`: no padding
   * - string: custom Tailwind padding classes
   */
  padding?: PaddingOption;

  /** Optional click handler to make the whole card clickable. */
  onClick?: React.MouseEventHandler<HTMLDivElement>;

  /** Optional HTML attributes for the wrapper. */
  id?: string;
  role?: React.AriaRole;
};

const paddingToClasses = (
  padding: PaddingOption | undefined,
  fallback: string
) => {
  if (padding === false) return "";
  if (typeof padding === "string") return padding;
  return fallback;
};

/**
 * A customizable card component aligned with the project's light/dark Tailwind tokens.
 *
 * Usage examples:
 *
 * 1) Simple card
 *
 * <Card title="My Card">
 *   <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
 *     Body content goes here.
 *   </div>
 * </Card>
 *
 * 2) Card with header actions (buttons, toggles, etc.)
 *
 * <Card
 *   title="Deployed Strategies"
 *   subtitle="View and manage all deployed strategy configurations"
 *   actions={
 *     <div className="flex items-center gap-2">
 *       <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded-lg">
 *         Export
 *       </button>
 *       <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg">
 *         Refresh
 *       </button>
 *     </div>
 *   }
 * >
 *   ...content...
 * </Card>
 *
 * 3) Fully custom header layout (you control everything)
 *
 * <Card
 *   header={
 *     <div className="flex items-center justify-between">
 *       <div>
 *         <div className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
 *           Positions
 *         </div>
 *         <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
 *           Live view
 *         </div>
 *       </div>
 *       <div className="flex items-center gap-2">
 *         <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg">
 *           Add
 *         </button>
 *       </div>
 *     </div>
 *   }
 * >
 *   ...content...
 * </Card>
 *
 * 4) Footer + custom padding
 *
 * <Card
 *   title="Order Summary"
 *   padding="p-4"
 *   footer={
 *     <div className="flex justify-end gap-2">
 *       <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded-lg">
 *         Cancel
 *       </button>
 *       <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg">
 *         Save
 *       </button>
 *     </div>
 *   }
 * >
 *   ...content...
 * </Card>
 *
 * 5) Clickable card (whole card is clickable)
 *
 * <Card
 *   title="NIFTY"
 *   subtitle="Tap to open details"
 *   onClick={() => console.log("open")}
 *   className="hover:opacity-95"
 * >
 *   ...content...
 * </Card>
 */
const Card: React.FC<CardProps> = ({
  children,
  header,
  title,
  subtitle,
  actions,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  style,
  padding = true,
  onClick,
  id,
  role,
}) => {
  const wrapperClasses = cx(
    "bg-light-card-gradient dark:bg-dark-card-gradient",
    "rounded-xl",
    "border border-light-border dark:border-dark-border",
    "shadow-light-lg dark:shadow-dark-xl",
    onClick && "cursor-pointer",
    className
  );

  const headerPad = paddingToClasses(padding, "p-3");
  const bodyPad = paddingToClasses(padding, "p-3");
  const footerPad = paddingToClasses(padding, "p-3");

  const shouldRenderAutoHeader = !!(title || subtitle || actions);
  const shouldRenderHeader = !!header || shouldRenderAutoHeader;

  return (
    <div
      id={id}
      role={role}
      className={wrapperClasses}
      style={style}
      onClick={onClick}
    >
      {shouldRenderHeader && (
        <div className={cx(headerPad, headerClassName)}>
          {header ? (
            header
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {title && (
                  <div className="text-sm md:text-md font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="mt-0.5 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {subtitle}
                  </div>
                )}
              </div>
              {actions && <div className="shrink-0">{actions}</div>}
            </div>
          )}
        </div>
      )}

      {children !== undefined && children !== null && (
        <div className={cx(bodyPad, bodyClassName)}>{children}</div>
      )}

      {footer !== undefined && footer !== null && (
        <div className={cx(footerPad, footerClassName)}>{footer}</div>
      )}
    </div>
  );
};

export default Card;
