import { PaymentStatus } from "@/core/constants";
import {
  ICheckPaymentData,
  IPaymentData,
} from "src/infrastructure/payment/bankService/dto/paymentDto";

export interface IPaymentReponse {
  orderId: string;
  formUrl: string;
  [key: string]: any;
}

export interface ICheckPaymentResponse {
  errorCode: string;
  errorMessage: string;
  orderNumber: string;
  orderStatus: number;
  actionCode: number;
  actionCodeDescription: string;
  amount: number;
  currency: string;
  date: number;
  attributes: [
    {
      name: string;
      value: string;
    },
  ];
}

export abstract class IBankService {
  abstract makePayment: (payload: IPaymentData) => Promise<IPaymentReponse>;
  abstract mapStatus: (errorCode: number, orderStatus: number) => PaymentStatus;
  abstract checkPaymentStatus: (
    payload: ICheckPaymentData
  ) => Promise<ICheckPaymentResponse>;
}
