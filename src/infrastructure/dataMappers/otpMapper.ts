import { UniqueEntityID } from "@/core/UniqueEntityID";
import { OtpCreateModel, OtpModel } from "../persistence/kysely/models/otp";
import { OTP } from "@/domain/otp/otp";

export class OtpMapper {
  static toDomain(model: OtpModel): OTP {
    return OTP.create(
      {
        otp: model.otp,
        phone: model.phone,
        payload: model.payload,
        purpose: model.purpose,
        expiresAt: model.expiresAt,
      },
      new UniqueEntityID(model.guid)
    );
  }

  static toDbModel(otp: OTP): OtpCreateModel {
    const dbModel: OtpCreateModel = {
      guid: otp.guid.toValue(),
      otp: otp.otp,
      phone: otp.phone,
      payload: otp.payload,
      purpose: otp.purpose,
      expiresAt: otp.expiresAt,
    };

    return dbModel;
  }
}
