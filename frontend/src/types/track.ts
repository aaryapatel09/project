export type ElementType = 'straight' | 'corner-left' | 'corner-right'

export interface TrackElement {
  id: string
  type: ElementType
  x: number
  y: number
  length: number // meters
  width: number // meters
  banking: number // degrees
  elevation: number // meters
  isDRS: boolean
  sectorNumber: number | null
}

export interface TrackMetrics {
  totalLength: number // meters
  estimatedLapTime: number // seconds
  difficultyScore: number // 0-100
  possibleOvertakes: number
  safetyRating: number // 0-100
  elevationChange: number // meters
  cornerCount: number
  straightCount: number
  drsZoneCount: number
}

export interface TrackData {
  name: string
  elements: TrackElement[]
  difficulty: string
  laps: number
  metrics: TrackMetrics
}

export interface HistoryState {
  elements: TrackElement[]
  timestamp: number
}

