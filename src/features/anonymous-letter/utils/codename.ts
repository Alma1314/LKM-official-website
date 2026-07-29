const ADJ = [
  '夜行的',
  '迷路的',
  '温柔的',
  '沉默的',
  '发光的',
  '慵懒的',
  '勇敢的',
  '失眠的',
  '偷心的',
  '漫步的',
  '微醺的',
  '等风的',
];
const NOUN = ['猫', '鲸', '鹿', '信使', '云朵', '旅人', '星星', '小熊', '知更鸟', '月亮', '萤火', '风铃'];

export function randomCodename(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const n = NOUN[Math.floor(Math.random() * NOUN.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${a}${n}${num}`;
}
