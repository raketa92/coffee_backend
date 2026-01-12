import { InfraError } from "@/application/shared/exception/infraError";
import { IKafkaService } from "@/application/shared/ports/IkafkaService";
import { AppEvents } from "@/core/constants";
import { left, right } from "@/core/Either";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class KafkaService implements OnModuleInit, IKafkaService {
  constructor(
    @Inject("KAFKA_PRODUCER") private readonly kafkaClient: ClientKafka
  ) {
    console.log("KafkaService ctor");
  }
  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      console.log("✅ Kafka client connected successfully");
    } catch (error) {
      console.error("❌ Kafka client connection error:", error);
      throw error;
    }
  }

  async publishEvent<T>(topic: AppEvents, event: T) {
    try {
      await lastValueFrom(
        this.kafkaClient.emit<T>(topic, JSON.stringify(event))
      );
      return right(undefined);
    } catch (error: any) {
      return left(new InfraError(error.message));
    }
  }
}
