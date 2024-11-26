import { Injectable } from "@nestjs/common";
import {
  BankService as IBankService,
  ICheckPaymentResponse,
  IPaymentReponse,
} from "src/application/coffee_shop/ports/IBankService";
import {
  IPaymentPayload,
  IPaymentData,
  ICheckPaymentData,
  ICheckPaymentPayload,
} from "./dto/paymentDto";
import axios from "axios";
import { EnvService } from "@infrastructure/env";
import { PaymentStatus } from "@/core/constants";

@Injectable()
export class BankService implements IBankService {
  constructor(private configService: EnvService) {}
  public async checkPaymentStatus(
    payload: ICheckPaymentData
  ): Promise<ICheckPaymentResponse> {
    try {
      const paymentGateway = this.configService.get(
        "RYSGAL_BANK_PAYMENT_GATEWAY"
      );
      const paymentPayPath = this.configService.get(
        "RYSGAL_BANK_PAYMENT_CHECK_PATH"
      );
      const USERNAME = this.configService.get("RYSGAL_BANK_LOGIN");
      const PASSWORD = this.configService.get("RYSGAL_BANK_PASSWORD");
      const checkPaymentData: ICheckPaymentPayload = {
        ...payload,
        language: payload.language || "ru",
        userName: USERNAME,
        password: PASSWORD,
      };
      const checkPaymentUrl = `${paymentGateway}/${paymentPayPath}`;

      const payment = await axios.get<ICheckPaymentResponse>(checkPaymentUrl, {
        params: checkPaymentData,
      });
      return payment.data;
    } catch (error) {
      throw error;
    }
  }

  public async makePayment(payload: IPaymentData): Promise<IPaymentReponse> {
    try {
      const paymentGateway = this.configService.get(
        "RYSGAL_BANK_PAYMENT_GATEWAY"
      );
      const paymentPayPath = this.configService.get(
        "RYSGAL_BANK_PAYMENT_PAY_PATH"
      );
      const USERNAME = this.configService.get("RYSGAL_BANK_LOGIN");
      const PASSWORD = this.configService.get("RYSGAL_BANK_PASSWORD");
      const paymentData: IPaymentPayload = {
        ...payload,
        language: payload.language || "ru",
        userName: USERNAME,
        password: PASSWORD,
      };
      const paymentUrl = `${paymentGateway}/${paymentPayPath}`;
      // const paymentResponse: IPaymentReponse = {
      //   data: {
      //     bankOrderId: "someId",
      //     formUrl: "testUrl",
      //   },
      // };
      // return paymentResponse;
      const payment = await axios.get<IPaymentReponse>(paymentUrl, {
        params: paymentData,
      });
      return payment.data;
    } catch (error) {
      throw error;
    }
  }

  public mapStatus = (
    errorCode: number,
    orderStatus: number
  ): PaymentStatus => {
    if (errorCode === 0 && orderStatus !== null) {
      return PaymentStatus.paid;
    } else if (errorCode === 2 && orderStatus !== null) {
      return PaymentStatus.rejected;
    } else {
      return PaymentStatus.waitingClientApproval;
    }
  };
}
