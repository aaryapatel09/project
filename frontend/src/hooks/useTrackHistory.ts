import { useState, useCallback } from 'react'
import { TrackElement, HistoryState } from '../types/track'

export function useTrackHistory(initialElements: TrackElement[] = []) {
  const [history, setHistory] = useState<HistoryState[]>([
    { elements: initialElements, timestamp: Date.now() },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  const addToHistory = useCallback((elements: TrackElement[]) => {
    setHistory((prev) => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1)
      // Add new state
      newHistory.push({ elements: JSON.parse(JSON.stringify(elements)), timestamp: Date.now() })
      // Limit history to last 50 states
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setCurrentIndex((prev) => Math.min(prev + 1, 49))
  }, [currentIndex])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1].elements
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1].elements
    }
    return null
  }, [currentIndex, history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1
  const currentElements = history[currentIndex]?.elements || []

  const reset = useCallback((newElements: TrackElement[]) => {
    setHistory([{ elements: newElements, timestamp: Date.now() }])
    setCurrentIndex(0)
  }, [])

  return {
    currentElements,
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  }
}

