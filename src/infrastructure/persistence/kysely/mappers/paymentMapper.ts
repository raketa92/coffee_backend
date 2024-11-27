import { UniqueEntityID } from "@/core/UniqueEntityID";
import { PaymentCreateModel, PaymentModel } from "../models/payment";
import { Payment } from "@/domain/payment/payment";
import { PaymentStatus } from "@/core/constants";

export class PaymentMapper {
  static toDomain(paymentModel: PaymentModel): Payment {
    return new Payment(
      {
        paymentFor: paymentModel.paymentFor,
        cardProvider: paymentModel.cardProvider,
        status: paymentModel.status as PaymentStatus,
        orderGuid: new UniqueEntityID(paymentModel.orderGuid),
        bankOrderId: paymentModel.bankOrderId,
        amount: paymentModel.amount,
        currency: paymentModel.currency,
        description: paymentModel.description,
      },
      new UniqueEntityID(paymentModel.guid)
    );
  }

  static toDbModel(payment: Payment): PaymentCreateModel {
    const paymentModelData: PaymentCreateModel = {
      guid: payment.guid.toValue(),
      paymentFor: payment.paymentFor,
      cardProvider: payment.cardProvider,
      status: payment.status,
      orderGuid: payment.orderGuid.toValue(),
      bankOrderId: payment.bankOrderId,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
    };
    return paymentModelData;
  }
}
