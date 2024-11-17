export interface IPaymentData {
  currency: number;
  language?: string;
  description?: string;
  orderNumber: string;
  amount: number;
  returnUrl: string;
}

export interface IPaymentPayload extends IPaymentData {
  userName: string;
  password: string;
}
