export interface MockProject {
  id: string;
  name: string;
  initiatorName: string;
  type: 'recruiting' | 'showcase';
  background: string;
  goals: string;
  requirements: string;
  teamIntro: string;
  progress: number;
  recruitingRoles: string[];
  team: { name: string; role: string }[];
  tags: string[];
  isIncubated: boolean;
  isPinned: boolean;
  isRecruiting: boolean;
  reports: MockProjectReport[];
  createdAt: string;
}

export interface MockProjectReport {
  title: string;
  content: string;
  revision: number;
  date: string;
}

export const mockProjects: MockProject[] = [
  {
    id: 'proj-1', name: '量子计算模拟平台', initiatorName: '七月O', type: 'recruiting',
    background: '量子计算是未来计算的重要方向。我们计划开发一个基于 Web 的量子计算模拟平台，帮助学习者直观理解量子算法。',
    goals: '开发一个可在浏览器中运行 8-qubit 量子电路模拟器，支持常用量子门操作和测量。',
    requirements: '需要前端开发（React/TypeScript）1-2 人、量子物理顾问 1 人、UI 设计师 1 人。',
    teamIntro: '发起人七月O为中科院博士，量子物理方向。已有后端算法原型。',
    progress: 40, recruitingRoles: ['前端开发', 'UI 设计师'], team: [{ name: '七月O', role: '发起人' }],
    tags: ['量子计算', 'Web 开发', '教育'], isIncubated: true, isPinned: true, isRecruiting: true,
    reports: [
      { title: '项目启动 & 需求分析完成', content: '完成了量子电路模拟的技术调研，确定了技术栈和架构方案，后端算法原型已就绪。', revision: 0, date: '2026-07-01' },
      { title: '一改：基础 UI 框架搭建', content: '完成了前端基础框架搭建，实现了单 qubit 操作的可视化。正在招募前端开发协助完善多 qubit 模拟。', revision: 1, date: '2026-07-15' },
    ],
    createdAt: '2026-07-01',
  },
  {
    id: 'proj-2', name: '理科迷知识图谱', initiatorName: '七月墨染', type: 'recruiting',
    background: '社区里有大量优质内容散落在各板块，希望通过知识图谱的方式组织起来，方便检索和学习。',
    goals: '构建理科迷社区知识图谱，支持关键词检索、关联推荐、学习路径生成。',
    requirements: '需要后端开发 1 人（Python/图数据库）、前端 1 人（可视化）、内容编辑若干。',
    teamIntro: '',
    progress: 20, recruitingRoles: ['后端开发', '内容编辑'], team: [{ name: '七月墨染', role: '发起人' }],
    tags: ['知识图谱', 'Python', '社区'], isIncubated: false, isPinned: false, isRecruiting: true,
    reports: [
      { title: '项目启动', content: '确定了基于 Neo4j 的技术方案，初步梳理了数学板块的内容分类体系。', revision: 0, date: '2026-07-20' },
    ],
    createdAt: '2026-07-20',
  },
  {
    id: 'proj-3', name: '科普视频系列制作', initiatorName: '七月花', type: 'showcase',
    background: '制作面向中学生的科普系列视频，用生动有趣的动画和故事讲解科学原理。',
    goals: '完成 12 集科普视频制作并在 B站和 YouTube 发布，目标覆盖 10 万播放。',
    requirements: '',
    teamIntro: '跨学科团队，包括物理、化学、生物各专业成员。已发布 5 集。',
    progress: 50, recruitingRoles: [], team: [{ name: '七月花', role: '总策划' }, { name: '动画师小王', role: '动画制作' }, { name: '配音员小李', role: '配音' }],
    tags: ['科普', '视频', '教育'], isIncubated: true, isPinned: false, isRecruiting: false,
    reports: [
      { title: '初版：前 3 集发布', content: '《光的奇妙旅程》《原子的秘密》《化学反应是什么》三集已上线B站，累计播放 3.5 万。', revision: 0, date: '2026-06-15' },
      { title: '一改：中期评估', content: '第 4-5 集已发布，总播放量突破 8 万。收到观众积极反馈，开始优化文案和动画风格。', revision: 1, date: '2026-07-10' },
    ],
    createdAt: '2026-06-01',
  },
  {
    id: 'proj-4', name: '天体观测数据可视化项目', initiatorName: '天文爱好者', type: 'showcase',
    background: '利用公开天文数据，制作交互式天体数据可视化作品。',
    goals: '实现 3 个交互式可视化作品：星表全景图、银河系 3D 模型、引力波事件时间线。',
    requirements: '',
    teamIntro: '由社区天文爱好者组成，使用 Python + Three.js 技术栈。',
    progress: 75, recruitingRoles: [], team: [{ name: '天文爱好者', role: '发起人' }, { name: '数据工程师小张', role: '数据处理' }],
    tags: ['天文', '数据可视化', 'Three.js'], isIncubated: false, isPinned: false, isRecruiting: false,
    reports: [
      { title: '初版：技术选型与数据采集', content: '确定使用 Three.js 进行 3D 渲染，选取 Gaia DR3 恒星数据。', revision: 0, date: '2026-06-20' },
      { title: '一改：星表全景图完成', content: '第一个作品上线，展示约 100 万颗恒星的分布。', revision: 1, date: '2026-07-05' },
      { title: '二改：银河系 3D 模型完成', content: '第二个作品上线，用户可旋转/缩放查看银河系结构。目前正在做引力波时间线。', revision: 2, date: '2026-07-25' },
    ],
    createdAt: '2026-06-20',
  },
];
