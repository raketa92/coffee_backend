import { AppEvents } from "@/core/constants";
import { Either } from "@/core/Either";
import { InfraError } from "../exception/infraError";

export abstract class IKafkaService {
  abstract publishEvent<T>(
    topic: AppEvents,
    event: T
  ): Promise<Either<InfraError, void>>;
}
