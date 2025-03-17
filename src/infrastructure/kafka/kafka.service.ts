import { AppEvents } from "@/core/constants";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { lastValueFrom } from "rxjs";

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject("KAFKA_SERVICE") private readonly kafkaClient: ClientKafka
  ) {}
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
    await lastValueFrom(this.kafkaClient.emit<T>(topic, JSON.stringify(event)));
  }
}
