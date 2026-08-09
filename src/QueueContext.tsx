import { createContext, useContext, useState } from 'react'
import type { ConditionData } from './data/simulation'

type MonitorPrefs = { activeTab: string; customLabel: string | null }

// A saved Simulation scenario — kept per queue so drilling into Loans (or any
// navigation) and coming back never destroys the user's in-progress work.
// 'running' is deliberately not a persisted phase; a run in flight resumes as
// its result.
export type SimScenario = {
  conditions: ConditionData[]
  phase: 'build' | 'results'
  saved: boolean
  applied: boolean
}

export const EMPTY_SCENARIO: SimScenario = { conditions: [], phase: 'build', saved: false, applied: false }

type QueueContextType = {
  // Global "queue in focus" shared by Simulation, Performance, and Roster so
  // picking a queue on Overview / Queue Monitor keeps every other surface
  // scoped to the same one. Loans keeps route-state for drill-down semantics
  // but syncs this on mount.
  selectedQueue: string
  setSelectedQueue: (queue: string) => void
  actioned: string[]
  markActioned: (queue: string) => void
  // Reassignment ledger: specialist name → the queue they've been moved to
  // this session. One ledger drives every surface, so a transfer increments
  // exactly its target queue and decrements exactly its source.
  reassignments: Record<string, string>
  applyTransfer: (names: string[], target: string) => void
  // Queue Monitor view state (time range) per queue — leaving and coming back
  // must not silently reset the user's selection.
  monitorPrefs: Record<string, MonitorPrefs>
  setMonitorPrefs: (queue: string, prefs: MonitorPrefs) => void
  // Simulation scenarios per queue — same reversible-nav guarantee as
  // monitorPrefs: a drill-down out of Simulation must not lose the scenario.
  simScenarios: Record<string, SimScenario>
  setSimScenario: (queue: string, scenario: SimScenario) => void
}

const QueueContext = createContext<QueueContextType>({
  selectedQueue: 'Refinance',
  setSelectedQueue: () => {},
  actioned: [],
  markActioned: () => {},
  reassignments: {},
  applyTransfer: () => {},
  monitorPrefs: {},
  setMonitorPrefs: () => {},
  simScenarios: {},
  setSimScenario: () => {},
})

/** Names transferred INTO `queue` this session, per the ledger. */
export function transfersInto(queue: string, reassignments: Record<string, string>): string[] {
  return Object.entries(reassignments)
    .filter(([, target]) => target === queue)
    .map(([name]) => name)
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [selectedQueue, setSelectedQueue] = useState<string>('Refinance')
  const [actioned, setActioned] = useState<string[]>([])
  const [reassignments, setReassignments] = useState<Record<string, string>>({})
  const [monitorPrefs, setMonitorPrefsState] = useState<Record<string, MonitorPrefs>>({})
  const [simScenarios, setSimScenarios] = useState<Record<string, SimScenario>>({})

  function markActioned(queue: string) {
    setActioned(prev => prev.includes(queue) ? prev : [...prev, queue])
  }
  function applyTransfer(names: string[], target: string) {
    setReassignments(prev => {
      const next = { ...prev }
      for (const n of names) next[n] = target
      return next
    })
  }
  function setMonitorPrefs(queue: string, prefs: MonitorPrefs) {
    setMonitorPrefsState(prev => ({ ...prev, [queue]: prefs }))
  }
  function setSimScenario(queue: string, scenario: SimScenario) {
    setSimScenarios(prev => ({ ...prev, [queue]: scenario }))
  }

  return (
    <QueueContext.Provider value={{
      selectedQueue, setSelectedQueue,
      actioned, markActioned,
      reassignments, applyTransfer,
      monitorPrefs, setMonitorPrefs,
      simScenarios, setSimScenario,
    }}>
      {children}
    </QueueContext.Provider>
  )
}

export function useQueueContext() { return useContext(QueueContext) }
