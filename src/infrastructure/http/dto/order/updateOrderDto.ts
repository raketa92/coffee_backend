import { OrderStatus } from "@/core/constants";
import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;
