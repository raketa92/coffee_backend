import { Inject, Injectable } from "@nestjs/common";
import { Kysely } from "kysely";
import { DatabaseScema } from "../database.schema";
import { PaymentRepository } from "src/application/coffee_shop/ports/IPaymentRepository";
import { Payment } from "src/domain/payment/payment";
import { PaymentCreateModel } from "../models/payment";

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseScema>
  ) {}
  async save(data: Payment): Promise<Payment> {
    const paymentModelData: PaymentCreateModel = {
      guid: data.guid,
      paymentFor: data.paymentFor,
      cardProvider: data.cardProvider,
      status: data.status,
      orderNumber: data.orderNumber,
      bankOrderId: data.bankOrderId,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
    };
    await this.kysely
      .insertInto("payment")
      .values(paymentModelData)
      .returningAll()
      .executeTakeFirstOrThrow();

    return data;
  }
}
