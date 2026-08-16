// src/lib/errors/error-codes.ts
export const ErrorCode = {
  // 持久化
  DB_OPEN_FAILED: "DB_OPEN_FAILED",
  DB_WRITE_FAILED: "DB_WRITE_FAILED",
  DB_READ_FAILED: "DB_READ_FAILED",
  DB_DELETE_FAILED: "DB_DELETE_FAILED",
  AUTOSAVE_FAILED: "AUTOSAVE_FAILED",
  VERSION_SAVE_FAILED: "VERSION_SAVE_FAILED",
  BACKUP_FAILED: "BACKUP_FAILED",
  DOCUMENT_NOT_FOUND: "DOCUMENT_NOT_FOUND",
  IMPORT_FAILED: "IMPORT_FAILED",
  EXPORT_FAILED: "EXPORT_FAILED",

  // 网络 / HTTP
  NETWORK_ERROR: "NETWORK_ERROR",
  HTTP_TIMEOUT: "HTTP_TIMEOUT",
  HTTP_SERVER_ERROR: "HTTP_SERVER_ERROR",
  HTTP_CLIENT_ERROR: "HTTP_CLIENT_ERROR",

  // 通用
  PARSE_ERROR: "PARSE_ERROR",
  AUTH_ERROR: "AUTH_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  constructor(
    public code: ErrorCodeType,
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}
