import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido").min(1, "El correo electrónico es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder los 100 caracteres"),
  apellido_paterno: z.string().min(3, "El apellido paterno debe tener al menos 3 caracteres").max(100, "El apellido paterno no puede exceder los 100 caracteres"),
  apellido_materno: z.string().min(3, "El apellido materno debe tener al menos 3 caracteres").max(100, "El apellido materno no puede exceder los 100 caracteres"),
  email: z.string().email("Correo electrónico inválido").min(1, "El correo electrónico es requerido").max(150, "El correo electrónico no puede exceder los 150 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").max(200, "La contraseña no puede exceder los 200 caracteres"),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
