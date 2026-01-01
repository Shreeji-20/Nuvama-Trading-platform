import React, { useState, FormEvent } from "react";
import { AlertCircle } from "lucide-react";

// Field Types
export type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "select"
  | "textarea"
  | "checkbox"
  | "radio"
  | "date"
  | "time"
  | "datetime-local";

export interface FormField {
  /** Unique field identifier */
  name: string;
  /** Field label */
  label: string;
  /** Field type */
  type?: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: any;
  /** Is field required */
  required?: boolean;
  /** Is field disabled */
  disabled?: boolean;
  /** Options for select/radio */
  options?: Array<{ label: string; value: string | number }>;
  /** Validation function */
  validate?: (value: any, formData: Record<string, any>) => string | null;
  /** Help text below field */
  helpText?: string;
  /** Min value (for number/date) */
  min?: number | string;
  /** Max value (for number/date) */
  max?: number | string;
  /** Step value (for number) */
  step?: number;
  /** Rows for textarea */
  rows?: number;
  /** Custom className */
  className?: string;
  /** Show field conditionally */
  show?: (formData: Record<string, any>) => boolean;
  /** Grid column span (1-12) */
  colSpan?: number;
}

export interface FormButton {
  /** Button label */
  label: string;
  /** Button type */
  type?: "submit" | "reset" | "button";
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: "primary" | "secondary" | "danger" | "success";
  /** Is button disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export interface FlexibleFormProps {
  /** Form fields configuration */
  fields: FormField[];
  /** Form submit handler */
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Form cancel/close handler */
  onCancel?: () => void;
  /** Initial form data */
  initialData?: Record<string, any>;
  /** Form title */
  title?: string;
  /** Form description */
  description?: string;
  /** Custom submit button label */
  submitLabel?: string;
  /** Custom cancel button label */
  cancelLabel?: string;
  /** Show cancel button */
  showCancelButton?: boolean;
  /** Custom buttons (replaces default submit/cancel) */
  customButtons?: FormButton[];
  /** Grid columns (1-6) */
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Compact mode (smaller padding/spacing) */
  compact?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Validate on change */
  validateOnChange?: boolean;
}

export const FlexibleForm: React.FC<FlexibleFormProps> = ({
  fields,
  onSubmit,
  onCancel,
  initialData = {},
  title,
  description,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showCancelButton = true,
  customButtons,
  columns = 1,
  compact = false,
  loading = false,
  className = "",
  validateOnChange = false,
}) => {
  // Initialize formData with default values from fields, then override with initialData
  const getInitialFormData = () => {
    const defaults: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    return { ...defaults, ...initialData };
  };

  const [formData, setFormData] = useState<Record<string, any>>(
    getInitialFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Handle field change
  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on change if enabled
    if (validateOnChange) {
      const field = fields.find((f) => f.name === name);
      if (field?.validate) {
        const error = field.validate(value, formData);
        setErrors((prev) => ({
          ...prev,
          [name]: error || "",
        }));
      }
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      // Skip hidden fields
      if (field.show && !field.show(formData)) return;

      const value = formData[field.name];

      // Required validation
      if (field.required && !value && value !== 0 && value !== false) {
        newErrors[field.name] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validate && value) {
        const error = field.validate(value, formData);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      fields.forEach((field) => {
        allTouched[field.name] = true;
      });
      setTouched(allTouched);
      return;
    }

    await onSubmit(formData);
  };

  // Handle reset
  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

  // Get grid column class
  const getGridClass = () => {
    const colMap = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-6",
    };
    return colMap[columns];
  };

  // Get button variant class
  const getButtonVariantClass = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "secondary":
        return "bg-gray-600 hover:bg-gray-700 text-white";
      case "danger":
        return "bg-red-600 hover:bg-red-700 text-white";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  // Render field
  const renderField = (field: FormField) => {
    // Check if field should be shown
    if (field.show && !field.show(formData)) return null;

    const value = formData[field.name] ?? field.defaultValue ?? "";
    const error = touched[field.name] && errors[field.name];
    const colSpanClass = field.colSpan ? `col-span-${field.colSpan}` : "";

    const baseInputClass = `w-full px-3 ${
      compact ? "py-1.5 text-sm" : "py-2"
    } border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 
    transition-all ${
      error
        ? "border-red-500 dark:border-red-400"
        : "border-gray-300 dark:border-gray-600"
    } ${field.disabled ? "opacity-50 cursor-not-allowed" : ""} ${
      field.className || ""
    }`;

    return (
      <div key={field.name} className={colSpanClass}>
        {/* Label */}
        <label
          className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${
            compact ? "mb-1" : "mb-1.5"
          }`}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input Field */}
        {field.type === "select" ? (
          <select
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={field.disabled}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            disabled={field.disabled}
            required={field.required}
            rows={field.rows || 3}
            className={baseInputClass}
          />
        ) : field.type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled}
              required={field.required}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            {field.helpText && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {field.helpText}
              </span>
            )}
          </div>
        ) : field.type === "radio" ? (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.disabled}
                  required={field.required}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <input
            type={field.type || "text"}
            value={value}
            onChange={(e) => {
              const newValue =
                field.type === "number"
                  ? Number(e.target.value)
                  : e.target.value;
              handleChange(field.name, newValue);
            }}
            placeholder={field.placeholder}
            disabled={field.disabled}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClass}
          />
        )}

        {/* Help Text */}
        {field.helpText && field.type !== "checkbox" && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {field.helpText}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Header */}
      {(title || description) && (
        <div className={compact ? "mb-3" : "mb-4"}>
          {title && (
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Fields Grid */}
      <div className={`grid ${getGridClass()} gap-${compact ? "3" : "4"}`}>
        {fields.map(renderField)}
      </div>

      {/* Buttons */}
      <div
        className={`flex items-center gap-2 ${compact ? "mt-4" : "mt-6"} ${
          showCancelButton || customButtons ? "justify-end" : "justify-end"
        }`}
      >
        {customButtons ? (
          customButtons.map((button, idx) => (
            <button
              key={idx}
              type={button.type || "button"}
              onClick={button.onClick}
              disabled={button.disabled || loading}
              className={
                button.className ||
                `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getButtonVariantClass(
                  button.variant
                )} ${
                  button.disabled || loading
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`
              }
            >
              {button.label}
            </button>
          ))
        ) : (
          <>
            {showCancelButton && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${getButtonVariantClass(
                "primary"
              )} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Submitting..." : submitLabel}
            </button>
          </>
        )}
      </div>
    </form>
  );
};
