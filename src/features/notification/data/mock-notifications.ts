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
    title: 'notificationData.titles.reply',
    content: 'notificationData.contents.n1',
    referenceType: 'post',
    referenceId: 'post-1',
    isRead: false,
    createdAt: '2026-07-27T10:30:00Z',
  },
  {
    id: 'n2',
    type: 'like',
    title: 'notificationData.titles.like',
    content: 'notificationData.contents.n2',
    referenceType: 'comment',
    referenceId: 'comment-5',
    isRead: false,
    createdAt: '2026-07-27T09:15:00Z',
  },
  {
    id: 'n3',
    type: 'follow',
    title: 'notificationData.titles.follow',
    content: 'notificationData.contents.n3',
    referenceType: 'user',
    referenceId: 'user-wangwu',
    isRead: false,
    createdAt: '2026-07-26T22:00:00Z',
  },
  {
    id: 'n4',
    type: 'file_approved',
    title: 'notificationData.titles.fileApproved',
    content: 'notificationData.contents.n4',
    referenceType: 'file',
    referenceId: 'file-2',
    isRead: true,
    createdAt: '2026-07-26T18:00:00Z',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'notificationData.titles.system',
    content: 'notificationData.contents.n5',
    referenceType: 'competition',
    referenceId: 'comp-1',
    isRead: true,
    createdAt: '2026-07-25T12:00:00Z',
  },
  {
    id: 'n6',
    type: 'like',
    title: 'notificationData.titles.like',
    content: 'notificationData.contents.n6',
    referenceType: 'post',
    referenceId: 'post-3',
    isRead: true,
    createdAt: '2026-07-25T08:00:00Z',
  },
];
