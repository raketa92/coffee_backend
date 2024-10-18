import * as winston from "winston";
import { Injectable } from "@nestjs/common";
import { EnvService } from "@infrastructure/env";
import { Stages } from "@core/constants";

const { combine, timestamp, colorize, printf } = winston.format;

/*
  only use 4 level of logging:
   - silly
   - debug
   - info
   - error
*/

interface IConsoleMethods {
  silly: (message: any, ...rest: any) => void;
  debug: (message: any, ...rest: any) => void;
  info: (message: any, ...rest: any) => void;
  error: (message: any, ...rest: any) => void;
}
@Injectable()
export class LoggerService {
  private logger: winston.Logger | IConsoleMethods;

  constructor(private configService: EnvService) {
    this.logger =
      this.configService.get("NODE_ENV") === Stages.test
        ? this.createConsoleLogger()
        : this.createLogger();
  }

  private createLogger(): winston.Logger {
    const logLevel =
      this.configService.get("NODE_ENV") === Stages.prod ? "error" : "silly";

    const isTestStage = this.configService.get("NODE_ENV") === Stages.test;

    return winston.createLogger({
      level: logLevel,
      transports: [
        new winston.transports.Console({
          silent: isTestStage,
          format: combine(
            colorize(),
            timestamp(),
            printf(
              ({ timestamp, level, message }) =>
                `${timestamp} ${level}: ${
                  typeof message === "object"
                    ? JSON.stringify(message, null, 2)
                    : message
                }`
            )
          ),
        }),
      ],
    });
  }

  private createConsoleLogger(): IConsoleMethods {
    return {
      silly(message: any, ...rest: any) {
        console.log(`SILLY `, message, ...rest);
      },
      debug(message: any, ...rest: any) {
        console.debug(message, ...rest);
      },
      info(message: any, ...rest: any) {
        console.info(message, rest);
      },
      error(message: any, ...rest: any) {
        console.error(message, ...rest);
      },
    };
  }

  silly(message: any, ...rest: any) {
    this.logger.silly(message, ...rest);
  }

  debug(message: any, ...rest: any) {
    this.logger.debug(message, ...rest);
  }

  info(message: any, ...rest: any) {
    this.logger.info(message, ...rest);
  }

  error(message: any, ...rest: any) {
    this.logger.error(message, ...rest);
  }
}
