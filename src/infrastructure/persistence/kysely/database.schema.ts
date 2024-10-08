import { BankResponseTable } from "./models/bankResponse";
import { OrderTable } from "./models/order";
import { OrderItemTable } from "./models/orderItem";
import { PaymentTable } from "./models/payment";
import { ProductTable } from "./models/product";

export interface DatabaseScema {
  order: OrderTable;
  orderItems: OrderItemTable;
  product: ProductTable;
  payment: PaymentTable;
  bankResponse: BankResponseTable;
}
