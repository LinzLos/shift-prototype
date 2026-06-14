import { useState } from 'react'
import RosterModal from '../components/RosterModal'

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

// ─── Icons ────────────────────────────────────────────────────────────────────

function CaretDownIcon({ color }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke={color ?? css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SortAscIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M5 2L2.5 4.5M5 2L7.5 4.5" stroke={css.textTertiary} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ColumnsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="2" width="4" height="8" rx="1" stroke={css.textTertiary} strokeWidth="1.1" />
      <rect x="7" y="2" width="4" height="8" rx="1" stroke={css.textTertiary} strokeWidth="1.1" />
    </svg>
  )
}


// ─── Header Bar ───────────────────────────────────────────────────────────────

const TIME_TABS = ['Real Time', '1d', 'Week', 'Month', 'Custom']

function HeaderBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
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
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: css.surface,
          border: `0.8px solid ${css.border}`,
          borderRadius: 6,
          padding: '4px 10px',
          cursor: 'pointer',
          fontFamily: font.heading,
          fontSize: 16,
          fontWeight: 600,
          color: css.textTertiary,
        }}>
          Refinance
          <CaretDownIcon />
        </button>
      </div>

      <div style={{ display: 'flex', height: 38 }}>
        {TIME_TABS.map((tab, i) => {
          const isActive = tab === activeTab
          const isFirst = i === 0
          const isLast = i === TIME_TABS.length - 1
          return (
            <div
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                background: isActive ? css.brand : css.surface,
                borderTop: `0.8px solid ${css.border}`,
                borderBottom: `0.8px solid ${css.border}`,
                borderLeft: isFirst ? `0.8px solid ${css.border}` : 'none',
                borderRight: `0.8px solid ${css.border}`,
                borderRadius: isFirst ? '4px 0 0 4px' : isLast ? '0 4px 4px 0' : 0,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontFamily: font.body,
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? css.surface : css.textTertiary,
                whiteSpace: 'nowrap',
              }}>
                {tab}
              </span>
              {isLast && <CaretDownIcon color={css.textTertiary} />}
            </div>
          )
        })}
      </div>
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

function QueueLoadBar({ loans }: { loans: number }) {
  const fillPct = Math.min((loans / 160) * 100, 100)
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

// ─── Assigned Queue Dropdown ──────────────────────────────────────────────────

function AssignedQueueDrop({ queue }: { queue: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: css.surfacePage,
      borderRadius: 100,
      paddingLeft: 12,
      paddingRight: 4,
      height: 24,
      cursor: 'pointer',
    }}>
      <span style={{
        fontFamily: font.body,
        fontSize: 9,
        fontWeight: 700,
        color: css.textSecondary,
        letterSpacing: '0.45px',
        whiteSpace: 'nowrap',
      }}>
        {queue}
      </span>
      <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CaretDownIcon />
      </div>
    </div>
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

// ─── Table Data ───────────────────────────────────────────────────────────────

type Specialist = {
  name: string
  days: number
  loans: number
  assignedQueue: string
  trainedQueues: string[]
}

const specialists: Specialist[] = [
  { name: 'Simone Adeyemi', days: 3,  loans: 148, assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Purchase agreement', 'Priority escalation'] },
  { name: 'Theo Bateman',   days: 5,  loans: 141, assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Employment verification'] },
  { name: 'Steph Curry',    days: 10, loans: 82,  assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Title & Settlement', 'Condo Eligibility'] },
  { name: 'Draymond Green', days: 12, loans: 31,  assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Payoff'] },
  { name: 'Jordan Marks',   days: 18, loans: 27,  assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Broker'] },
  { name: 'Chris Navarro',  days: 7,  loans: 76,  assignedQueue: 'Refinance',              trainedQueues: ['Refinance', 'Purchase agreement'] },
  { name: 'Priya Okonkwo',  days: 22, loans: 91,  assignedQueue: 'Employment verification', trainedQueues: ['Employment verification', 'Refinance'] },
  { name: 'Yemi Osei',      days: 9,  loans: 64,  assignedQueue: 'Employment verification', trainedQueues: ['Employment verification', 'Refinance'] },
  { name: 'Dana Reyes',     days: 25, loans: 80,  assignedQueue: 'Employment verification', trainedQueues: ['Employment verification', 'Refinance', 'Priority escalation'] },
  { name: 'Marcus Webb',    days: 11, loans: 12,  assignedQueue: 'Employment verification', trainedQueues: ['Employment verification', 'Refinance'] },
]

// ─── Roster Table ─────────────────────────────────────────────────────────────

function RosterTable({
  activeTab,
  onApplyTransfer,
}: {
  activeTab: string
  onApplyTransfer: () => void
}) {
  const isRealTime = activeTab === 'Real Time'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: font.body,
            fontSize: 13,
            fontWeight: 500,
            color: css.textSecondary,
          }}>
            6 specialists assigned to Refinance, 4 trained
          </span>
          {/* Move Specialists pill */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'var(--info-light)',
            border: '1px solid #afbcd0',
            borderRadius: 100,
            padding: '0 8px',
            height: 23,
            fontFamily: font.body,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--info)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>
            Move Specialists
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRealTime && (
            <button
              onClick={onApplyTransfer}
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
              Apply Transfer
            </button>
          )}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: css.surfaceMuted,
            border: `0.8px solid ${css.border}`,
            borderRadius: 6,
            padding: '6px 10px',
            cursor: 'pointer',
            fontFamily: font.body,
            fontSize: 11,
            color: css.textSecondary,
          }}>
            <ColumnsIcon />
            Columns
          </button>
        </div>
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
        <div style={{ flex: '0 0 180px', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={thStyle}>Specialist</span>
          <SortAscIcon />
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
      {specialists.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 22px',
            borderBottom: i < specialists.length - 1 ? `1px solid ${css.border}` : 'none',
            background: css.surface,
            gap: 0,
          }}
        >
          <div style={{ flex: '0 0 180px' }}>
            <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: css.textPrimary }}>
              {s.name}
            </span>
          </div>
          <div style={{ flex: '0 0 100px' }}>
            <DaysPill days={s.days} />
          </div>
          <div style={{ flex: '0 0 130px' }}>
            <QueueLoadBar loans={s.loans} />
          </div>
          <div style={{ flex: '0 0 200px' }}>
            <AssignedQueueDrop queue={s.assignedQueue} />
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: css.surfacePage,
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          Showing <strong style={{ color: css.textSecondary }}>10</strong> of <strong style={{ color: css.textSecondary }}>14</strong>
        </span>
        <button style={{
          fontFamily: font.body,
          fontSize: 12,
          fontWeight: 600,
          color: css.brand,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}>
          View all
        </button>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Roster() {
  const [activeTab, setActiveTab] = useState('Real Time')
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar activeTab={activeTab} onTabChange={setActiveTab} />
      <RosterTable activeTab={activeTab} onApplyTransfer={() => setShowModal(true)} />
      {showModal && (
        <RosterModal
          onClose={() => setShowModal(false)}
          onApply={() => console.log('Transfer applied')}
        />
      )}
    </div>
  )
}
