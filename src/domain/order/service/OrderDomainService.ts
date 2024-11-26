import { OrderStatus, PaymentStatus } from "@/core/constants";
import { Payment } from "@/domain/payment/payment";
import { Injectable } from "@nestjs/common";
import { Order } from "../order";

@Injectable()
export class OrderDomainService {
  static processPaymentStatus(
    payment: Payment,
    order: Order,
    newPaymentStatus: PaymentStatus
  ): void {
    payment.changeStatus(newPaymentStatus);
    order.assignPayment(payment.guid);

    let orderStatus = order.status;
    if (newPaymentStatus === PaymentStatus.paid) {
      orderStatus = OrderStatus.inProgress;
    } else if (newPaymentStatus === PaymentStatus.canceled) {
      orderStatus = OrderStatus.canceled;
    } else if (newPaymentStatus === PaymentStatus.rejected) {
      orderStatus = OrderStatus.rejected;
    }
    order.changeStatus(orderStatus);
  }
}
