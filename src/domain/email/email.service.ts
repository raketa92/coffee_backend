import { Inject, Injectable } from "@nestjs/common";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";
import { IEmailVerificationRepository } from "./email.repository";
import { EmailVerification, IEmailProps } from "./email";
import { EmailVerificationMapper } from "@/infrastructure/dataMappers/emailVerificationMapper";
import { IEmailService } from "@/application/shared/ports/IEmailService";
import { IEmailFilter } from "@/application/email_verification/usecases/dto";
import { addMinutes } from "date-fns";

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    @Inject(IEmailVerificationRepository)
    private readonly emailRepository: IEmailVerificationRepository
  ) {}
  async create(
    data: IEmailProps,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<EmailVerification> {
    const today = new Date();
    const email = EmailVerification.create({
      email: data.email,
      payload: data.payload,
      purpose: data.purpose,
      expiresAt: addMinutes(today, 15),
    });
    await this.emailRepository.save(email, transaction);
    return email;
  }
  async findOne(filter: IEmailFilter): Promise<EmailVerification | null> {
    const emailModel = await this.emailRepository.getEmailByFilter(filter);
    if (!emailModel) {
      return null;
    }
    const email = EmailVerificationMapper.toDomain(emailModel);
    return email;
  }

  async delete(
    guid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean> {
    const result = await this.emailRepository.delete(guid, transaction);
    return !!Number(result.numDeletedRows);
  }
}
