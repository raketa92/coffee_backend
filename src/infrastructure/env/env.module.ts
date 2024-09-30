import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { evnSchema } from "./env";
import { EnvService } from "./env.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV === "test" ? ".env.example" : ".env",
      validate: (env) => evnSchema.parse(env),
      isGlobal: false,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
