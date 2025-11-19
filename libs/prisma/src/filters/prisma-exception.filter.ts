import { Prisma } from "@prisma/client";
import type { Response } from "express";

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

type ErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ErrorResponse = {
      statusCode: status,
      message: "Internal server error",
      error: "Internal Server Error",
    };

    switch (exception.code) {
      case "P2002": {
        // Unique constraint violation
        status = HttpStatus.BAD_REQUEST;
        const target = exception.meta?.target as string[] | undefined;
        errorResponse = {
          statusCode: status,
          message: `Unique constraint failed on field(s): ${target?.join(", ") ?? "unknown"}`,
          error: "Bad Request",
        };
        break;
      }
      case "P2003": {
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        const field = exception.meta?.field_name as string | undefined;
        errorResponse = {
          statusCode: status,
          message: `Foreign key constraint failed on field: ${field ?? "unknown field"}. The referenced record does not exist.`,
          error: "Bad Request",
        };
        break;
      }
      case "P2025": {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        const cause = exception.meta?.cause as string | undefined;
        errorResponse = {
          statusCode: status,
          message: cause ?? "Record not found",
          error: "Not Found",
        };
        break;
      }
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorResponse = {
          statusCode: status,
          message: "Internal server error",
          error: "Internal Server Error",
        };
      }
    }

    // Check if we're in HTTP context
    const contextType = host.getType();

    if (contextType === "http") {
      const context = host.switchToHttp();
      const response = context.getResponse<Response>();
      response.status(status).json(errorResponse);
    } else {
      // We're in a microservice (RPC) context - throw RpcException
      throw new RpcException(errorResponse);
    }
  }
}
