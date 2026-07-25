// src/core/errors/error-codes.ts
export const ErrorCode = {
  DB_OPEN_FAILED: 'DB_OPEN_FAILED',
  DB_WRITE_FAILED: 'DB_WRITE_FAILED',
  DB_READ_FAILED: 'DB_READ_FAILED',
  DB_DELETE_FAILED: 'DB_DELETE_FAILED',
  AUTOSAVE_FAILED: 'AUTOSAVE_FAILED',
  VERSION_SAVE_FAILED: 'VERSION_SAVE_FAILED',
  BACKUP_FAILED: 'BACKUP_FAILED',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
  IMPORT_FAILED: 'IMPORT_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
  constructor(
    public code: ErrorCodeType,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
