/**
 * 成员头像 URL 构建。
 *
 * 头像图片存放在后端，经 `/static/avatars/*.webp` 静态服务提供
 * （开发环境由 vite proxy 转发到后端，生产由 nginx 直出）。
 * 前端不再打包任何头像图，这里只负责把后端的 `avatarKey`
 * （如 `七月花.jpg`）映射成站点相对路径的 webp URL。
 *
 * avatarKey 使用原始扩展名（.jpg/.jpeg/.png），后端已统一转为 .webp，
 * 映射规则与旧 getAvatar 一致。
 */
export function avatarUrl(avatarKey?: string): string | undefined {
  if (!avatarKey) return undefined;
  const base = avatarKey.replace(/\.(jpe?g|png)$/i, "");
  return `/static/avatars/${base}.webp`;
}
