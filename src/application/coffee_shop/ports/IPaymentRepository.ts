import { Payment } from "src/domain/payment/payment";

export abstract class PaymentRepository {
  save: (data: Payment) => Promise<Payment>;
}
