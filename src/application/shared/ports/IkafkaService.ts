import { AppEvents } from "@/core/constants";

export abstract class IKafkaService {
  abstract publishEvent<T>(topic: AppEvents, event: T): Promise<void>;
}
