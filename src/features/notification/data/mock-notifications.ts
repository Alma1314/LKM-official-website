export interface MockNotification {
  id: string;
  type: 'reply' | 'like' | 'follow' | 'system' | 'file_approved' | 'file_rejected';
  title: string;
  content: string;
  referenceType: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export const mockNotifications: MockNotification[] = [
  {
    id: 'n1',
    type: 'reply',
    title: '新回复',
    content: '张三 回复了你的帖子《量子力学入门》',
    referenceType: 'post',
    referenceId: 'post-1',
    isRead: false,
    createdAt: '2026-07-27T10:30:00Z',
  },
  {
    id: 'n2',
    type: 'like',
    title: '获得点赞',
    content: '李四 赞了你的评论',
    referenceType: 'comment',
    referenceId: 'comment-5',
    isRead: false,
    createdAt: '2026-07-27T09:15:00Z',
  },
  {
    id: 'n3',
    type: 'follow',
    title: '新关注',
    content: '王五 关注了你',
    referenceType: 'user',
    referenceId: 'user-wangwu',
    isRead: false,
    createdAt: '2026-07-26T22:00:00Z',
  },
  {
    id: 'n4',
    type: 'file_approved',
    title: '文件审核通过',
    content: '你上传的《天体物理数据集.zip》已通过审核',
    referenceType: 'file',
    referenceId: 'file-2',
    isRead: true,
    createdAt: '2026-07-26T18:00:00Z',
  },
  {
    id: 'n5',
    type: 'system',
    title: '系统公告',
    content: '理科迷社区 2026 暑假竞赛即将开始，快来参加！',
    referenceType: 'competition',
    referenceId: 'comp-1',
    isRead: true,
    createdAt: '2026-07-25T12:00:00Z',
  },
  {
    id: 'n6',
    type: 'like',
    title: '获得点赞',
    content: '赵六 赞了你的帖子《数学建模经验分享》',
    referenceType: 'post',
    referenceId: 'post-3',
    isRead: true,
    createdAt: '2026-07-25T08:00:00Z',
  },
];
