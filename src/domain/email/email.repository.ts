import { DeleteResult, Transaction } from "kysely";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { EmailVerification } from "./email";
import { EmailVerificationModel } from "@/infrastructure/persistence/kysely/models/email";
import { IEmailFilter } from "@/application/email_verification/usecases/dto";

export interface IEmailVerificationRepository {
  getEmailByFilter(
    filter: IEmailFilter
  ): Promise<EmailVerificationModel | null>;
  save(
    email: EmailVerification,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void>;
  delete(
    emailGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<DeleteResult>;
}

export const IEmailVerificationRepository = Symbol(
  "IEmailVerificationRepository"
);
