// API
export { blogApi } from "~/lib/api";

// Composables
export { useBlogArticles } from "./composables/useBlogArticles";
export { useBlogPost } from "./composables/useBlogPost";
export { useBlogComments } from "./composables/useBlogComments";
export { useBlogStar } from "./composables/useBlogStar";

// Vue page components
export { default as BlogApp } from "./BlogApp.vue";
export { default as BlogArticleList } from "./pages/BlogArticleList.vue";
export { default as BlogArticleDetail } from "./pages/BlogArticleDetail.vue";
export { default as BlogCategories } from "./pages/BlogCategories.vue";
export { default as BlogTags } from "./pages/BlogTags.vue";
export { default as BlogArchive } from "./pages/BlogArchive.vue";
export { default as BlogAbout } from "./pages/BlogAbout.vue";

// Legacy page components (series system)
export { default as BlogHome } from "./pages/BlogHome.vue";
export { default as BlogSeries } from "./pages/BlogSeries.vue";
export { default as BlogPost } from "./pages/BlogPost.vue";
export { default as BlogSearch } from "./pages/BlogSearch.vue";
export { default as BlogArticleCard } from "./pages/BlogArticleCard.vue";
export { default as BlogCommentList } from "./pages/BlogCommentList.vue";
export { default as BlogCommentForm } from "./pages/BlogCommentForm.vue";
export { default as BlogStarButton } from "./pages/BlogStarButton.vue";

// Types
export type * from "./types/blog";
