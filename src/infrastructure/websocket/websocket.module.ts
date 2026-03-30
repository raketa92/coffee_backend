import { Module, forwardRef } from "@nestjs/common";
import { EnvModule } from "../env";
import { CoffeeShopModule } from "@/application/coffee_shop/coffeeShop.module";
import { OrdersGateway } from "./orders.gateway";
import { JwtService } from "@nestjs/jwt";
import { JwtWsGuard } from "../auth/guards/jwt-ws.guard";

@Module({
  imports: [EnvModule, forwardRef(() => CoffeeShopModule)],
  providers: [
    OrdersGateway,
    JwtWsGuard,
    JwtService,
    {
      provide: "IOrderStatusBroadcaster",
      useExisting: OrdersGateway,
    },
  ],
  exports: ["IOrderStatusBroadcaster"],
})
export class WebsocketModule {}
