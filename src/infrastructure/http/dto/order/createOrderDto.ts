import { z } from "zod";
import { IsNumber, IsString } from "class-validator";
import { CardProvider, PaymentMethods } from "@core/constants";

export class OrderItem {
  @IsNumber()
  readonly quantity!: number;
  @IsString()
  readonly productGuid!: string;
}

const deliveryTimeSchema = z.string().superRefine((val, ctx) => {
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

  if (!timePattern.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "deliveryTime must be in format HH:MM-HH:MM",
    });
    return;
  }

  const [startStr, endStr] = val.split("-");
  const start = parseTimeToToday(startStr);
  const end = parseTimeToToday(endStr);

  if (start >= end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start time must be earlier than end time",
    });
    return;
  }

  const now = new Date();
  if (now > end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Current time is not within deliveryTime range",
    });
  }
});

function parseTimeToToday(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

export const createOrderSchema = z.object({
  userGuid: z.string().uuid().optional().nullable(),
  shopGuid: z.string().uuid(),
  phone: z.string(),
  address: z.string(),
  paymentMethod: z.nativeEnum(PaymentMethods),
  card: z
    .object({
      cardNumber: z.string(),
      month: z.number().int().min(1).max(12),
      year: z.number().int(),
      name: z.string(),
      cvv: z.number().int(),
      cardProvider: z.nativeEnum(CardProvider),
    })
    .optional()
    .nullable(),
  totalPrice: z.number(),
  orderItems: z.array(
    z.object({
      quantity: z.number().int(),
      productGuid: z.string().uuid(),
    })
  ),
  deliveryTime: deliveryTimeSchema,
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
