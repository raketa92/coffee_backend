import { z } from "zod";

export const otpResponseSchema = z.object({
  phone: z.string(),
  otp: z.string(),
});

export type OtpResponseDto = z.infer<typeof otpResponseSchema>;

export const otpChangePhoneResponseSchema = z.object({
  phone: z.string(),
  oldPhone: z.string(),
  otp: z.string(),
});

export type OtpChangePhoneResponseDto = z.infer<typeof otpChangePhoneResponseSchema>;

export const otpRequestSchema = z.object({
  phone: z.string(),
});

export type OtpRequestDto = z.infer<typeof otpRequestSchema>;

export interface IOtpFilter {
  otp: string;
  phone: string;
}
