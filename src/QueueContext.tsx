import { createContext, useContext, useState } from 'react'

type QueueContextType = {
  actioned: string[]
  markActioned: (queue: string) => void
}

const QueueContext = createContext<QueueContextType>({ actioned: [], markActioned: () => {} })

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [actioned, setActioned] = useState<string[]>([])
  function markActioned(queue: string) {
    setActioned(prev => prev.includes(queue) ? prev : [...prev, queue])
  }
  return <QueueContext.Provider value={{ actioned, markActioned }}>{children}</QueueContext.Provider>
}

export function useQueueContext() { return useContext(QueueContext) }
