import { describe, it, expect, beforeEach } from 'vitest'
import { useExcuseStore } from '../../store/useExcuseStore'

describe('useExcuseStore', () => {
  beforeEach(() => {
    useExcuseStore.setState({
      category: null,
      urgency: 'normal',
      context: '',
      excuses: [],
      isLoading: false,
      error: null,
      tokensRemaining: -1,
    })
  })

  it('has correct initial state', () => {
    const state = useExcuseStore.getState()
    expect(state.category).toBeNull()
    expect(state.urgency).toBe('normal')
    expect(state.context).toBe('')
    expect(state.excuses).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('setCategory updates category', () => {
    useExcuseStore.getState().setCategory('late')
    expect(useExcuseStore.getState().category).toBe('late')
  })

  it('setCategory clears excuses', () => {
    useExcuseStore.setState({ excuses: [{ text: 'test', tone: 'test', tip: 'test' }] })
    useExcuseStore.getState().setCategory('forgot')
    expect(useExcuseStore.getState().excuses).toEqual([])
  })

  it('setCategory clears error', () => {
    useExcuseStore.setState({ error: 'Some error' })
    useExcuseStore.getState().setCategory('deadline')
    expect(useExcuseStore.getState().error).toBeNull()
  })

  it('setUrgency updates urgency', () => {
    useExcuseStore.getState().setUrgency('extreme')
    expect(useExcuseStore.getState().urgency).toBe('extreme')
  })

  it('setContext updates context', () => {
    useExcuseStore.getState().setContext('Traffic was bad')
    expect(useExcuseStore.getState().context).toBe('Traffic was bad')
  })

  it('setExcuses updates excuses and tokensRemaining', () => {
    const excuses = [
      { text: 'Excuse 1', tone: 'sincere', tip: 'Tip 1' },
      { text: 'Excuse 2', tone: 'dramatic', tip: 'Tip 2' },
    ]
    useExcuseStore.getState().setExcuses(excuses, 5)
    
    expect(useExcuseStore.getState().excuses).toEqual(excuses)
    expect(useExcuseStore.getState().tokensRemaining).toBe(5)
  })

  it('setExcuses clears loading and error', () => {
    useExcuseStore.setState({ isLoading: true, error: 'Error' })
    useExcuseStore.getState().setExcuses([], 0)
    
    expect(useExcuseStore.getState().isLoading).toBe(false)
    expect(useExcuseStore.getState().error).toBeNull()
  })

  it('setLoading updates isLoading', () => {
    useExcuseStore.getState().setLoading(true)
    expect(useExcuseStore.getState().isLoading).toBe(true)
  })

  it('setLoading clears error', () => {
    useExcuseStore.setState({ error: 'Error' })
    useExcuseStore.getState().setLoading(true)
    expect(useExcuseStore.getState().error).toBeNull()
  })

  it('setError updates error', () => {
    useExcuseStore.getState().setError('Network error')
    expect(useExcuseStore.getState().error).toBe('Network error')
  })

  it('setError clears loading', () => {
    useExcuseStore.setState({ isLoading: true })
    useExcuseStore.getState().setError('Error')
    expect(useExcuseStore.getState().isLoading).toBe(false)
  })

  it('reset clears all state', () => {
    useExcuseStore.setState({
      category: 'late',
      urgency: 'extreme',
      context: 'Some context',
      excuses: [{ text: 'test', tone: 'test', tip: 'test' }],
      isLoading: true,
      error: 'Error',
    })
    
    useExcuseStore.getState().reset()
    
    const state = useExcuseStore.getState()
    expect(state.category).toBeNull()
    expect(state.urgency).toBe('normal')
    expect(state.context).toBe('')
    expect(state.excuses).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })
})
