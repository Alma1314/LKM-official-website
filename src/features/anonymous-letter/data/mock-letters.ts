export interface MockLetter {
  id: string;
  title?: string;
  content: string;
  tags: string[];
  replyCount: number;
  createdAt: string;
}

export interface MockLetterReply {
  id: string;
  letterId: string;
  content: string;
  createdAt: string;
}

export const mockLetters: MockLetter[] = [
  {
    id: 'l1',
    title: '越来越学不动了',
    content: '大三了，每天都要学很多东西，有时候觉得自己跟不上，晚上睡不着，真的很累。不知道有没有人和我一样？',
    tags: ['压力', '学业'],
    replyCount: 12,
    createdAt: '2026-07-27T02:00:00Z',
  },
  {
    id: 'l2',
    content: '研究生选导师选错了方向，每天都在做自己不喜欢的东西。想换方向又怕导师不同意，也不知道该找谁聊。',
    tags: ['迷茫', '学业'],
    replyCount: 8,
    createdAt: '2026-07-26T22:00:00Z',
  },
  {
    id: 'l3',
    title: '家里人不同意我读博',
    content:
      '放弃了高薪工作选择读博，家里人从一开始就不支持，最近每次打电话都会吵架。我知道他们是为我好，但我真的喜欢研究。该怎么办？',
    tags: ['家庭', '学业'],
    replyCount: 15,
    createdAt: '2026-07-26T18:00:00Z',
  },
  {
    id: 'l4',
    content: '学习要认真，生活也要认真。所以什么时候才能遇到那个可以一起去图书馆的人呢。',
    tags: ['感情'],
    replyCount: 6,
    createdAt: '2026-07-25T20:00:00Z',
  },
  {
    id: 'l5',
    title: '实习第一周——我什么都听不懂',
    content:
      '暑期去了一家科技公司实习，第一周开会时领导说的术语我有一半听不懂。每天都在拼命查资料，又不敢问太多显得自己很蠢。这是正常的吗？',
    tags: ['压力', '工作'],
    replyCount: 10,
    createdAt: '2026-07-24T15:00:00Z',
  },
  {
    id: 'l6',
    content: '毕业两年了，做着和专业完全不相关的工作。有时候在想，当年学的那些知识有什么用呢？但又不甘心放弃。',
    tags: ['迷茫', '工作'],
    replyCount: 7,
    createdAt: '2026-07-23T12:00:00Z',
  },
];

export const mockReplies: MockLetterReply[] = [
  {
    id: 'r1',
    letterId: 'l1',
    content:
      '你不是一个人。大三确实是压力最大的时候。试试把任务拆成小块，每完成一个小块就奖励自己一下。慢慢来，比较快。',
    createdAt: '2026-07-27T03:00:00Z',
  },
  {
    id: 'r2',
    letterId: 'l1',
    content:
      '我也是大三，每天晚上睡前会写十分钟日记，把焦虑的事情写下来，写完就告诉自己"今天已经尽力了"。这个方法对我挺有用的。',
    createdAt: '2026-07-27T04:00:00Z',
  },
  {
    id: 'r3',
    letterId: 'l3',
    content:
      '研究生导师也曾反对我读博。但后来我拿到了全额奖学金，他们看到我是认真的，慢慢就接受了。用行动证明给他们看，而不是吵架。',
    createdAt: '2026-07-26T20:00:00Z',
  },
  {
    id: 'r4',
    letterId: 'l3',
    content:
      '理解你。但也要想想家人的担忧有没有道理。如果是真的热爱，就坚持下去，同时多和家人沟通你的规划和进展，让他们放心。',
    createdAt: '2026-07-26T21:00:00Z',
  },
  {
    id: 'r5',
    letterId: 'l5',
    content:
      '太正常了！实习第一周就是用来"听不懂"的。主动找 mentor 约一次 1-on-1，准备好问题清单，这是最高效的学习方式。',
    createdAt: '2026-07-24T16:00:00Z',
  },
];

export const LETTER_TAGS = ['压力', '迷茫', '感情', '学业', '家庭', '工作', '其他'];
