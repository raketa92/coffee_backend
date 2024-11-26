import { PaymentModel } from "@/infrastructure/persistence/kysely/models/payment";
import { Transaction } from "kysely";
import { Payment } from "src/domain/payment/payment";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";

export interface IPaymentRepository {
  save: (
    data: Payment,
    transaction?: Transaction<DatabaseSchema>
  ) => Promise<Payment>;

  getPayment(orderGuid: string): Promise<PaymentModel | null>;
}

export const IPaymentRepository = Symbol("IPaymentRepository");
