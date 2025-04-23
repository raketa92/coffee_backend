import { IOtpFilter } from "@/application/otp/usecases/dto";
import { OTP } from "@/domain/otp/otp";
import { IOtpRepository } from "@/domain/otp/otp.repository";
import { Inject, Injectable } from "@nestjs/common";
import { Transaction, DeleteResult, Kysely } from "kysely";
import { DatabaseSchema } from "../database.schema";
import { OtpCreateModel, OtpModel, OtpUpdateModel } from "../models/otp";
import { OtpMapper } from "@/infrastructure/dataMappers/otpMapper";

@Injectable()
export class OtpRepositoryImpl implements IOtpRepository {
  constructor(
    @Inject("DB_CONNECTION")
    private readonly kysely: Kysely<DatabaseSchema>
  ) {}

  async getOtpByFilter(filter: IOtpFilter): Promise<OtpModel | null> {
    const query = this.kysely
      .selectFrom("Otp")
      .selectAll()
      .where("Otp.otp", "=", filter.otp)
      .where("Otp.phone", "=", filter.phone);

    const otpModel = await query.executeTakeFirst();
    if (!otpModel) {
      return null;
    }

    return otpModel;
  }
  async save(
    otp: OTP,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<void> {
    if (transaction) {
      await this.saveOtp(otp, transaction);
    } else {
      await this.saveOtp(otp);
    }
  }
  async delete(
    otpGuid: string,
    transaction?: Transaction<DatabaseSchema>
  ): Promise<DeleteResult> {
    const query = transaction || this.kysely;
    return await query
      .deleteFrom("Otp")
      .where("Otp.guid", "=", otpGuid)
      .executeTakeFirst();
  }

  private async saveOtp(otp: OTP, transaction?: Transaction<DatabaseSchema>) {
    const otpModelData = OtpMapper.toDbModel(otp);
    const query = transaction || this.kysely;
    let updateData: OtpUpdateModel = {};
    if (otp.changedFields.length) {
      updateData = otp.changedFields.reduce(
        (acc, field) => {
          acc[field] = otp[field as keyof OTP];
          return acc;
        },
        {} as Record<string, any>
      );
    }

    if (otp.changedFields.length) {
      await this.updateOtp(query, updateData, otp.guid.toValue());
    } else {
      await this.upsertOtp(query, otpModelData);
    }
    otp.clearChangedFields();
  }

  private async updateOtp(
    query: Kysely<DatabaseSchema>,
    updateData: OtpUpdateModel,
    otpGuid: string
  ) {
    await query
      .updateTable("Otp")
      .set(updateData)
      .where("Otp.guid", "=", otpGuid)
      .execute();
  }

  private async upsertOtp(
    query: Kysely<DatabaseSchema>,
    otpModelData: OtpCreateModel
  ) {
    await query
      .insertInto("Otp")
      .values(otpModelData)
      .onConflict((conflict) =>
        conflict.column("guid").doUpdateSet(otpModelData)
      )
      .execute();
  }
}
