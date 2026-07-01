import { LoggerService } from '@nestjs/common';
import pino from 'pino';

export interface LoggerContext {
  correlationId?: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  workspaceId?: string;
}

export const LOGGER_PROVIDER = 'LOGGER_PROVIDER';

export class XennicLogger implements LoggerService {
  private readonly logger: pino.Logger;

  constructor(context?: string) {
    const isDev = process.env.NODE_ENV !== 'production';
    this.logger = pino({
      level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
      ...(isDev && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss.l' },
        },
      }),
      formatters: {
        level(label) {
          return { level: label };
        },
      },
      mixin: () => (context ? { context } : {}),
    });
  }

  log(message: string, ctx?: LoggerContext): void {
    this.info(message, ctx);
  }

  info(message: string, ctx?: LoggerContext): void {
    this.logger.info(ctx ?? {}, message);
  }

  warn(message: string, ctx?: LoggerContext): void {
    this.logger.warn(ctx ?? {}, message);
  }

  error(message: string, ctx?: LoggerContext): void {
    this.logger.error(ctx ?? {}, message);
  }

  debug(message: string, ctx?: LoggerContext): void {
    this.logger.debug(ctx ?? {}, message);
  }

  verbose(message: string, ctx?: LoggerContext): void {
    this.logger.trace(ctx ?? {}, message);
  }
}
