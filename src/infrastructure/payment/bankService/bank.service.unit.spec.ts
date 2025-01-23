import { Test, TestingModule } from "@nestjs/testing";
import { BankService } from "./bank.service";
import axios from "axios";
import { EnvService } from "@infrastructure/env";
import { IPaymentData, IPaymentPayload } from "./dto/paymentDto";

jest.mock("axios");

describe("Bank service", () => {
  let service: BankService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankService,
        {
          provide: EnvService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case "RYSGAL_BANK_PAYMENT_GATEWAY":
                  return "https://fake-payment-gateway.com";
                case "RYSGAL_BANK_PAYMENT_PAY_PATH":
                  return "payment";
                case "RYSGAL_BANK_LOGIN":
                  return "testLogin";
                case "RYSGAL_BANK_PASSWORD":
                  return "testPass";
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    service = module.get<BankService>(BankService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should make a successful payment", async () => {
    const paymentDto: IPaymentPayload = {
      currency: 934,
      language: "ru",
      orderNumber: "12345",
      amount: 10000,
      returnUrl: "https://fake-payment-gateway.com",
      userName: "testLogin",
      password: "testPass",
    };

    const mockResponse: any = {
      data: {
        orderId: "bank111",
        formUrl: "testurl",
      },
    };

    (axios.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const result = await service.makePayment(paymentDto);

    expect(result).toEqual(mockResponse.data);
    expect(axios.get).toHaveBeenCalledWith(
      "https://fake-payment-gateway.com/payment",
      { params: paymentDto }
    );
  });

  it("should handle payment errors", async () => {
    const paymentDto: IPaymentData = {
      currency: 934,
      language: "ru",
      orderNumber: "12345",
      amount: 10000,
      returnUrl: "https://test-return-url.com",
    };

    (axios.get as jest.Mock).mockRejectedValueOnce(new Error("Payment failed"));

    await expect(service.makePayment(paymentDto)).rejects.toThrow(
      "Payment failed"
    );
  });
});
