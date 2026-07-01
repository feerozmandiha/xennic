import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error.js';
import { toRFC7807 } from '../errors/rfc7807-response.js';
import { CORRELATION_ID_HEADER } from '../interceptors/correlation-id.interceptor.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const correlationId =
      (request as any).correlationId ||
      (request.headers[CORRELATION_ID_HEADER] as string) ||
      '';

    let statusCode: number = 500;
    let errorCode: string = 'INTERNAL_ERROR';
    let message: string = 'An unexpected error occurred';
    let details: Record<string, unknown> | undefined;

    if (exception instanceof AppError) {
      exception.setCorrelationId(correlationId);
      statusCode = exception.statusCode;
      errorCode = exception.code;
      message = exception.message;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      if (
        exception instanceof BadRequestException &&
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = { fields: this.formatValidationErrors(exceptionResponse.message) };
      } else {
        errorCode = this.getErrorCodeFromHttpStatus(statusCode);
        message =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message || exception.message;
      }
    } else if (this.isPrismaError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = this.getPrismaErrorCode(exception);
      message = this.getPrismaErrorMessage(exception);
    } else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_ERROR';
      message =
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : exception.message;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
    }

    const problem = toRFC7807(
      {
        code: errorCode as any,
        message,
        statusCode,
        correlationId,
        details,
      },
      request.url,
    );

    response.status(statusCode).send(problem);
  }

  private getErrorCodeFromHttpStatus(status: number): string {
    const codes: Record<number, string> = {
      400: 'VALIDATION_ERROR',
      401: 'AUTHENTICATION_ERROR',
      403: 'AUTHORIZATION_ERROR',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'BUSINESS_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
      502: 'AI_ERROR',
      503: 'INFRASTRUCTURE_ERROR',
    };
    return codes[status] || 'INTERNAL_ERROR';
  }

  private formatValidationErrors(errors: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const error of errors) {
      const match = error.match(/^([a-zA-Z_]+)\s+/);
      const field = match?.[1] || '_general';
      if (!result[field]) result[field] = [];
      result[field].push(error);
    }
    return result;
  }

  private isPrismaError(exception: unknown): boolean {
    return (
      exception instanceof Error &&
      'code' in exception &&
      typeof (exception as any).code === 'string' &&
      (exception as any).code.startsWith('P')
    );
  }

  private getPrismaErrorCode(exception: unknown): string {
    const codes: Record<string, string> = {
      P2002: 'CONFLICT',
      P2003: 'BUSINESS_ERROR',
      P2025: 'NOT_FOUND',
    };
    return codes[(exception as any).code] || 'INTERNAL_ERROR';
  }

  private getPrismaErrorMessage(exception: unknown): string {
    const msgs: Record<string, string> = {
      P2002: 'A record with this value already exists',
      P2003: 'Referenced record does not exist',
      P2025: 'Record not found',
    };
    return msgs[(exception as any).code] || 'Database operation failed';
  }
}
