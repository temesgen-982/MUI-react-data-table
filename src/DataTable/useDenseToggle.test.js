import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDenseToggle } from './useDenseToggle.js'

describe('useDenseToggle', () => {
  it('starts with dense disabled', () => {
    const { result } = renderHook(() => useDenseToggle())
    expect(result.current.dense).toBe(false)
  })

  it('toggles dense on', () => {
    const { result } = renderHook(() => useDenseToggle())
    act(() => result.current.toggleDense())
    expect(result.current.dense).toBe(true)
  })

  it('toggles dense back off', () => {
    const { result } = renderHook(() => useDenseToggle())
    act(() => result.current.toggleDense())
    act(() => result.current.toggleDense())
    expect(result.current.dense).toBe(false)
  })
})
