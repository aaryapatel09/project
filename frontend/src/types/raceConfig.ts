export interface DriverConfig {
  name: string
  skill: number
  aggression: number
  tireStrategy: 'conservative' | 'balanced' | 'aggressive'
  pitStrategy: 'one-stop' | 'two-stop' | 'three-stop' | 'adaptive'
  riskLevel: 'safe' | 'normal' | 'risky'
  undercut: boolean
  preferredTire: 'soft' | 'medium' | 'hard'
}

export interface WeatherProfile {
  startCondition: 'dry' | 'rain'
  changeChance: number
  rainIntensity: 'light' | 'medium' | 'heavy'
}

export interface RaceScenario {
  trackName: string
  drivers: DriverConfig[]
  weather: WeatherProfile
  safetyCarProb: number
  enableDRS: boolean
  enableVSC: boolean
}

export interface LapData {
  lap: number
  positions: { [driver: string]: number }
  gaps: { [driver: string]: number }
  times: { [driver: string]: number }
  events: RaceEvent[]
}

export interface RaceEvent {
  lap: number
  type: 'pit' | 'overtake' | 'incident' | 'safety_car' | 'weather' | 'fastest_lap'
  driver?: string
  description: string
  icon: string
  color: string
}

export interface Highlight {
  lap: number
  event: RaceEvent
  importance: number
}

