export type FortuneLuck = 'upper' | 'middle' | 'lower'

export interface Fortune {
  id: number
  signNumber: string
  tier: '上上签' | '上签' | '中签' | '下签'
  luck: FortuneLuck
  poem: [string, string, string, string]
  interpretation: string
  suitable: string[]
  avoid: string[]
  tags: string[]
  aura: string
}

export interface DailyDrawRecord {
  dateKey: string
  fortuneId: number
  drawnAt: string
}
