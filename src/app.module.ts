import { Module } from "@nestjs/common";
import { DevtoolsModule } from "@nestjs/devtools-integration";

@Module({
  imports: [
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== "production",
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
