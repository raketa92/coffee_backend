import { BankResponseTable } from "./models/bankResponse";
import { CategoryTable } from "./models/category";
import { OrderTable } from "./models/order";
import { OrderItemTable } from "./models/orderItem";
import { PaymentTable } from "./models/payment";
import { ProductTable } from "./models/product";

export interface DatabaseSchema {
  Order: OrderTable;
  OrderItem: OrderItemTable;
  Product: ProductTable;
  Payment: PaymentTable;
  BankResponse: BankResponseTable;
  Category: CategoryTable;
}
