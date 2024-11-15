import { PaymentDto } from "src/infrastructure/payment/bankService/dto/paymentDto";

export interface IPaymentReponse {
  data: {
    bankOrderId: string;
    [key: string]: any;
  };
}

export abstract class BankService {
  abstract makePayment: (payload: PaymentDto) => Promise<IPaymentReponse>;
}
