import { OtpRequestDto } from "@/application/otp/usecases/dto";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { Inject, Injectable } from "@nestjs/common";
import { OTP } from "./otp";
import { IOtpRepository } from "./otp.repository";
import { OtpMapper } from "@/infrastructure/dataMappers/otpMapper";
import { DatabaseSchema } from "@/infrastructure/persistence/kysely/database.schema";
import { Transaction } from "kysely";

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    @Inject(IOtpRepository)
    private readonly otpRepository: IOtpRepository
  ) {}
  async findOne(filter: OtpRequestDto): Promise<OTP | null> {
    const otpModel = await this.otpRepository.getOtpByFilter(filter);
    if (!otpModel) {
      return null;
    }
    const otp = OtpMapper.toDomain(otpModel);
    return otp;
  }

  async delete(
    otpGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<boolean> {
    const result = await this.otpRepository.delete(otpGuid, transaction);
    return !!Number(result.numDeletedRows);
  }
}
