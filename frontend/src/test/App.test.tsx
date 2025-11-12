import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText(/Racing App/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<App />)
    expect(screen.getByText(/Create Track/i)).toBeInTheDocument()
    expect(screen.getByText(/Simulate Race/i)).toBeInTheDocument()
    expect(screen.getByText(/Leaderboard/i)).toBeInTheDocument()
    expect(screen.getByText(/Profile/i)).toBeInTheDocument()
  })
})

