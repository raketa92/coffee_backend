import { z } from "zod";

export const updateProfileSchema = z.object({
  userGuid: z.string().uuid(),
  userName: z.string().optional().nullable(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  gender: z.string().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;

export const changePhoneSchema = z.object({
  userGuid: z.string().uuid(),
  phone: z.string(),
});

export type ChangePhoneDto = z.infer<typeof changePhoneSchema>;

export const changePasswordSchema = z.object({
  userGuid: z.string().uuid(),
  password: z.string(),
  oldPassword: z.string(),
});

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;