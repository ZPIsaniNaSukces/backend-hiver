import type { Response } from "express";

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";

interface RpcErrorPayload {
  statusCode?: number;
  message?: string;
  error?: string;
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";

    if (this.hasErrorPayload(exception)) {
      const parsedPayload = this.parseRpcErrorPayload(exception.error);

      if (parsedPayload != null) {
        if (typeof parsedPayload.statusCode === "number") {
          status = parsedPayload.statusCode;
        }

        if (
          typeof parsedPayload.message === "string" &&
          parsedPayload.message.trim().length > 0
        ) {
          message = parsedPayload.message;
        }

        if (
          typeof parsedPayload.error === "string" &&
          parsedPayload.error.trim().length > 0
        ) {
          error = parsedPayload.error;
        }
      }
    } else if (exception instanceof Error) {
      const candidateMessage = exception.message;
      if (candidateMessage.trim().length > 0) {
        message = candidateMessage;
      }
    } else if (this.hasMessageProperty(exception)) {
      const candidateMessage = exception.message;
      if (
        typeof candidateMessage === "string" &&
        candidateMessage.trim().length > 0
      ) {
        message = candidateMessage;
      }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
    });
  }

  private hasErrorPayload(value: unknown): value is { error: unknown } {
    return this.isRecord(value) && "error" in value;
  }

  private hasMessageProperty(value: unknown): value is { message: unknown } {
    return this.isRecord(value) && "message" in value;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private parseRpcErrorPayload(errorValue: unknown): RpcErrorPayload | null {
    if (typeof errorValue === "string") {
      try {
        const parsed = JSON.parse(errorValue) as unknown;
        if (this.isRpcErrorPayload(parsed)) {
          return parsed;
        }
      } catch {
        return { message: errorValue };
      }
      return { message: errorValue };
    }

    if (this.isRpcErrorPayload(errorValue)) {
      return errorValue;
    }

    if (errorValue instanceof Error && errorValue.message.trim().length > 0) {
      return { message: errorValue.message };
    }

    return null;
  }

  private isRpcErrorPayload(value: unknown): value is RpcErrorPayload {
    if (!this.isRecord(value)) {
      return false;
    }

    const { statusCode, message, error } = value;

    const statusValid =
      statusCode === undefined || typeof statusCode === "number";
    const messageValid = message === undefined || typeof message === "string";
    const errorValid = error === undefined || typeof error === "string";

    return statusValid && messageValid && errorValid;
  }
}
