import { z } from "zod";

export const evnSchema = z.object({
  NODE_ENV: z.coerce.string(),
  HOST_API: z.coerce.string().optional().default("localhost"),
  PORT: z.coerce.number().optional().default(3000),
  REDIS_HOST: z.coerce.string().optional().default("localhost"),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_PASSWORD: z.coerce.string().optional(),
  CACHE_TTL: z.coerce.number().default(300),
  CACHE_ENABLED: z.coerce
    .string()
    .transform((value) => value.toLowerCase() === "true"),
  POSTGRES_HOST: z.coerce.string().optional().default("localhost"),
  POSTGRES_USER: z.coerce.string(),
  POSTGRES_PASSWORD: z.coerce.string(),
  POSTGRES_DB: z.coerce.string(),
  POSTGRES_PORT: z.coerce.number().optional().default(5632),
  HALK_BANK_PAYMENT_GATEWAY: z.coerce.string(),
  HALK_BANK_PAYMENT_PAY_PATH: z.coerce.string(),
  HALK_BANK_PAYMENT_CHECK_PATH: z.coerce.string(),
  HALK_BANK_LOGIN: z.coerce.string(),
  HALK_BANK_PASSWORD: z.coerce.string(),
  RYSGAL_BANK_PAYMENT_GATEWAY: z.coerce.string(),
  RYSGAL_BANK_PAYMENT_PAY_PATH: z.coerce.string(),
  RYSGAL_BANK_PAYMENT_CHECK_PATH: z.coerce.string(),
  RYSGAL_BANK_LOGIN: z.coerce.string(),
  RYSGAL_BANK_PASSWORD: z.coerce.string(),
});

export type Env = z.infer<typeof evnSchema>;
