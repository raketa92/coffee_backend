import { z } from "zod";

export const otpResponseSchema = z.object({
  phone: z.string(),
  otp: z.string(),
});

export type OtpResponseDto = z.infer<typeof otpResponseSchema>;

export const otpRequestSchema = z.object({
  phone: z.string(),
});

export type OtpRequestDto = z.infer<typeof otpRequestSchema>;

export interface IOtpFilter {
  otp: string;
  phone: string;
}
