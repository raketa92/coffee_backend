import { randomUUID } from "crypto";
import { Identifier } from "@core/Identitifer";

export class UniqueEntityID extends Identifier<string> {
  constructor(id?: string) {
    super(id || randomUUID());
  }
}
