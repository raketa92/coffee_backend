import { UniqueEntityID } from "@/core/UniqueEntityID";
import {
  EmailVerificationCreateModel,
  EmailVerificationModel,
} from "../persistence/kysely/models/email";
import { EmailVerification } from "@/domain/email_verification/email_verification";

export class EmailVerificationMapper {
  static toDomain(model: EmailVerificationModel): EmailVerification {
    return EmailVerification.create(
      {
        otp: model.otp,
        email: model.email,
        purpose: model.purpose,
        expiresAt: model.expiresAt,
      },
      new UniqueEntityID(model.guid)
    );
  }

  static toDbModel(entity: EmailVerification): EmailVerificationCreateModel {
    const dbModel: EmailVerificationCreateModel = {
      guid: entity.guid.toValue(),
      otp: entity.otp,
      email: entity.email,
      purpose: entity.purpose,
      expiresAt: entity.expiresAt,
    };

    return dbModel;
  }
}
