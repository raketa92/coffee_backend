import { Injectable } from "@nestjs/common";
import {
  BankService as IBankService,
  IPaymentReponse,
} from "src/application/coffee_shop/ports/IBankService";
import { IPaymentPayload, IPaymentData } from "./dto/paymentDto";
import axios from "axios";
import { EnvService } from "@infrastructure/env";

@Injectable()
export class BankService implements IBankService {
  constructor(private configService: EnvService) {}
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
}
