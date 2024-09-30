import { Injectable } from "@nestjs/common";
import {
  BankService as IBankService,
  IPaymentReponse,
} from "src/application/coffee_shop/ports/IBankService";
import { PaymentDto } from "./dto/paymentDto";
import axios from "axios";
import { EnvService } from "../../../infrastructure/env";

@Injectable()
export class BankService implements IBankService {
  constructor(private configService: EnvService) {}
  public async makePayment(payload: PaymentDto): Promise<IPaymentReponse> {
    try {
      const paymentGateway = this.configService.get("HALKBANK_PAYMENT_GATEWAY");
      const paymentPayPath = this.configService.get(
        "HALKBANK_PAYMENT_PAY_PATH"
      );
      const paymentUrl = `${paymentGateway}/${paymentPayPath}`;
      const payment = await axios.get(paymentUrl, {
        params: payload,
      });
      return payment;
    } catch (error) {
      throw error;
    }
  }
}
