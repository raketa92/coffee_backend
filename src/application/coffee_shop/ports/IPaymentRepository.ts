import { Transaction } from "kysely";
import { Payment } from "src/domain/payment/payment";
import { DatabaseSchema } from "src/infrastructure/persistence/kysely/database.schema";

export abstract class PaymentRepository {
  save: (
    data: Payment,
    transaction?: Transaction<DatabaseSchema>
  ) => Promise<Payment>;
}
