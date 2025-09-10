import { UniqueEntityID } from "@/core/UniqueEntityID";
import {
  EmailVerificationCreateModel,
  EmailVerificationModel,
} from "../persistence/kysely/models/email";
import { EmailVerification } from "@/domain/email/email";

export class EmailVerificationMapper {
  static toDomain(model: EmailVerificationModel): EmailVerification {
    return EmailVerification.create(
      {
        email: model.email,
        payload: model.payload,
        purpose: model.purpose,
        expiresAt: model.expiresAt,
      },
      new UniqueEntityID(model.guid)
    );
  }

  static toDbModel(otp: EmailVerification): EmailVerificationCreateModel {
    const dbModel: EmailVerificationCreateModel = {
      guid: otp.guid.toValue(),
      email: otp.email,
      payload: otp.payload,
      purpose: otp.purpose,
      expiresAt: otp.expiresAt,
    };

    return dbModel;
  }
}
