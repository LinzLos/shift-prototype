import { useState } from 'react'
import RosterModal from '../components/RosterModal'
import Toast from '../components/Toast'
import LiveIndicator from '../components/LiveIndicator'
import { useQueueContext } from '../QueueContext'
import { getWorkloads } from '../data/queues'
import { team, type TeamMember } from '../data/team'

const css = {
  brand: 'var(--brand)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--info)',
  surface: 'var(--surface)',
  surfacePage: 'var(--surface-page)',
  surfaceMuted: 'var(--surface-muted)',
  border: 'var(--border)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textTertiary: 'var(--text-tertiary)',
}

const font = {
  heading: "'Bricolage Grotesque', sans-serif",
  body: "'DM Sans', sans-serif",
}

// ─── Header Bar ───────────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <div style={{
      background: css.surfacePage,
      border: `1px solid ${css.border}`,
      borderRadius: 10,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{
          fontFamily: font.heading,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: '-0.08px',
          color: css.textPrimary,
          margin: 0,
        }}>
          Roster
        </h1>
        {/* Queue scope label — the roster is Refinance-scoped in this prototype */}
        <span style={{
          fontFamily: font.heading,
          fontSize: 16,
          fontWeight: 600,
          color: css.textTertiary,
        }}>
          Refinance
        </span>
      </div>

      {/* Assignments are live state — historical rosters aren't kept here */}
      <LiveIndicator tooltipBody={<>Assignments reflect current state. Use <strong style={{ color: css.textPrimary }}>Queue Monitor</strong> for historical views.</>} />
    </div>
  )
}

// ─── Status Pill (days) ───────────────────────────────────────────────────────

function DaysPill({ days }: { days: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--warning-light)',
      border: '0.8px solid var(--warning-mid)',
      borderRadius: 6,
      padding: '0 12px',
      height: 20,
      fontFamily: font.body,
      fontSize: 9,
      fontWeight: 700,
      color: 'var(--warning)',
      letterSpacing: '0.45px',
      whiteSpace: 'nowrap',
    }}>
      {days} days
    </span>
  )
}

// ─── Queue Load Bar ───────────────────────────────────────────────────────────

function QueueLoadBar({ loans }: { loans: number | null }) {
  if (loans == null) {
    return (
      <span style={{ fontFamily: font.body, fontSize: 9, fontWeight: 700, color: css.textTertiary, letterSpacing: '0.45px' }}>
        Just assigned
      </span>
    )
  }
  const fillPct = Math.min((loans / 250) * 100, 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 94 }}>
      <span style={{
        fontFamily: font.body,
        fontSize: 9,
        fontWeight: 700,
        color: css.textPrimary,
        letterSpacing: '0.45px',
      }}>
        {loans} loans
      </span>
      <div style={{ position: 'relative', height: 4, borderRadius: 12, background: '#d9d9d9', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: `${fillPct}%`,
          borderRadius: 12,
          background: 'linear-gradient(to right, #bfc7d4, #8195b5)',
        }} />
      </div>
    </div>
  )
}

// ─── Assigned Queue Pill ──────────────────────────────────────────────────────

function AssignedQueuePill({ queue, isNew }: { queue: string; isNew?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: isNew ? 'var(--brand-light)' : css.surfacePage,
      border: isNew ? '0.8px solid var(--brand-mid)' : 'none',
      borderRadius: 100,
      padding: '0 12px',
      height: 24,
      fontFamily: font.body,
      fontSize: 9,
      fontWeight: 700,
      color: isNew ? 'var(--brand-dark)' : css.textSecondary,
      letterSpacing: '0.45px',
      whiteSpace: 'nowrap',
    }}>
      {queue}
      {isNew && <span style={{ letterSpacing: '0.4px' }}>· NEW</span>}
    </span>
  )
}

// ─── Trained Queue Chip ───────────────────────────────────────────────────────

function QueueChip({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--brand-light)',
      border: '0.8px solid var(--brand)',
      borderRadius: 6,
      padding: '0 12px',
      height: 20,
      fontFamily: font.body,
      fontSize: 9,
      fontWeight: 700,
      color: 'var(--brand-dark)',
      letterSpacing: '0.45px',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ─── Roster rows ──────────────────────────────────────────────────────────────

type RosterRow = {
  name: string
  days: number
  loans: number | null
  assignedQueue: string
  trainedQueues: string[]
  isNew: boolean
}

function buildRows(transfers: string[]): RosterRow[] {
  // Scope: everyone assigned to or trained for Refinance.
  const relevant = team.filter((m) => m.assignedQueue === 'Refinance' || m.trainedQueues.includes('Refinance'))
  const loadByName = new Map<string, number>()
  const queuesInvolved = [...new Set(relevant.map((m) => m.assignedQueue))]
  for (const q of queuesInvolved) {
    for (const w of getWorkloads(q)) loadByName.set(`${q}:${w.name}`, w.loans)
  }
  const rows = relevant.map((m: TeamMember): RosterRow => {
    const isNew = transfers.includes(m.name)
    return {
      name: m.name,
      days: isNew ? 0 : m.daysInQueue,
      loans: isNew ? null : loadByName.get(`${m.assignedQueue}:${m.name}`) ?? null,
      assignedQueue: isNew ? 'Refinance' : m.assignedQueue,
      trainedQueues: m.trainedQueues,
      isNew,
    }
  })
  // Refinance-assigned first (new arrivals at the top), then trained-elsewhere.
  return rows.sort((a, b) => {
    if (a.isNew !== b.isNew) return a.isNew ? -1 : 1
    const aRef = a.assignedQueue === 'Refinance'
    const bRef = b.assignedQueue === 'Refinance'
    if (aRef !== bRef) return aRef ? -1 : 1
    return (b.loans ?? 0) - (a.loans ?? 0)
  })
}

// ─── Roster Table ─────────────────────────────────────────────────────────────

function RosterTable({
  rows,
  onMoveSpecialists,
}: {
  rows: RosterRow[]
  onMoveSpecialists: () => void
}) {
  const assignedCount = rows.filter((r) => r.assignedQueue === 'Refinance').length
  const trainedCount = rows.length - assignedCount

  const thStyle: React.CSSProperties = {
    fontFamily: font.body,
    fontSize: 11,
    fontWeight: 600,
    color: css.textTertiary,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  }

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Table toolbar */}
      <div style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${css.border}`,
      }}>
        <span style={{
          fontFamily: font.body,
          fontSize: 13,
          fontWeight: 500,
          color: css.textSecondary,
        }}>
          {assignedCount} specialists assigned to Refinance · {trainedCount} more trained
        </span>

        <button
          onClick={onMoveSpecialists}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: css.brand,
            border: 'none',
            borderRadius: 6,
            padding: '6px 12px',
            cursor: 'pointer',
            fontFamily: font.body,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-inverse)',
            whiteSpace: 'nowrap',
          }}
        >
          Move specialists
        </button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 22px',
        borderBottom: `1px solid ${css.border}`,
        gap: 0,
        background: css.surfacePage,
      }}>
        <div style={{ flex: '0 0 180px' }}>
          <span style={thStyle}>Specialist</span>
        </div>
        <div style={{ flex: '0 0 100px' }}>
          <span style={thStyle}>Status</span>
        </div>
        <div style={{ flex: '0 0 130px' }}>
          <span style={thStyle}>Queue load</span>
        </div>
        <div style={{ flex: '0 0 200px' }}>
          <span style={thStyle}>Assigned Queue</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={thStyle}>Trained Queue</span>
        </div>
      </div>

      {/* Rows */}
      {rows.map((s, i) => (
        <div
          key={s.name}
          className={s.isNew ? 'fade-up' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 22px',
            borderBottom: i < rows.length - 1 ? `1px solid ${css.border}` : 'none',
            background: s.isNew ? 'rgba(98,148,96,0.05)' : css.surface,
            gap: 0,
          }}
        >
          <div style={{ flex: '0 0 180px' }}>
            <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: css.textPrimary }}>
              {s.name}
            </span>
          </div>
          <div style={{ flex: '0 0 100px' }}>
            {s.isNew ? (
              <span style={{ fontFamily: font.body, fontSize: 9, fontWeight: 700, color: 'var(--brand-dark)', letterSpacing: '0.45px' }}>
                Just assigned
              </span>
            ) : (
              <DaysPill days={s.days} />
            )}
          </div>
          <div style={{ flex: '0 0 130px' }}>
            <QueueLoadBar loans={s.loans} />
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <AssignedQueuePill queue={s.assignedQueue} isNew={s.isNew} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {s.trainedQueues.map((q) => (
              <QueueChip key={q} label={q} />
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{
        padding: '12px 22px',
        borderTop: `1px solid ${css.border}`,
        background: css.surfacePage,
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          Showing all <strong style={{ color: css.textSecondary }}>{rows.length}</strong> specialists assigned to or trained for Refinance
        </span>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Roster() {
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { transfers, applyTransfer, markActioned } = useQueueContext()
  const rows = buildRows(transfers)

  function handleApply(count: number, source: string, names: string[]) {
    setShowModal(false)
    applyTransfer(names)
    markActioned('Refinance')
    setToast(`${count} specialist${count !== 1 ? 's' : ''} moved from ${source} to Refinance`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar />
      <RosterTable rows={rows} onMoveSpecialists={() => setShowModal(true)} />
      {showModal && (
        <RosterModal
          target="Refinance"
          onClose={() => setShowModal(false)}
          onApply={handleApply}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
