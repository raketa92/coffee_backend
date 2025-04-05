import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EnvModule, EnvService } from "../env";
import { KafkaConsumer } from "./kafka.consumer";
import { KafkaService } from "./kafka.service";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";

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
  ],
  providers: [
    {
      provide: IKafkaService,
      useClass: KafkaService,
    },
  ],
  controllers: [KafkaConsumer],
  exports: [ClientsModule, IKafkaService],
})
export class KafkaModule {}
