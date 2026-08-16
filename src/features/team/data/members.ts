/** 成员数据接口 */
export interface Member {
  name?: string;
  /** 对应 src/assets/images/member-optimized/ 下的 .webp 文件名（avatarKey 使用原始扩展名，运行时会自动映射） */
  avatarKey?: string;
  role?: string;
  desc?: string;
  dream?: string;
  quote?: string;
}

/** 子群组接口 */
export interface SubGroup {
  label: string;
  desc?: string;
  members: Member[];
}

/** 创始人 */
export const founderMembers: Member[] = [
  {
    name: '可琪（若有千寻）',
    role: 'team.roles.founder',
    avatarKey: '若有千寻.jpg',
    desc: 'team.members.keke.desc',
    quote: 'team.members.keke.quote',
    dream: 'team.members.keke.dream',
  },
];

/** 总务部 */
export const generalMembers: Member[] = [
  { name: '七月花', avatarKey: '七月花.jpg', desc: 'team.members.julyHua.desc', dream: 'team.members.julyHua.dream' },
  { name: '七月知更鸟', avatarKey: '七月知更鸟.jpeg', desc: 'team.members.julyRobin.desc' },
  { name: '七月阿鸿', avatarKey: '七月阿鸿.jpeg', desc: 'team.members.julyAhong.desc' },
  {
    name: '七月墨染',
    avatarKey: '七月墨染.png',
    desc: 'team.members.julyMoran.desc',
    dream: 'team.members.julyMoran.dream',
    quote: 'team.members.julyMoran.quote',
  },
  {
    name: '七月有枝',
    avatarKey: '七月有枝.jpeg',
    desc: 'team.members.julyYouzhi.desc',
    dream: 'team.members.julyYouzhi.dream',
    quote: 'team.members.julyYouzhi.quote',
  },
  {
    name: '七月komoyume',
    avatarKey: '七月komoyume.jpeg',
    desc: 'team.members.julyKomoyume.desc',
    dream: 'team.members.julyKomoyume.dream',
    quote: 'team.members.julyKomoyume.quote',
  },
  {
    name: '七月千寻',
    avatarKey: '七月千寻.jpg',
    desc: 'team.members.julyQianxun.desc',
    dream: 'team.members.julyQianxun.dream',
  },
];

/** 群务部 —— 按子分组 */
export const affairsSubGroups: Record<string, SubGroup> = {
  high: {
    label: 'team.subGroups.affairsHigh.label',
    members: [
      { name: '七月止水', avatarKey: '七月止水.png', desc: 'team.members.julyZhishui.desc' },
      {
        name: '七月清汉',
        avatarKey: '七月清汉.png',
        desc: 'team.members.julyQinghan.desc',
        dream: 'team.members.julyQinghan.dream',
        quote: 'team.members.julyQinghan.quote',
      },
      { name: '七月爱畅依间', avatarKey: '七月爱畅依间.jpeg' },
      {
        name: '七月夏',
        avatarKey: '七月夏.jpeg',
        desc: 'team.members.julyXia.desc',
        dream: 'team.members.julyXia.dream',
        quote: 'team.members.julyXia.quote',
      },
      {
        name: '七月清浅',
        avatarKey: '七月清浅.jpeg',
        desc: 'team.members.julyQingqian.desc',
        dream: 'team.members.julyQingqian.dream',
      },
      {
        name: '七月MK',
        avatarKey: '七月MK.png',
        desc: 'team.members.julyMk.desc',
        dream: 'team.members.julyMk.dream',
        quote: 'team.members.julyMk.quote',
      },
    ],
  },
  high3: {
    label: 'team.subGroups.affairsHigh3.label',
    members: [
      {
        name: '七月流年',
        avatarKey: '七月流年.jpeg',
        desc: 'team.members.julyLiunian.desc',
        dream: 'team.members.julyLiunian.dream',
        quote: 'team.members.julyLiunian.quote',
      },
    ],
  },
  junior: {
    label: 'team.subGroups.affairsJunior.label',
    members: [
      { name: '七月badragon', avatarKey: '七月badragon.jpeg', desc: 'team.members.julyBadragon.desc' },
      {
        name: '七月三七',
        avatarKey: '七月三七.jpeg',
        desc: 'team.members.julySanqi.desc',
        dream: 'team.members.julySanqi.dream',
      },
      { name: '七月焱 Echo', avatarKey: '七月焱 Echo.jpeg', desc: 'team.members.julyEcho.desc' },
    ],
  },
  junior2: {
    label: 'team.subGroups.affairsJunior2.label',
    members: [
      {
        name: '七月郁离',
        avatarKey: '七月郁离.png',
        desc: 'team.members.julyYuli.desc',
        quote: 'team.members.julyYuli.quote',
      },
    ],
  },
  social: {
    label: 'team.subGroups.affairsSocial.label',
    members: [{ name: '七月十一', avatarKey: '七月十一.jpg', desc: 'team.members.julyShiyi.desc' }],
  },
  language: {
    label: 'team.subGroups.affairsLanguage.label',
    members: [
      {
        name: '七月颜子墨',
        avatarKey: '七月颜子墨.jpg',
        desc: 'team.members.julyYanzimo.desc',
        dream: 'team.members.julyYanzimo.dream',
        quote: 'team.members.julyYanzimo.quote',
      },
    ],
  },
  chess: {
    label: 'team.subGroups.affairsChess.label',
    members: [
      {
        name: '七月随便',
        avatarKey: '七月随便.jpg',
        desc: 'team.members.julySuibian.desc',
        dream: 'team.members.julySuibian.dream',
        quote: 'team.members.julySuibian.quote',
      },
      { name: '七月熠', avatarKey: '七月熠.jpg' },
    ],
  },
  music: {
    label: 'team.subGroups.affairsMusic.label',
    members: [{ name: '七月慕楸', avatarKey: '七月慕楸.jpg' }],
  },
};

/** 活动策划部 */
export const eventsMembers: Member[] = [
  {
    name: '七月赤',
    avatarKey: '七月赤.jpeg',
    role: 'team.roles.regular',
    desc: 'team.members.julyChi.desc',
    dream: 'team.members.julyChi.dream',
    quote: 'team.members.julyChi.quote',
  },
];

/** 新闻办 */
export const newsMembers: Member[] = [];

/** 新闻办下属小组 */
export const newsSubGroups: Record<string, SubGroup> = {
  production: {
    label: 'team.subGroups.newsProduction.label',
    desc: 'team.subGroups.newsProduction.desc',
    members: [
      {
        name: '七月草薙铃',
        avatarKey: '七月草薙铃.png',
        desc: 'team.members.julyCaotiling.desc',
        dream: 'team.members.julyCaotiling.dream',
        quote: 'team.members.julyCaotiling.quote',
      },
      { name: '七月一前', avatarKey: '七月一前.png', desc: 'team.members.julyYiqian.desc' },
      {
        name: '七月孙',
        avatarKey: '七月孙.jpg',
        desc: 'team.members.julySun.desc',
        dream: 'team.members.julySun.dream',
        quote: 'team.members.julySun.quote',
      },
    ],
  },
  promotion: {
    label: 'team.subGroups.newsPromotion.label',
    desc: 'team.subGroups.newsPromotion.desc',
    members: [] as Member[],
  },
  science: {
    label: 'team.subGroups.newsScience.label',
    desc: 'team.subGroups.newsScience.desc',
    members: [
      {
        name: '七月星染',
        avatarKey: '七月星染.png',
        desc: 'team.members.julyXingran.desc',
        dream: 'team.members.julyXingran.dream',
        quote: 'team.members.julyXingran.quote',
      },
    ],
  },
};

/** 顾问团 */
export const advisorMembers: Member[] = [
  {
    name: '七月upogg',
    avatarKey: '七月upogg.jpg',
    role: 'team.roles.leader',
    desc: 'team.members.julyUpogg.desc',
    quote: 'team.members.julyUpogg.quote',
  },
];

/** 技术委员会 */
export const techMembers: Member[] = [
  {
    name: '七月可分数列',
    avatarKey: '七月可分数列.jpg',
    role: 'team.roles.president',
    desc: 'team.members.julyKefenshulie.desc',
  },
  {
    name: '七月A（笨笨狐狸！）',
    avatarKey: '七月A.jpg',
    desc: 'team.members.julyA.desc',
    dream: 'team.members.julyA.dream',
  },
  { name: '七月合成魔法', avatarKey: '七月合成魔法.jpg' },
];

/** 专业委员会下属各学科组 */
export const professionalSubGroups: Record<string, SubGroup> = {
  math: {
    label: 'team.subGroups.profMath.label',
    members: [
      { name: '七月Bcent', avatarKey: '七月Bcent.jpeg', desc: 'team.members.julyBcent.desc' },
      {
        name: '七月阿泠',
        avatarKey: '七月阿泠.jpeg',
        desc: 'team.members.julyAleng.desc',
        dream: 'team.members.julyAleng.dream',
        quote: 'team.members.julyAleng.quote',
      },
      { name: '七月彼方', avatarKey: '七月彼方.jpeg', desc: 'team.members.julyBifang.desc' },
      {
        name: '七月有珠',
        avatarKey: '七月有珠.jpeg',
        desc: 'team.members.julyYouzhu.desc',
        quote: 'team.members.julyYouzhu.quote',
      },
      { name: '七月Lichlet', avatarKey: '七月Lichlet.jpeg', desc: 'team.members.julyLichlet.desc' },
      {
        name: '七月胡冰阳',
        avatarKey: '七月胡冰阳.jpeg',
        desc: 'team.members.julyHubingyang.desc',
        dream: 'team.members.julyHubingyang.dream',
        quote: 'team.members.julyHubingyang.quote',
      },
    ],
  },
  physics: {
    label: 'team.subGroups.profPhysics.label',
    members: [
      {
        name: '七月O',
        avatarKey: '七月O.png',
        desc: 'team.members.julyO.desc',
        dream: 'team.members.julyO.dream',
        quote: 'team.members.julyO.quote',
      },
      {
        name: '七月汽水',
        avatarKey: '七月汽水.png',
        desc: 'team.members.julyQishui.desc',
        dream: 'team.members.julyQishui.dream',
        quote: 'team.members.julyQishui.quote',
      },
      {
        name: '七月星河',
        avatarKey: '七月星河.png',
        desc: 'team.members.julyXinghe.desc',
        dream: 'team.members.julyXinghe.dream',
        quote: 'team.members.julyXinghe.quote',
      },
    ],
  },
  chemistry: {
    label: 'team.subGroups.profChemistry.label',
    members: [
      {
        name: '七月tetrodotoxin',
        avatarKey: '七月tetrodotoxin.jpeg',
        desc: 'team.members.julyTetro.desc',
      },
      {
        name: '七月狄离',
        avatarKey: '七月狄离.png',
        desc: 'team.members.julyDili.desc',
        dream: 'team.members.julyDili.dream',
        quote: 'team.members.julyDili.quote',
      },
      {
        name: '七月文',
        avatarKey: '七月文.jpeg',
        desc: 'team.members.julyWen.desc',
        dream: 'team.members.julyWen.dream',
      },
      { name: '七月三尺水', avatarKey: '七月三尺水.jpg', desc: 'team.members.julySanchishui.desc' },
    ],
  },
  biology: {
    label: 'team.subGroups.profBiology.label',
    members: [
      {
        name: '七月基米',
        avatarKey: '七月基米.png',
        desc: 'team.members.julyJimi.desc',
        dream: 'team.members.julyJimi.dream',
        quote: 'team.members.julyJimi.quote',
      },
    ],
  },
  general: {
    label: 'team.subGroups.profGeneral.label',
    members: [{ name: '七月卅律', avatarKey: '七月卅律.jpg' }],
  },
  medicine: {
    label: 'team.subGroups.profMedicine.label',
    members: [
      {
        name: '七月雨夜',
        // avatarKey: 文件不存在，使用文字回退
        desc: 'team.members.julyYuye.desc',
        dream: 'team.members.julyYuye.dream',
        quote: 'team.members.julyYuye.quote',
      },
    ],
  },
};

/** 项目团队 —— 按子分组 */
export const projectSubGroups: Record<string, SubGroup> = {
  textbooks: {
    label: 'team.subGroups.projTextbooks.label',
    desc: 'team.subGroups.projTextbooks.desc',
    members: [
      {
        name: '七月大雄',
        avatarKey: '七月大雄.jpeg',
        desc: 'team.members.julyDaxiong.desc',
        dream: 'team.members.julyDaxiong.dream',
      },
      { name: '七月Joshua Xue', avatarKey: '七月Joshua Xue.png', desc: 'team.members.julyJoshua.desc' },
      {
        name: '七月',
        avatarKey: '七月.png',
        desc: 'team.members.julyPlain.desc',
        dream: 'team.members.julyPlain.dream',
        quote: 'team.members.julyPlain.quote',
      },
    ],
  },
  science: {
    label: 'team.subGroups.projScience.label',
    desc: 'team.subGroups.projScience.desc',
    members: [],
  },
};

/** 已离开或失联成员 */
export const alumniMembers: Member[] = [
  { name: '七月逗', avatarKey: '七月逗.png', role: 'team.roles.groupLeader' },
  { name: '七月喵', avatarKey: '七月喵.jpg', role: 'team.roles.groupLeader' },
  { name: '七月丫', role: 'team.roles.groupLeader' },
  { name: 'Spica', role: 'team.roles.generalMember' },
  { name: '七月烧', avatarKey: '七月烧.jpg', role: 'team.roles.affairsSupervisor' },
  { name: '七月凡', avatarKey: '七月凡.png', role: 'team.roles.generalMember' },
  { name: '七月Toy', avatarKey: '七月Toy.png', role: 'team.roles.specialist' },
  { name: '七月希', avatarKey: '七月希.jpg', role: 'team.roles.generalMember' },
  { name: '七月钗', avatarKey: '七月钗.jpg', role: 'team.roles.generalMember' },
  { name: '七月铝', avatarKey: '七月铝.jpg', role: 'team.roles.specialistAdvisor' },
  { name: '七月雨', role: 'team.roles.generalMember' },
  { name: '七月九', avatarKey: '七月九.jpg', role: 'team.roles.affairsGroupLeader' },
  { name: '本群最弱玩家', avatarKey: '本群最弱玩家.jpg', role: 'team.roles.level18Admin' },
  { name: '道德同志', avatarKey: '道德同志.jpg', role: 'team.roles.level18Admin' },
  { name: 'L.I', avatarKey: 'L.I.jpg', role: 'team.roles.level18Admin' },
  { name: '面条', avatarKey: '面条.jpg', role: 'team.roles.level18Admin' },
  { name: '源泉', avatarKey: '源泉.jpg', role: 'team.roles.level18Admin' },
  { name: '无逸', avatarKey: '无逸.png', role: 'team.roles.level18Admin' },
  { name: '七月湦', avatarKey: '七月湦.jpg', role: 'team.roles.level18Admin' },
  { name: '观澜千代', avatarKey: '观澜千代.jpg', role: 'team.roles.infoGroupAdmin' },
  { name: '七月上', avatarKey: '七月上.jpg', role: 'team.roles.affairsMember' },
  { name: '海豹', avatarKey: '海豹.jpg', role: 'team.roles.affairsMember' },
  { name: '七月悠', avatarKey: '七月悠.jpg', role: 'team.roles.groupLeader' },
  { name: '七月糊-又', avatarKey: '七月糊-又.jpg', role: 'team.roles.generalSpecialist' },
  { name: '七月哔', avatarKey: '七月哔.jpg', role: 'team.roles.advisorMember' },
  { name: '乾坤胤', avatarKey: '乾坤胤.jpg', role: 'team.roles.advisorMember' },
  { name: 'Ryan', role: 'team.roles.advisorMember' },
];
