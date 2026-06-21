import type { Fortune, FortuneLuck } from '../types/fortune'

const upperCount = 32
const middleCount = 54
const lowerCount = 22

const lineStarters = [
  '晨钟穿雾照',
  '星火浮金映',
  '古殿微风起',
  '云纹开月色',
  '松影临幽径',
  '玉阶承露冷',
  '远岫摇清魄',
  '流光凝旧梦',
  '灯焰行深廊',
  '檐铃和夜雨',
  '残霞沉石壁',
  '长阶迎晓色',
]

const lineEndings = [
  '青阶',
  '玄坛',
  '金阙',
  '灵台',
  '远山',
  '流泉',
  '寒潭',
  '星河',
  '古碑',
  '尘寰',
  '归舟',
  '天关',
]

const lineMiddles = [
  '静候良机',
  '自有回响',
  '终逢明路',
  '照见初心',
  '可定前程',
  '慢启新章',
  '暗藏转机',
  '渐近佳音',
  '终闻捷报',
  '可得相助',
  '自成华彩',
  '终破迷障',
]

const upperInterpretations = [
  '此签气势明朗，说明你正站在运势抬升的节点，主动出击比等待更容易得到回应。',
  '此签主贵人与契机并行，近期适合把握窗口，把之前犹豫不决的计划向前推进。',
  '此签象征心愿渐成，外界资源开始向你汇聚，越真诚越容易得到支持。',
  '此签寓意顺势而为，今日若能稳住节奏、抓住重点，成果会比预期更好。',
]

const middleInterpretations = [
  '此签主平稳向前，运势并非骤然大开，但脚下每一步都在积累未来的确定性。',
  '此签提醒你放慢判断，很多答案正在靠近，耐心处理细节会带来更好的结果。',
  '此签说明局势处于整理阶段，不宜冒进，适合夯实基础、等待更清晰的信号。',
  '此签寓意稳中有进，今天更适合做长期有益的事，回报会在之后逐步显现。',
]

const lowerInterpretations = [
  '此签并非纯凶，而是提醒你减少硬碰硬的选择，先守住节奏，再寻下一步转机。',
  '此签提示情绪与环境都略显紊乱，越是急于求成，越容易让小问题放大。',
  '此签意味着外部阻力偏多，今日宜收敛锋芒，把重要决定延后到状态更稳的时候。',
  '此签强调谨慎自持，短暂退一步并不损失格局，反而能为后续留出余地。',
]

const auraByLuck: Record<FortuneLuck, string[]> = {
  upper: ['金辉盈阶', '星辉垂照', '瑞气临门', '长风送喜'],
  middle: ['月华微澜', '雾灯静明', '松影含光', '云路初开'],
  lower: ['暮鼓警心', '风雪压枝', '寒灯守夜', '潮声示警'],
}

const suitablePool = [
  '出行',
  '签约',
  '会友',
  '复盘',
  '表白',
  '投递',
  '学习',
  '整理',
  '创作',
  '沟通',
  '运动',
  '断舍离',
]

const avoidPool = [
  '争执',
  '冲动消费',
  '情绪决策',
  '熬夜',
  '拖延',
  '冒险投资',
  '仓促表态',
  '强行推进',
  '钻牛角尖',
  '临时改约',
  '过度许诺',
  '自我怀疑',
]

const tagPoolByLuck: Record<FortuneLuck, string[]> = {
  upper: ['#好运', '#贵人', '#事业上升', '#心想事成', '#顺风局', '#开门红'],
  middle: ['#稳步推进', '#静待佳音', '#先整后发', '#耐心加成', '#节奏为先', '#守正出新'],
  lower: ['#谨慎行事', '#先守后攻', '#情绪管理', '#避免硬碰', '#慢就是快', '#保留余地'],
}

function getLuck(index: number): FortuneLuck {
  if (index < upperCount) {
    return 'upper'
  }

  if (index < upperCount + middleCount) {
    return 'middle'
  }

  return 'lower'
}

function getTier(luck: FortuneLuck, index: number): Fortune['tier'] {
  if (luck === 'upper') {
    return index % 5 === 0 ? '上上签' : '上签'
  }

  if (luck === 'middle') {
    return '中签'
  }

  return '下签'
}

function padSignNumber(index: number): string {
  return `第${String(index + 1).padStart(3, '0')}签`
}

function buildPoem(index: number): Fortune['poem'] {
  const a = lineStarters[index % lineStarters.length]
  const b = lineEndings[(index * 3) % lineEndings.length]
  const c = lineStarters[(index + 5) % lineStarters.length]
  const d = lineMiddles[(index * 5) % lineMiddles.length]
  const e = lineStarters[(index + 8) % lineStarters.length]
  const f = lineEndings[(index * 7 + 2) % lineEndings.length]
  const g = lineStarters[(index + 2) % lineStarters.length]
  const h = lineMiddles[(index * 11 + 1) % lineMiddles.length]

  return [
    `${a}${b}`,
    `${c}${d}`,
    `${e}${f}`,
    `${g}${h}`,
  ]
}

function pickThree(pool: string[], seed: number): string[] {
  return [0, 1, 2].map((offset) => pool[(seed + offset * 3) % pool.length])
}

function buildInterpretation(index: number, luck: FortuneLuck): string {
  const interpretationPool =
    luck === 'upper'
      ? upperInterpretations
      : luck === 'middle'
        ? middleInterpretations
        : lowerInterpretations

  const actionHint =
    luck === 'upper'
      ? '今日适合把握主动权，让行动先于迟疑。'
      : luck === 'middle'
        ? '今日更适合稳住节奏，把有限精力用在最重要的事情上。'
        : '今日宜先做减法，避开无谓消耗，比强行突破更有价值。'

  return `${interpretationPool[index % interpretationPool.length]}${actionHint}`
}

function buildFortune(index: number): Fortune {
  const luck = getLuck(index)
  const tags = pickThree(tagPoolByLuck[luck], index)

  return {
    id: index + 1,
    signNumber: padSignNumber(index),
    tier: getTier(luck, index),
    luck,
    poem: buildPoem(index),
    interpretation: buildInterpretation(index, luck),
    suitable: pickThree(suitablePool, index),
    avoid: pickThree(avoidPool, index + 1),
    tags,
    aura: auraByLuck[luck][index % auraByLuck[luck].length],
  }
}

export const fortunes: Fortune[] = Array.from(
  { length: upperCount + middleCount + lowerCount },
  (_, index) => buildFortune(index),
)
