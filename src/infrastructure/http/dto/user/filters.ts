import { z } from "zod";

export const userFiltersSchema = z.object({
  guid: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  userName: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type UserFiltersDto = z.infer<typeof userFiltersSchema>;
