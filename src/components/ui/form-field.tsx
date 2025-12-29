import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * FormField component for consistent form field styling
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  id,
  required = false,
  error,
  hint,
  className,
  children
}) => {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn("space-y-2", className)}>
      <label 
        htmlFor={fieldId}
        className="text-white text-sm font-medium block"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <p className="text-gray-400 text-xs">{hint}</p>
      )}
      
      {error && (
        <p className="text-red-400 text-xs flex items-center">
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export interface FormInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

/**
 * FormInput component combining FormField and Input
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, containerClassName, className, required, ...props }, ref) => {
    const fieldId = props.id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <FormField
        label={label}
        id={fieldId}
        required={required}
        error={error}
        hint={hint}
        className={containerClassName}
      >
        <Input
          ref={ref}
          id={fieldId}
          className={cn(
            error && "border-red-400 focus:border-red-400",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

export interface FormTextareaProps extends React.ComponentProps<"textarea"> {
  label: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

/**
 * FormTextarea component combining FormField and Textarea
 */
export const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, containerClassName, className, required, ...props }, ref) => {
    const fieldId = props.id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <FormField
        label={label}
        id={fieldId}
        required={required}
        error={error}
        hint={hint}
        className={containerClassName}
      >
        <Textarea
          ref={ref}
          id={fieldId}
          className={cn(
            error && "border-red-400 focus:border-red-400",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormField as default };