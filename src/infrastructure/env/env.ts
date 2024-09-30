import { z } from "zod";

export const evnSchema = z.object({
  NODE_ENV: z.coerce.string(),
  HOST_API: z.coerce.string().optional().default("localhost"),
  PORT: z.coerce.number().optional().default(3000),
  REDIS_HOST: z.coerce.string().optional().default("localhost"),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.coerce.string().optional(),
  POSTGRES_USER: z.coerce.string(),
  POSTGRES_PASSWORD: z.coerce.string(),
  POSTGRES_DB: z.coerce.string(),
  POSTGRES_PORT: z.coerce.number().optional().default(5632),
  HALKBANK_PAYMENT_GATEWAY: z.coerce.string(),
  HALKBANK_PAYMENT_PAY_PATH: z.coerce.string(),
  HALKBANK_PAYMENT_CHECK_PATH: z.coerce.string(),
  HALK_BANK_LOGIN: z.coerce.string(),
  HALK_BANK_PASSWORD: z.coerce.string(),
});

export type Env = z.infer<typeof evnSchema>;
