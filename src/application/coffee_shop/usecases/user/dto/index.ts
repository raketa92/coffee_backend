import { z } from "zod";

export const updateProfileSchema = z.object({
  userGuid: z.string().uuid(),
  userName: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  gender: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
