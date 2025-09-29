import { z } from 'zod';

// Esquema para la validación de inicio de sesión
export const loginSchema = z.object({
  email: z.string().email({
    message: "El correo electrónico no es válido."
  }).min(1, {
    message: "El correo electrónico es obligatorio."
  }),
  password: z.string().min(1, {
    message: "La contraseña es obligatoria."
  }),
});

// Esquema para la validación de registro de usuario
export const registerSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres."
  }).max(100, {
    message: "El nombre no puede exceder los 100 caracteres."
  }),
  apellido_paterno: z.string().min(3, {
    message: "El apellido paterno debe tener al menos 3 caracteres."
  }).max(100, {
    message: "El apellido paterno no puede exceder los 100 caracteres."
  }),
  apellido_materno: z.string().min(3, {
    message: "El apellido materno debe tener al menos 3 caracteres."
  }).max(100, {
    message: "El apellido materno no puede exceder los 100 caracteres."
  }),
  email: z.string().email({
    message: "El correo electrónico no es válido."
  }).min(1, {
    message: "El correo electrónico es obligatorio."
  }).max(150, {
    message: "El correo electrónico no puede exceder los 150 caracteres."
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres."
  }).max(200, {
    message: "La contraseña no puede exceder los 200 caracteres."
  }),
  // role es opcional y con un valor por defecto en el backend, no se valida aquí directamente
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
