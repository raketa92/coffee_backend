import { OrderStatus } from "@/core/constants";
import { UniqueEntityID } from "@/core/UniqueEntityID";

export abstract class IOrderStatusBroadcaster {
  abstract notifyOrderStatusChanged(payload: {
    orderGuid: UniqueEntityID;
    userGuid: UniqueEntityID | null;
    status: OrderStatus;
  }): void;
}
