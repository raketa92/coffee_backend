import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { EnvModule, EnvService } from "../env";
import { KafkaConsumer } from "./kafka.consumer";
import { KafkaService } from "./kafka.service";

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
  providers: [KafkaService],
  controllers: [KafkaConsumer],
  exports: [ClientsModule, KafkaService],
})
export class KafkaModule {}
