export interface AdminStat {
  label: string;
  value: number;
  change: string;
  icon: string;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: "member" | "moderator" | "admin";
  level: "local" | "normal" | "professional";
  postCount: number;
  points: number;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminPost {
  id: string;
  title: string;
  authorName: string;
  categoryName: string;
  status: "published" | "flagged" | "deleted";
  flagReason?: string;
  viewCount: number;
  createdAt: string;
}

export interface AdminFile {
  id: string;
  originalName: string;
  uploaderName: string;
  size: string;
  categoryName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: "post" | "comment" | "file";
  targetId: string;
  targetTitle: string;
  reporterName: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export const adminStats: AdminStat[] = [
  {
    label: "adminData.stats.users",
    value: 156,
    change: "adminData.stats.usersChange",
    icon: "tabler:users",
  },
  {
    label: "adminData.stats.posts",
    value: 42,
    change: "adminData.stats.postsChange",
    icon: "tabler:article",
  },
  {
    label: "adminData.stats.pendingFiles",
    value: 12,
    change: "adminData.stats.filesChange",
    icon: "tabler:file-check",
  },
  {
    label: "adminData.stats.pendingReports",
    value: 3,
    change: "",
    icon: "tabler:flag",
  },
];

export const adminUsers: AdminUser[] = [
  {
    id: "u1",
    username: "qiyue-o",
    displayName: "七月O",
    email: "qiyue-o@likemi.com",
    role: "moderator",
    level: "professional",
    postCount: 28,
    points: 12500,
    isBanned: false,
    createdAt: "2026-01-15",
  },
  {
    id: "u2",
    username: "qiyue-hua",
    displayName: "七月花",
    email: "qiyue-hua@likemi.com",
    role: "admin",
    level: "professional",
    postCount: 35,
    points: 8900,
    isBanned: false,
    createdAt: "2026-01-10",
  },
  {
    id: "u3",
    username: "qiyue-moran",
    displayName: "七月墨染",
    email: "qiyue-moran@likemi.com",
    role: "member",
    level: "normal",
    postCount: 42,
    points: 5200,
    isBanned: false,
    createdAt: "2026-02-20",
  },
  {
    id: "u4",
    username: "spammer001",
    displayName: "广告账号",
    email: "spam@test.com",
    role: "member",
    level: "local",
    postCount: 5,
    points: 50,
    isBanned: true,
    createdAt: "2026-07-20",
  },
  {
    id: "u5",
    username: "new_user",
    displayName: "新用户",
    email: "new@test.com",
    role: "member",
    level: "normal",
    postCount: 0,
    points: 0,
    isBanned: false,
    createdAt: "2026-07-27",
  },
];

export const adminPosts: AdminPost[] = [
  {
    id: "post-1",
    title: "adminData.posts.titleQuantum",
    authorName: "七月O",
    categoryName: "adminData.categories.physicsAstro",
    status: "published",
    viewCount: 2340,
    createdAt: "2026-07-20",
  },
  {
    id: "post-2",
    title: "adminData.posts.titlePython",
    authorName: "七月墨染",
    categoryName: "adminData.categories.infoScience",
    status: "published",
    viewCount: 1560,
    createdAt: "2026-07-22",
  },
  {
    id: "post-99",
    title: "adminData.posts.titleSpam",
    authorName: "广告账号",
    categoryName: "adminData.categories.math",
    status: "flagged",
    flagReason: "adminData.reasons.spam",
    viewCount: 45,
    createdAt: "2026-07-27",
  },
  {
    id: "post-100",
    title: "adminData.posts.titleSensitive",
    authorName: "可疑用户",
    categoryName: "adminData.categories.socialScience",
    status: "flagged",
    flagReason: "adminData.reasons.violation",
    viewCount: 120,
    createdAt: "2026-07-26",
  },
];

export const adminFiles: AdminFile[] = [
  {
    id: "file-1",
    originalName: "adminData.files.astroDataset",
    uploaderName: "七月O",
    size: "128 MB",
    categoryName: "adminData.categories.physicsAstro",
    status: "approved",
    createdAt: "2026-07-15",
  },
  {
    id: "file-7",
    originalName: "adminData.files.chipTutorial",
    uploaderName: "芯片工程师",
    size: "12 MB",
    categoryName: "adminData.categories.integratedCircuit",
    status: "pending",
    createdAt: "2026-07-27",
  },
  {
    id: "file-8",
    originalName: "adminData.files.academicWriting",
    uploaderName: "留学生小明",
    size: "4 MB",
    categoryName: "adminData.categories.english",
    status: "pending",
    createdAt: "2026-07-26",
  },
  {
    id: "file-9",
    originalName: "adminData.files.crackTutorial",
    uploaderName: "可疑用户",
    size: "50 MB",
    categoryName: "adminData.categories.infoScience",
    status: "rejected",
    createdAt: "2026-07-25",
  },
];

export const adminReports: AdminReport[] = [
  {
    id: "r1",
    type: "post",
    targetId: "post-99",
    targetTitle: "adminData.reports.targetSpam",
    reporterName: "adminData.reports.reporterEnthusiast",
    reason: "adminData.reasons.spam",
    status: "pending",
    createdAt: "2026-07-27",
  },
  {
    id: "r2",
    type: "comment",
    targetId: "comment-99",
    targetTitle: "adminData.reports.targetComment",
    reporterName: "adminData.reports.reporterAnonymous",
    reason: "adminData.reasons.harassment",
    status: "pending",
    createdAt: "2026-07-27",
  },
  {
    id: "r3",
    type: "file",
    targetId: "file-100",
    targetTitle: "adminData.reports.targetFile",
    reporterName: "adminData.reports.reporterCopyright",
    reason: "adminData.reasons.infringement",
    status: "pending",
    createdAt: "2026-07-26",
  },
];
