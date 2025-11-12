import { TrackElement, TrackMetrics } from '../types/track'

export function calculateTrackMetrics(elements: TrackElement[]): TrackMetrics {
  if (elements.length === 0) {
    return {
      totalLength: 0,
      estimatedLapTime: 0,
      difficultyScore: 0,
      possibleOvertakes: 0,
      safetyRating: 100,
      elevationChange: 0,
      cornerCount: 0,
      straightCount: 0,
      drsZoneCount: 0,
    }
  }

  // Calculate total length
  const totalLength = elements.reduce((sum, el) => sum + el.length, 0)

  // Count element types
  const cornerCount = elements.filter((el) =>
    el.type.includes('corner')
  ).length
  const straightCount = elements.filter((el) => el.type === 'straight').length
  const drsZoneCount = elements.filter((el) => el.isDRS).length

  // Calculate elevation change
  const elevations = elements.map((el) => el.elevation)
  const maxElevation = Math.max(...elevations, 0)
  const minElevation = Math.min(...elevations, 0)
  const elevationChange = maxElevation - minElevation

  // Estimate lap time (simplified formula)
  // Base time: 1 second per 50 meters on straights
  // Corners add time based on banking and length
  let estimatedLapTime = 0
  elements.forEach((el) => {
    if (el.type === 'straight') {
      estimatedLapTime += el.length / 50 // 50 m/s average on straights
      if (el.isDRS) {
        estimatedLapTime -= el.length / 70 // DRS bonus
      }
    } else {
      // Corners: base time + banking reduction
      const cornerTime = el.length / 30 // 30 m/s in corners
      const bankingReduction = el.banking * 0.01 // 1% reduction per degree
      estimatedLapTime += cornerTime * (1 - bankingReduction)
    }
    // Elevation penalty/bonus
    estimatedLapTime += Math.abs(el.elevation) * 0.05
  })

  // Calculate difficulty score (0-100)
  let difficultyScore = 0
  difficultyScore += cornerCount * 2 // Corners add difficulty
  difficultyScore += (elevationChange / 10) * 3 // Elevation adds difficulty
  difficultyScore += (totalLength / 1000) * 1 // Length adds difficulty
  difficultyScore -= drsZoneCount * 2 // DRS reduces difficulty
  difficultyScore = Math.min(100, Math.max(0, difficultyScore))

  // Calculate possible overtakes
  // Long straights + DRS zones + low-banking corners
  let possibleOvertakes = 0
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const nextEl = elements[(i + 1) % elements.length]

    // Straight followed by corner = overtaking opportunity
    if (el.type === 'straight' && nextEl.type.includes('corner')) {
      if (el.length > 300) possibleOvertakes += 1
      if (el.isDRS) possibleOvertakes += 1
    }

    // Low banking corners are easier to overtake in
    if (el.type.includes('corner') && el.banking < 5) {
      possibleOvertakes += 0.5
    }
  }
  possibleOvertakes = Math.round(possibleOvertakes)

  // Calculate safety rating (0-100)
  let safetyRating = 100
  elements.forEach((el) => {
    // High-speed corners reduce safety
    if (el.type.includes('corner') && el.length > 200) {
      safetyRating -= 5
    }
    // Low banking in fast corners reduces safety
    if (el.type.includes('corner') && el.banking < 3) {
      safetyRating -= 3
    }
    // Steep elevation changes reduce safety
    if (Math.abs(el.elevation) > 20) {
      safetyRating -= 4
    }
  })
  safetyRating = Math.min(100, Math.max(0, safetyRating))

  return {
    totalLength: Math.round(totalLength),
    estimatedLapTime: Math.round(estimatedLapTime * 10) / 10,
    difficultyScore: Math.round(difficultyScore),
    possibleOvertakes,
    safetyRating: Math.round(safetyRating),
    elevationChange: Math.round(elevationChange),
    cornerCount,
    straightCount,
    drsZoneCount,
  }
}

export function getDifficultyLabel(score: number): string {
  if (score < 25) return 'Easy'
  if (score < 50) return 'Medium'
  if (score < 75) return 'Hard'
  return 'Extreme'
}

export function getSafetyLabel(rating: number): string {
  if (rating >= 80) return 'Very Safe'
  if (rating >= 60) return 'Safe'
  if (rating >= 40) return 'Moderate'
  if (rating >= 20) return 'Risky'
  return 'Dangerous'
}

