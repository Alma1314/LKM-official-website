export const BLOG_API = {
  series: {
    list: "/api/v1/blog/series",
    detail: (id: number) => `/api/v1/blog/series/${id}`,
    create: "/api/v1/blog/series",
    update: (id: number) => `/api/v1/blog/series/${id}`,
    delete: (id: number) => `/api/v1/blog/series/${id}`,
  },
  star: {
    toggle: (id: number) => `/api/v1/blog/series/${id}/star`,
  },
  comments: {
    list: (id: number) => `/api/v1/blog/series/${id}/comments`,
    create: (id: number) => `/api/v1/blog/series/${id}/comments`,
    delete: (seriesId: number, commentId: number) =>
      `/api/v1/blog/series/${seriesId}/comments/${commentId}`,
  },
  files: {
    get: (id: number, filepath: string) =>
      `/api/v1/blog/series/${id}/files/${filepath}`,
  },
  articles: {
    list: "/api/v1/articles",
    detail: (slug: string) => `/api/v1/articles/${slug}`,
    prevNext: (slug: string) => `/api/v1/articles/${slug}/prev-next`,
  },
  categories: {
    list: "/api/v1/articles/categories",
    detail: (slug: string) => `/api/v1/articles/categories/${slug}`,
  },
  tags: {
    list: "/api/v1/articles/tags",
    detail: (slug: string) => `/api/v1/articles/tags/${slug}`,
  },
  search: {
    query: "/api/v1/articles/search",
  },
  about: {
    get: "/api/v1/articles/about",
  },
} as const;
