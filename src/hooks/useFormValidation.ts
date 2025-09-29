import { useState, useCallback, useEffect } from 'react';
import { ZodType, ZodTypeDef, ZodFormattedError, z } from 'zod';
import { useToast } from '../context/ToastContext';

interface UseFormValidationResult<T extends ZodType<any, ZodTypeDef, any>> {
  formData: z.infer<T>;
  errors: { [key: string]: string };
  handleChange: (name: string, value: any, options?: { shouldClearError?: boolean }) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  isLoading: boolean;
}

const formatZodErrors = (error: z.ZodError<any>): { [key: string]: string } => {
  const formattedErrors: { [key: string]: string } = {};
  error.errors.forEach((err) => {
    if (err.path.length > 0) {
      formattedErrors[err.path[0]] = err.message;
    } else if (err.message) {
      formattedErrors['general'] = err.message;
    }
  });
  return formattedErrors;
};

export const useFormValidation = <T extends ZodType<any, ZodTypeDef, any>>(
  schema: T,
  onSubmit: (data: z.infer<T>) => Promise<void>,
  initialValues?: z.infer<T> // Hacer este parámetro opcional
): UseFormValidationResult<T> => {
  const [formData, setFormData] = useState<z.infer<T>>(initialValues || {} as z.infer<T>);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    setFormData(initialValues || {} as z.infer<T>);
    setErrors({});
  }, [initialValues]);

  const handleChange = useCallback((name: string, value: any, options?: { shouldClearError?: boolean }) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (options?.shouldClearError !== false && errors[name]) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const validatedData = schema.parse(formData);
      await onSubmit(validatedData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors = formatZodErrors(error);
        setErrors(newErrors);
        showToast('error', 'Error de validación', 'Por favor, corrige los campos marcados.');
      } else {
        // Otros errores (ej. de la API), manejados por el onSubmit o AuthContext
        // showToast('error', 'Error', error.message || 'Ha ocurrido un error inesperado.');
        console.error('Error en useFormValidation handleSubmit:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, schema, onSubmit, showToast]);

  const resetForm = useCallback(() => {
    setFormData(initialValues || {} as z.infer<T>);
    setErrors({});
    setIsLoading(false);
  }, [initialValues]);

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
    isLoading,
  };
};
