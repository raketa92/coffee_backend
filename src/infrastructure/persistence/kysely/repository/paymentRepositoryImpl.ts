import { Inject, Injectable } from "@nestjs/common";
import { Kysely, Transaction } from "kysely";
import { DatabaseSchema } from "@infrastructure/persistence/kysely/database.schema";
import { IPaymentRepository } from "@/domain/payment/repository/IPaymentRepository";
import { Payment } from "@domain/payment/payment";
import {
  PaymentCreateModel,
  PaymentModel,
  PaymentUpdateModel,
} from "@infrastructure/persistence/kysely/models/payment";
import { PaymentMapper } from "../mappers/paymentMapper";

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
    payment: Payment,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<Payment> {
    const paymentModelData = PaymentMapper.toDbModel(payment);
    const query = transaction || this.kysely;
    let updateData: PaymentUpdateModel = {};
    if (payment.changedFields.length) {
      updateData = payment.changedFields.reduce(
        (acc, field) => {
          acc[field] = payment[field as keyof Payment];
          return acc;
        },
        {} as Record<string, any>
      );
    }
    if (payment.changedFields.length) {
      await this.updatePayment(query, updateData, payment.guid.toValue());
    } else {
      await this.upsertPayment(query, paymentModelData);
    }

    payment.clearChangedFields();
    return payment;
  }

  private async updatePayment(
    trx: Kysely<DatabaseSchema>,
    updateData: PaymentUpdateModel,
    paymentGuid: string
  ) {
    await trx
      .updateTable("Payment")
      .set(updateData)
      .where("guid", "=", paymentGuid)
      .execute();
  }
  private async upsertPayment(
    trx: Kysely<DatabaseSchema>,
    paymentModelData: PaymentCreateModel
  ): Promise<void> {
    await trx
      .insertInto("Payment")
      .values(paymentModelData)
      .onConflict((conflict) =>
        conflict.column("guid").doUpdateSet(paymentModelData)
      )
      .execute();
  }
}
