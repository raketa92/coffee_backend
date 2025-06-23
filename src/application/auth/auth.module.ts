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
import { KafkaModule } from "@/infrastructure/kafka/kafka.module";
import { KafkaService } from "@/infrastructure/kafka/kafka.service";
import { IUserService } from "../shared/ports/IUserService";
import { IKafkaService } from "../shared/ports/IkafkaService";

@Module({
  imports: [EnvModule, DatabaseModule, KafkaModule],
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
    {
      provide: IKafkaService,
      useClass: KafkaService,
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
