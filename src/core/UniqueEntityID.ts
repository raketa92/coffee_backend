import { randomUUID } from 'crypto';
import { Identifier } from './Identitifer';

export class UniqueEntityID extends Identifier<string | number> {
  constructor(id?: string | number) {
    super(id || randomUUID.toString());
  }
}
