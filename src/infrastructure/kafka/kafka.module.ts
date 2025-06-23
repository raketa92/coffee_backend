import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EnvModule, EnvService } from "../env";
import { KafkaConsumer } from "./kafka.consumer";
import { KafkaService } from "./kafka.service";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { IOtpService } from "@/application/shared/ports/IOtpService";
import { OtpService } from "@/domain/otp/otp.service";
import { DatabaseModule } from "../persistence/kysely/database.module";
import { RedisService } from "../persistence/redis/redis.service";
import { OtpEventHandler } from "@/domain/otp/events/otp.eventHandler";

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [EnvModule],
        name: "KAFKA_SERVICE",
        useFactory: async (configService: EnvService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: "kafka",
              brokers: [configService.get("KAFKA_BROKER")],
            },
            producerOnlyMode: true,
            producer: {
              allowAutoTopicCreation: true,
            },
          },
        }),
        inject: [EnvService],
      },
    ]),
    DatabaseModule,
  ],
  providers: [
    RedisService,
    {
      provide: IKafkaService,
      useClass: KafkaService,
    },
    {
      provide: IOtpService,
      useClass: OtpService,
    },
    OtpEventHandler,
  ],
  controllers: [KafkaConsumer],
  exports: [ClientsModule, IKafkaService],
})
export class KafkaModule {}
