import { OtpRequestDto } from "@/application/otp/usecases/dto";
import { OTP } from "./otp";
import { DeleteResult, Transaction } from "kysely";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { OtpModel } from "@/infrastructure/persistence/kysely/models/otp";

export interface IOtpRepository {
  getOtpByFilter(filter: OtpRequestDto): Promise<OtpModel | null>;
  save(otp: OTP, transaction?: Transaction<DatabaseSchema>): Promise<void>;
  delete(
    otpGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<DeleteResult>;
}

export const IOtpRepository = Symbol("IOtpRepository");
