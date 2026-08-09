import { useEffect, useMemo, useRef, useState } from 'react'
import { queues } from '../data/queues'
import { useQueueContext } from '../QueueContext'

// Shared header queue-switcher used by Queue Monitor / Simulation / Performance /
// Roster. Trigger matches the previous static queue label (Bricolage 600/16px
// tertiary) so the header typography stays consistent; adds a small chevron
// that rotates on open. Popover matches the DatePicker / LiveIndicator visual
// language already used in the app.
//
// Reads `selectedQueue` and calls `setSelectedQueue` from QueueContext directly
// so callers don't need to thread props through their HeaderBar components.
// Overview stays untouched — Overview *is* the queue picker; a dropdown on top
// of the picker screen would be redundant.

const font = {
  heading: "'Bricolage Grotesque', sans-serif",
  body: "'DM Sans', sans-serif",
}

const CATEGORY_ORDER = ['Review', 'Eligibility', 'Closing', 'Fulfillment', 'Exceptions', 'Audit'] as const

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden
      style={{ transition: 'transform 0.15s ease', transform: open ? 'rotate(180deg)' : 'none' }}
    >
      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.5L4.75 8.5L9.5 3.5" stroke="var(--brand)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function QueueSelector() {
  const { selectedQueue, setSelectedQueue } = useQueueContext()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Group queues by category, preserving the tab order Overview uses so users
  // see the same mental model in both places.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof queues>()
    for (const q of queues) {
      const list = map.get(q.category) ?? []
      list.push(q)
      map.set(q.category, list)
    }
    return CATEGORY_ORDER
      .filter((c) => map.has(c))
      .map((c) => ({ category: c, items: map.get(c)! }))
  }, [])

  // Close on outside click / Escape — standard popover behavior.
  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function handlePick(title: string) {
    setSelectedQueue(title)
    setOpen(false)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Switch queue (current: ${selectedQueue})`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: open ? 'var(--surface-muted)' : 'transparent',
          border: 'none', cursor: 'pointer',
          padding: '8px 10px', borderRadius: 6,
          fontFamily: font.heading, fontWeight: 600, fontSize: 16,
          letterSpacing: '-0.048px', color: 'var(--text-tertiary)',
          transition: 'background 0.15s ease',
        }}
      >
        {selectedQueue}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          role="listbox"
          className="filter-enter"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            minWidth: 280, maxHeight: 400,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            overflowY: 'auto',
            zIndex: 300,
            padding: '6px 0',
          }}
        >
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <div style={{
                padding: '10px 14px 4px', fontFamily: font.body, fontSize: 10,
                fontWeight: 600, color: 'var(--text-tertiary)',
                letterSpacing: '0.7px', textTransform: 'uppercase',
              }}>
                {category}
              </div>
              {items.map((q) => {
                const isSelected = q.title === selectedQueue
                return (
                  <button
                    key={q.title}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handlePick(q.title)}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--surface-muted)' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 14px', border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? 'var(--brand-light)' : 'transparent',
                      fontFamily: font.body, fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'var(--brand-dark)' : 'var(--text-primary)',
                      transition: 'background 0.1s ease',
                    }}
                  >
                    <span>{q.title}</span>
                    {isSelected && <CheckIcon />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
