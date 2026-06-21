import type { DailyDrawRecord } from '../types/fortune'

const historyKey = 'fate-draw-history-v1'

export function readHistory(): DailyDrawRecord[] {
  const raw = window.localStorage.getItem(historyKey)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as DailyDrawRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDailyRecord(record: DailyDrawRecord): DailyDrawRecord[] {
  const history = readHistory()
  const nextHistory = [record, ...history.filter((item) => item.dateKey !== record.dateKey)].slice(0, 30)

  window.localStorage.setItem(historyKey, JSON.stringify(nextHistory))

  return nextHistory
}

export function findRecordByDate(dateKey: string): DailyDrawRecord | undefined {
  return readHistory().find((item) => item.dateKey === dateKey)
}
