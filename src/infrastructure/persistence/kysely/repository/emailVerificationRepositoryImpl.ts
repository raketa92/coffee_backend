import { Inject, Injectable } from "@nestjs/common";
import { Transaction, DeleteResult, Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { IEmailVerificationRepository } from "@/domain/email_verification/email_verification.repository";
import {
  EmailVerificationCreateModel,
  EmailVerificationModel,
  EmailVerificationUpdateModel,
} from "../models/email";
import { IEmailFilter } from "@/application/email_verification/usecases/dto";
import { EmailVerification } from "@/domain/email_verification/email_verification";
import { EmailVerificationMapper } from "@/infrastructure/dataMappers/emailVerificationMapper";

@Injectable()
export class EmailVerificationRepositoryImpl
  implements IEmailVerificationRepository
{
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}

  async getEmailVerificationByFilter(
    filter: IEmailFilter
  ): Promise<EmailVerificationModel | null> {
    const query = this.kysely
      .selectFrom("EmailVerification")
      .selectAll()
      .where("EmailVerification.otp", "=", filter.otp)
      .where("EmailVerification.email", "=", filter.email);

    const emailModel = await query.executeTakeFirst();
    if (!emailModel) {
      return null;
    }

    return emailModel;
  }
  async save(
    email: EmailVerification,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    if (transaction) {
      await this.saveEmail(email, transaction);
    } else {
      await this.saveEmail(email);
    }
  }
  async delete(
    guid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<DeleteResult> {
    const query = transaction || this.kysely;
    return await query
      .deleteFrom("EmailVerification")
      .where("EmailVerification.guid", "=", guid)
      .executeTakeFirst();
  }

  private async saveEmail(
    email: EmailVerification,
    transaction?: Transaction<DatabaseSchema>
  ) {
    const EmailModelData = EmailVerificationMapper.toDbModel(email);
    const query = transaction || this.kysely;
    let updateData: EmailVerificationUpdateModel = {};
    if (email.changedFields.length) {
      updateData = email.changedFields.reduce(
        (acc, field) => {
          acc[field] = email[field as keyof EmailVerification];
          return acc;
        },
        {} as Record<string, any>
      );
    }

    if (email.changedFields.length) {
      await this.updateEmail(query, updateData, email.guid.toValue());
    } else {
      await this.upsertEmail(query, EmailModelData);
    }
    email.clearChangedFields();
  }

  private async updateEmail(
    query: Kysely<DatabaseSchema>,
    updateData: EmailVerificationUpdateModel,
    guid: string
  ) {
    await query
      .updateTable("EmailVerification")
      .set(updateData)
      .where("EmailVerification.guid", "=", guid)
      .execute();
  }

  private async upsertEmail(
    query: Kysely<DatabaseSchema>,
    emailModelData: EmailVerificationCreateModel
  ) {
    await query
      .insertInto("EmailVerification")
      .values(emailModelData)
      .onConflict((conflict) =>
        conflict.column("guid").doUpdateSet(emailModelData)
      )
      .execute();
  }
}
