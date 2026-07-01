import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
<<<<<<< HEAD
import { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/app-error.js';
import { toRFC7807 } from '../errors/rfc7807-response.js';
import { CORRELATION_ID_HEADER } from '../interceptors/correlation-id.interceptor.js';
=======
import { FastifyReply } from 'fastify';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
<<<<<<< HEAD
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

=======

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let details: Record<string, string[]> | undefined;

    // Handle Known HTTP Exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Handle ValidationPipe errors
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
      if (
        exception instanceof BadRequestException &&
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
<<<<<<< HEAD
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
=======
        details = this.formatValidationErrors(exceptionResponse.message);
      } else {
        errorCode = this.getErrorCodeFromHttpStatus(statusCode);
        message = typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : exceptionResponse.message || exception.message;
      }
    }
    // Handle Prisma Known Errors
    else if (this.isPrismaError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      errorCode = this.getPrismaErrorCode(exception);
      message = this.getPrismaErrorMessage(exception);
    }
    // Handle Unknown Errors
    else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : exception.message;
      
      // Log error for debugging
      console.error('Unhandled exception:', exception);
    }
    // Handle Unknown type
    else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = 'An unexpected error occurred';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
    };

    // Fastify uses .send() not .json()
    response.status(statusCode).send(errorResponse);
  }

  private getErrorCodeFromHttpStatus(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    return errorCodes[status] || 'HTTP_EXCEPTION';
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
  }

  private formatValidationErrors(errors: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
<<<<<<< HEAD
    for (const error of errors) {
      const match = error.match(/^([a-zA-Z_]+)\s+/);
      const field = match?.[1] || '_general';
      if (!result[field]) result[field] = [];
      result[field].push(error);
    }
=======
    
    errors.forEach((error: string) => {
      const match = error.match(/^([a-zA-Z_]+)\s+/);
      if (match && match[1]) {
        const field = match[1];
        if (!result[field]) {
          result[field] = [];
        }
        result[field].push(error);
      } else {
        if (!result._general) {
          result._general = [];
        }
        result._general.push(error);
      }
    });
    
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
    return result;
  }

  private isPrismaError(exception: unknown): boolean {
<<<<<<< HEAD
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
=======
    return exception instanceof Error && 
           'code' in exception && 
           typeof (exception as any).code === 'string' &&
           (exception as any).code.startsWith('P');
  }

  private getPrismaErrorCode(exception: unknown): string {
    const prismaError = exception as any;
    const codes: Record<string, string> = {
      P2002: 'UNIQUE_CONSTRAINT_VIOLATION',
      P2003: 'FOREIGN_KEY_VIOLATION',
      P2025: 'RECORD_NOT_FOUND',
    };
    return codes[prismaError.code] || 'DATABASE_ERROR';
  }

  private getPrismaErrorMessage(exception: unknown): string {
    const prismaError = exception as any;
    const messages: Record<string, string> = {
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
      P2002: 'A record with this value already exists',
      P2003: 'Referenced record does not exist',
      P2025: 'Record not found',
    };
<<<<<<< HEAD
    return msgs[(exception as any).code] || 'Database operation failed';
  }
}
=======
    return messages[prismaError.code] || 'Database operation failed';
  }
}
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
