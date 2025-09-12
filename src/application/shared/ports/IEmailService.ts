import { IEmailFilter } from "@/application/email_verification/usecases/dto";
import {
  EmailVerification,
  IEmailProps,
} from "@/domain/email_verification/email_verification";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";

export abstract class IEmailVerificationService {
  abstract findOne(filter: IEmailFilter): Promise<EmailVerification | null>;
  abstract delete(
    guid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean>;
  abstract create(
    data: IEmailProps,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<EmailVerification>;
}
