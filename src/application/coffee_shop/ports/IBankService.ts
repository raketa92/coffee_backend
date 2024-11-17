import { IPaymentData } from "src/infrastructure/payment/bankService/dto/paymentDto";

export interface IPaymentReponse {
  orderId: string;
  formUrl: string;
  [key: string]: any;
}

export abstract class BankService {
  abstract makePayment: (payload: IPaymentData) => Promise<IPaymentReponse>;
}
