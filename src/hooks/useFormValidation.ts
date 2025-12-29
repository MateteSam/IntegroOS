import { useState, useCallback } from 'react';

export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  custom?: (value: any) => string | null;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

export type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Custom hook for form validation
 * 
 * @param initialValues Initial form values
 * @param validationRules Validation rules for each field
 * @returns Form state and validation functions
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {}
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  /**
   * Validate a single field
   */
  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String-based validations
    if (typeof value === 'string') {
      // Min length validation
      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be no more than ${rules.maxLength} characters`;
      }

      // Email validation
      if (rules.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
      }

      // URL validation
      if (rules.url) {
        try {
          new URL(value);
        } catch {
          return 'Please enter a valid URL';
        }
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Please enter a valid format';
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) return customError;
    }

    return null;
  }, [validationRules]);

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    Object.keys(validationRules).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationRules]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  /**
   * Handle field blur (for touched state)
   */
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  }, [values, validateField]);

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  /**
   * Set form values programmatically
   */
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Check if form is valid
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * Check if form has been modified
   */
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    validateAll,
    validateField,
    reset,
    setFormValues
  };
}

export default useFormValidation;