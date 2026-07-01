import { Global, Module } from '@nestjs/common';
import { LOGGER_PROVIDER, XennicLogger } from './xennic-logger.js';
import { LoggingInterceptor } from './logger.interceptor.js';

@Global()
@Module({
  providers: [
    {
      provide: LOGGER_PROVIDER,
      useClass: XennicLogger,
    },
    XennicLogger,
    LoggingInterceptor,
  ],
  exports: [XennicLogger, LOGGER_PROVIDER],
})
export class LoggerModule {}
