/* eslint-disable no-console */
import winston from 'winston';
import appConfig from '@config/main';

/*
  only use 4 level of logging:
   - silly
   - debug
   - info
   - error
*/

const winstonLogger = winston.createLogger({
  // const logger = winston.createLogger({
  level:
    appConfig.stage === 'qa' ||
    appConfig.stage === 'dev' ||
    appConfig.stage === 'local'
      ? 'silly'
      : 'error',
  transports: [
    new winston.transports.Console({
      silent: appConfig.stage === 'test',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        // winston.format.align(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} ${level}: ${
              typeof message === 'object'
                ? JSON.stringify(message, null, 2)
                : message
            }`,
        ),
      ),
    }),
  ],
});

const consoleLogger = {
  silly: (msg: any, ...rest: any) => {
    console.log(`SILLY `, msg, ...rest);
  },
  debug: (msg: any, ...rest: any) => {
    console.debug(msg, ...rest);
  },
  info: (msg: any, ...rest: any) => {
    console.info(msg, ...rest);
  },
  error: (msg: any, ...rest: any) => {
    console.error(msg, ...rest);
  },
};

export default appConfig.stage === 'local' || appConfig.stage === 'test'
  ? winstonLogger
  : consoleLogger;
