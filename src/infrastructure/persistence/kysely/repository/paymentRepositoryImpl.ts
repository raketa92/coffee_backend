import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { DatabaseSchema } from "@infrastructure/persistence/kysely/database.schema";
import { IPaymentRepository } from "@/domain/payment/repository/IPaymentRepository";
import { Payment } from "@domain/payment/payment";
import {
  PaymentCreateModel,
  PaymentModel,
} from "@infrastructure/persistence/kysely/models/payment";

@Injectable()
export class PaymentRepositoryImpl implements IPaymentRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}
  async getPayment(orderGuid: string): Promise<PaymentModel | null> {
    const payment = await this.kysely
      .selectFrom("Payment")
      .selectAll()
      .where("orderGuid", "=", orderGuid)
      .executeTakeFirst();

    return payment ?? null;
  }
  async save(
    data: Payment,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Payment> {
    const paymentModelData: PaymentCreateModel = {
      guid: data.guid.toValue(),
      paymentFor: data.paymentFor,
      cardProvider: data.cardProvider,
      status: data.status,
      orderGuid: data.orderGuid.toValue(),
      bankOrderId: data.bankOrderId,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    };
    if (transaction) {
      await this.insertPayment(transaction, paymentModelData);
    } else {
      await this.kysely.transaction().execute(async (trx) => {
        await this.insertPayment(trx, paymentModelData);
      });
    }

    return data;
  }

  private async insertPayment(
    trx: Transaction<DatabaseSchema>,
    paymentModelData: PaymentCreateModel
  ): Promise<void> {
    await trx
      .insertInto("Payment")
      .values(paymentModelData)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
