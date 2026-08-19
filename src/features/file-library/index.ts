export { default as FileLibraryFileListPage } from "./components/FileListPage.vue";

// 文件库数据统一从后端 API 客户端获取（mock 已移入后端 seed）。
export { fileLibraryApi } from "../../lib/api/modules/file-library";
export type { FileEntry } from "../../lib/api/modules/file-library";
