import { createContext, useContext, useState } from 'react'

type MonitorPrefs = { activeTab: string; customLabel: string | null }

type QueueContextType = {
  // Global "queue in focus" shared by Simulation, Performance, and Roster so
  // picking a queue on Overview / Queue Monitor keeps every other surface
  // scoped to the same one. Loans keeps route-state for drill-down semantics
  // but syncs this on mount.
  selectedQueue: string
  setSelectedQueue: (queue: string) => void
  actioned: string[]
  markActioned: (queue: string) => void
  // Names moved into Refinance via the reassign flow — global, so the transfer
  // survives navigation and shows up on every surface (Capacity, Roster, modal).
  transfers: string[]
  applyTransfer: (names: string[]) => void
  // Queue Monitor view state (time range) per queue — leaving and coming back
  // must not silently reset the user's selection.
  monitorPrefs: Record<string, MonitorPrefs>
  setMonitorPrefs: (queue: string, prefs: MonitorPrefs) => void
}

const QueueContext = createContext<QueueContextType>({
  selectedQueue: 'Refinance',
  setSelectedQueue: () => {},
  actioned: [],
  markActioned: () => {},
  transfers: [],
  applyTransfer: () => {},
  monitorPrefs: {},
  setMonitorPrefs: () => {},
})

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [selectedQueue, setSelectedQueue] = useState<string>('Refinance')
  const [actioned, setActioned] = useState<string[]>([])
  const [transfers, setTransfers] = useState<string[]>([])
  const [monitorPrefs, setMonitorPrefsState] = useState<Record<string, MonitorPrefs>>({})

  function markActioned(queue: string) {
    setActioned(prev => prev.includes(queue) ? prev : [...prev, queue])
  }
  function applyTransfer(names: string[]) {
    setTransfers(prev => [...prev, ...names.filter(n => !prev.includes(n))])
  }
  function setMonitorPrefs(queue: string, prefs: MonitorPrefs) {
    setMonitorPrefsState(prev => ({ ...prev, [queue]: prefs }))
  }

  return (
    <QueueContext.Provider value={{ selectedQueue, setSelectedQueue, actioned, markActioned, transfers, applyTransfer, monitorPrefs, setMonitorPrefs }}>
      {children}
    </QueueContext.Provider>
  )
}

export function useQueueContext() { return useContext(QueueContext) }
