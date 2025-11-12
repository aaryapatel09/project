import { describe, it, expect } from 'vitest'
import { calculateTrackMetrics, getDifficultyLabel, getSafetyLabel } from '../trackMetrics'
import { TrackElement } from '../../types/track'

describe('trackMetrics', () => {
  it('calculates metrics for empty track', () => {
    const metrics = calculateTrackMetrics([])
    
    expect(metrics.totalLength).toBe(0)
    expect(metrics.cornerCount).toBe(0)
    expect(metrics.straightCount).toBe(0)
  })

  it('calculates total length correctly', () => {
    const elements: TrackElement[] = [
      {
        id: '1',
        type: 'straight',
        x: 0,
        y: 0,
        length: 500,
        width: 15,
        banking: 0,
        elevation: 0,
        isDRS: false,
        sectorNumber: null,
      },
      {
        id: '2',
        type: 'corner-left',
        x: 0,
        y: 100,
        length: 200,
        width: 15,
        banking: 10,
        elevation: 5,
        isDRS: false,
        sectorNumber: null,
      },
    ]

    const metrics = calculateTrackMetrics(elements)
    
    expect(metrics.totalLength).toBe(700)
    expect(metrics.cornerCount).toBe(1)
    expect(metrics.straightCount).toBe(1)
  })

  it('counts DRS zones correctly', () => {
    const elements: TrackElement[] = [
      {
        id: '1',
        type: 'straight',
        x: 0,
        y: 0,
        length: 500,
        width: 15,
        banking: 0,
        elevation: 0,
        isDRS: true,
        sectorNumber: null,
      },
      {
        id: '2',
        type: 'straight',
        x: 0,
        y: 100,
        length: 300,
        width: 15,
        banking: 0,
        elevation: 0,
        isDRS: true,
        sectorNumber: null,
      },
    ]

    const metrics = calculateTrackMetrics(elements)
    expect(metrics.drsZoneCount).toBe(2)
  })

  it('calculates difficulty labels correctly', () => {
    expect(getDifficultyLabel(20)).toBe('Easy')
    expect(getDifficultyLabel(40)).toBe('Medium')
    expect(getDifficultyLabel(60)).toBe('Hard')
    expect(getDifficultyLabel(80)).toBe('Extreme')
  })

  it('calculates safety labels correctly', () => {
    expect(getSafetyLabel(90)).toBe('Very Safe')
    expect(getSafetyLabel(70)).toBe('Safe')
    expect(getSafetyLabel(50)).toBe('Moderate')
    expect(getSafetyLabel(30)).toBe('Risky')
    expect(getSafetyLabel(10)).toBe('Dangerous')
  })
})

