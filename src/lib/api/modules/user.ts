// user.ts 现在仅作为 auth.ts 的补充，复杂的用户操作走 authApi
// 保留此文件用于可能的未来扩展
export { authApi as userApi } from "./auth";
