import { z } from "zod";

export interface IEmailFilter {
  email: string;
  otp: string;
}

export const otpChangeEmailResponseSchema = z.object({
  email: z.string().email(),
  userGuid: z.string().uuid(),
  otp: z.string(),
});

export type OtpChangeEmailResponseDto = z.infer<
  typeof otpChangeEmailResponseSchema
>;
