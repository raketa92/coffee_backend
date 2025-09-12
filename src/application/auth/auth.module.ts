import { Module } from "@nestjs/common";
import { EnvModule } from "@infrastructure/env";
import { DatabaseModule } from "@infrastructure/persistence/kysely/database.module";
import { LoginUserUseCase } from "../auth/usecases/loginUser";
import { RegisterUserUseCase } from "../auth/usecases/registerUser";
import { JwtService } from "@nestjs/jwt";
import { AuthServiceImpl } from "@/infrastructure/auth/auth.service";
import { UserService } from "@/domain/user/user.service";
import { LogoutUserUseCase } from "../auth/usecases/logoutUser";
import { RefreshTokenUseCase } from "../auth/usecases/refreshToken";
import { IAuthService } from "../shared/ports/IAuthService";
import { DeleteUserUseCase } from "./usecases/deleteUser";
import { IUserService } from "../shared/ports/IUserService";
import { KafkaProducerModule } from "@/infrastructure/kafka/kafka_producer.module";

@Module({
  imports: [EnvModule, DatabaseModule, KafkaProducerModule],
  providers: [
    JwtService,
    LoginUserUseCase,
    RegisterUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    DeleteUserUseCase,
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IAuthService,
      useClass: AuthServiceImpl,
    },
  ],
  exports: [
    LoginUserUseCase,
    RegisterUserUseCase,
    LogoutUserUseCase,
    RefreshTokenUseCase,
    DeleteUserUseCase,
  ],
})
export class AuthModule {}
