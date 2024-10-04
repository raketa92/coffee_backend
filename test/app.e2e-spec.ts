import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { CreateOrderUseCase } from "src/application/coffee_shop/usecases/createOrder";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let createOrderUseCase: CreateOrderUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [CreateOrderUseCase],
    }).compile();

    app = module.createNestApplication();
    createOrderUseCase = module.get<CreateOrderUseCase>(CreateOrderUseCase);
    await app.init();
  });

  it("should be defined", () => {
    expect(createOrderUseCase).toBeDefined();
  });

  it("/orders (GET)", () => {
    return request(app.getHttpServer())
      .get("/orders")
      .expect(200)
      .expect("Hello World!");
  });
});
