import { z } from "zod";

export const loginUserSchema = z.object({
  password: z.string(),
  phone: z.string(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
