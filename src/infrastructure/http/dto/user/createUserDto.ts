import { z } from "zod";

export const createUserSchema = z.object({
  password: z.string(),
  email: z.string().optional(),
  phone: z.string(),
  userName: z.string().optional(),
  gender: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
