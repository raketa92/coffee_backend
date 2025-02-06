import { z } from "zod";

export const userTokenSchema = z.object({
  refreshToken: z.string(),
});

export type UserTokenDto = z.infer<typeof userTokenSchema>;
