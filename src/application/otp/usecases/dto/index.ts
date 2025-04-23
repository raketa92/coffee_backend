import { z } from "zod";

export const otpRequestSchema = z.object({
  userGuid: z.string().uuid(),
  otp: z.string(),
});

export type OtpRequestDto = z.infer<typeof otpRequestSchema>;

export interface IOtpFilter {
  otp: string;
  phone: string;
}
