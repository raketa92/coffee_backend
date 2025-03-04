import { z } from "zod";

export const createUserSchema = z.object({
  password: z.string({ message: "password is required" }),
  email: z.string().optional().nullable(),
  phone: z.string({ message: "phone is required" }),
  userName: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
