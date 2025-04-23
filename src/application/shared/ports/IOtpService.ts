import { IOtpFilter } from "@/application/otp/usecases/dto";
import { IOtpProps, OTP } from "@/domain/otp/otp";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";

export abstract class IOtpService {
  abstract findOne(filter: IOtpFilter): Promise<OTP | null>;
  abstract delete(
    otpGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean>;
  abstract create(
    data: IOtpProps,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<OTP>;
}
