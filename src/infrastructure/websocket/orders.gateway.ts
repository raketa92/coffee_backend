import { CheckOrderUseCase } from "@/application/coffee_shop/usecases/order/checkOrderStatus";
import { IOrderStatusBroadcaster } from "@/application/shared/ports/IOrderStatusBroadcaster";
import { OrderStatus } from "@/core/constants";
import { UniqueEntityID } from "@/core/UniqueEntityID";
import { Injectable, UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtWsGuard } from "../auth/guards/jwt-ws.guard";

@Injectable()
@WebSocketGateway({
  namespace: "orders",
  cors: {
    origin: "*",
  },
})
@UseGuards(JwtWsGuard)
export class OrdersGateway implements IOrderStatusBroadcaster {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly checkOrderUseCase: CheckOrderUseCase) {
    console.log(`✅ ~ OrdersGateway ctor:`);
  }

  @SubscribeMessage("order_status_live_subscribe")
  async handleSubscribe(
    @MessageBody() body: { orderGuid: UniqueEntityID },
    @ConnectedSocket() client: Socket & { user?: { id: string } }
  ) {
    console.log(`✅ ~ body:`, body);
    console.log(`✅ ~ handleSubscribe:`);
    const userId = client.user?.id;

    if (!userId) {
      client.emit("order_status_live_error", { reason: "UNAUTHORIZED from handleSubscribe" });
      return;
    }

    const result = await this.checkOrderUseCase.execute(
      body.orderGuid.toString()
    );

    const room = this.getOrderRoom(body.orderGuid.toString());
    client.join(room);
    client.emit("order_status_initial", {
      orderGuid: body.orderGuid.toString(),
      status: result.status,
    });

    // result.fold(
    //   (err) => {
    //     client.emit("order_status_live_error", {
    //       reason: err.message,
    //     });
    //   },
    //   (data) => {
    //     const room = this.getOrderRoom(body.orderGuid.toString());
    //     client.join(room);
    //     client.emit("order_status_initial", {
    //       orderGuid: body.orderGuid.toString(),
    //       status: data.status,
    //     });
    //   }
    // );
  }

  notifyOrderStatusChanged(payload: {
    orderGuid: UniqueEntityID;
    userGuid: UniqueEntityID | null;
    status: OrderStatus;
  }): void {
    const room = this.getOrderRoom(payload.orderGuid.toString());
    console.log(`✅ ~ room:`, room);
    this.server.to(room).emit("order_status_changed", {
      orderGuid: payload.orderGuid,
      status: payload.status,
    });
  }

  private getOrderRoom(orderGuid: string): string {
    return `order-${orderGuid}`;
  }
}
