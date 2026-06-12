import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let details: Record<string, string[]> | undefined;

    // Handle Known HTTP Exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Handle ValidationPipe errors
      if (
        exception instanceof BadRequestException &&
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
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
  }

  private formatValidationErrors(errors: string[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    
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
    
    return result;
  }

  private isPrismaError(exception: unknown): boolean {
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
      P2002: 'A record with this value already exists',
      P2003: 'Referenced record does not exist',
      P2025: 'Record not found',
    };
    return messages[prismaError.code] || 'Database operation failed';
  }
}