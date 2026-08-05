// 统一 Result 类型 — 从 neverthrow 重导出，作为项目唯一权威来源
//
// 用法：
//   import { ok, err, type Result } from '~/lib/errors/result';
//   function doThing(): Result<Data, AppError> { ... }
export { ok, err, okAsync, errAsync, type Result, type ResultAsync } from 'neverthrow';
