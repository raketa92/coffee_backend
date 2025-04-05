import { OtpRequestDto } from "@/application/otp/usecases/dto";
import { OTP } from "@/domain/otp/otp";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";

export abstract class IOtpService {
  abstract findOne(filter: OtpRequestDto): Promise<OTP | null>;
  abstract delete(
    otpGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean>;
}
