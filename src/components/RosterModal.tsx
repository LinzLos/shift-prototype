import { useState } from 'react'

const css = {
  brand: 'var(--brand)',
  danger: 'var(--danger)',
  warning: 'var(--warning)',
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

// ─── Source queue data ────────────────────────────────────────────────────────

type QueueHealth = 'healthy' | 'warning' | 'at-risk'

type SourceQueue = {
  name: string
  health: QueueHealth
  capacityPct: number   // 0-100, % of capacity used
  eligibleCount: number // trained for Refinance
  specialists: Specialist[]
  suggested: boolean
  suggestReason?: string
  warningReason?: string
}

type Specialist = {
  name: string
  trainedQueues: string[]
}

const sourceQueues: SourceQueue[] = [
  {
    name: 'Employment Verification',
    health: 'healthy',
    capacityPct: 62,
    eligibleCount: 4,
    suggested: true,
    suggestReason: '4 specialists trained for Refinance · Queue at 62% capacity — safe to pull from',
    specialists: [
      { name: 'Theo Bateman',  trainedQueues: ['Refinance', 'Employment Verification'] },
      { name: 'Yemi Osei',     trainedQueues: ['Employment Verification', 'Refinance'] },
      { name: 'Jordan Marks',  trainedQueues: ['Refinance', 'Broker'] },
      { name: 'Priya Okonkwo', trainedQueues: ['Employment Verification', 'Refinance', 'Priority escalation'] },
    ],
  },
  {
    name: 'Purchase Agreement',
    health: 'warning',
    capacityPct: 81,
    eligibleCount: 2,
    suggested: false,
    warningReason: 'Queue at 81% capacity — moving specialists may destabilize this queue',
    specialists: [
      { name: 'Dana Reyes',   trainedQueues: ['Purchase Agreement', 'Refinance'] },
      { name: 'Marcus Webb',  trainedQueues: ['Purchase Agreement', 'Refinance', 'Payoff'] },
    ],
  },
  {
    name: 'Title & Settlement',
    health: 'at-risk',
    capacityPct: 96,
    eligibleCount: 1,
    suggested: false,
    warningReason: 'Queue at 96% capacity — pulling from here is not recommended',
    specialists: [
      { name: 'Steph Curry', trainedQueues: ['Title & Settlement', 'Refinance', 'Condo Eligibility'] },
    ],
  },
  {
    name: 'Payoff',
    health: 'healthy',
    capacityPct: 44,
    eligibleCount: 1,
    suggested: false,
    specialists: [
      { name: 'Ryan Coogler', trainedQueues: ['Payoff', 'Refinance'] },
    ],
  },
]

const currentRefinance = ['Simone Adeyemi', 'Steph Curry', 'Draymond Green', 'Chris Navarro']
const REFINANCE_CURRENT = 14

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#629460" />
      <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12.5" stroke="#629460" strokeWidth="1.5" fill="none" />
      <path d="M16 11V21M11 16H21" stroke="#629460" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function MinusCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#CE430A" opacity="0.12" />
      <circle cx="16" cy="16" r="12.5" stroke="#CE430A" strokeWidth="1" fill="none" />
      <path d="M11 16H21" stroke="#CE430A" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function UserCircleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="12.5" stroke="#8a7e7d" strokeWidth="1" fill="none" />
      <circle cx="16" cy="13" r="3.5" stroke="#8a7e7d" strokeWidth="1.2" fill="none" />
      <path d="M9 24c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#8a7e7d" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function ArrowSmallIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1.5 5H8.5M5.5 2L8.5 5L5.5 8" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="5" cy="5" r="3.5" stroke="var(--text-tertiary)" strokeWidth="1.2" />
      <path d="M8 8L10.5 10.5" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}


function CaretDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 1L7.8 5.2H12L8.6 7.8L9.9 12L6.5 9.4L3.1 12L4.4 7.8L1 5.2H5.2L6.5 1Z" fill="#1b4079" stroke="#1b4079" strokeWidth="0.5" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1.5L12.5 11H1.5L7 1.5Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7 5.5V8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="9.5" r="0.6" fill={color} />
    </svg>
  )
}

// ─── Shared small components ──────────────────────────────────────────────────

function InfoPill({ label }: { label: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#eceff4', border: '1px solid #afbcd0', borderRadius: 100,
      padding: '0 8px', height: 23,
      fontFamily: font.body, fontSize: 12, fontWeight: 700, color: '#1b4079',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}


// ─── Health dot ───────────────────────────────────────────────────────────────

const healthColor: Record<QueueHealth, string> = {
  healthy: '#629460',
  warning: '#8a5c00',
  'at-risk': '#CE430A',
}
const healthLabel: Record<QueueHealth, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  'at-risk': 'At risk',
}
const healthBg: Record<QueueHealth, string> = {
  healthy: '#f2f6f2',
  warning: '#f3f0ef',
  'at-risk': 'rgba(206,67,10,0.06)',
}
const healthBorder: Record<QueueHealth, string> = {
  healthy: '#c8d9c7',
  warning: '#c3b7b1',
  'at-risk': 'rgba(206,67,10,0.2)',
}

function HealthPill({ health, capacityPct }: { health: QueueHealth; capacityPct: number }) {
  const color = healthColor[health]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: healthBg[health], border: `0.8px solid ${healthBorder[health]}`,
      borderRadius: 100, padding: '3px 8px',
      fontFamily: font.body, fontSize: 10, fontWeight: 700,
      color, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {capacityPct}% capacity · {healthLabel[health]}
    </span>
  )
}

// ─── Summary Bar ──────────────────────────────────────────────────────────────

function SummaryBar({ source, stagedCount }: { source: SourceQueue; stagedCount: number }) {
  const sourceAfter = source.specialists.length - stagedCount
  const targetAfter = REFINANCE_CURRENT + stagedCount

  // Border color follows source queue health — same system as HealthPill
  const solidColor = healthColor[source.health]

  // Center cell: dashed neutral when nothing staged (frame "incomplete"), solid health color once staging begins
  const centerTopBottom = stagedCount === 0
    ? '1.5px dashed #AD9B9A'
    : `1.5px solid ${solidColor}`

  const cells = [
    {
      label: 'TRANSFER SOURCE',
      value: source.name,
      from: `${source.specialists.length} specialists`,
      to: `${sourceAfter} specialists`,
      roundedLeft: true, roundedRight: false,
      borderLeft: true, borderRight: false,
      isCenter: false,
    },
    {
      label: 'SPECIALISTS BEING MOVED',
      value: `${stagedCount}`,
      sub: stagedCount === 0 ? 'Select specialists below' : stagedCount === 1 ? 'Trained for Refinance' : 'All trained for Refinance',
      roundedLeft: false, roundedRight: false,
      borderLeft: false, borderRight: false,
      isCenter: true,
    },
    {
      label: 'TRANSFER TARGET',
      value: 'Refinance',
      from: `${REFINANCE_CURRENT} specialists`,
      to: `${targetAfter} specialists`,
      roundedLeft: false, roundedRight: true,
      borderLeft: false, borderRight: true,
      isCenter: false,
    },
  ]

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {cells.map((s) => (
        <div
          key={s.label}
          style={{
            flex: s.isCenter ? '0 0 220px' : 1,
            background: css.surface,
            borderTop:    s.isCenter ? centerTopBottom : `1.5px solid ${solidColor}`,
            borderBottom: s.isCenter ? centerTopBottom : `1.5px solid ${solidColor}`,
            borderLeft:   s.borderLeft  ? `1.5px solid ${solidColor}` : 'none',
            borderRight:  s.borderRight ? `1.5px solid ${solidColor}` : 'none',
            borderRadius: s.roundedLeft ? '10px 0 0 10px' : s.roundedRight ? '0 10px 10px 0' : 0,
            padding: '14px 24px',
            display: 'flex', flexDirection: 'column', gap: 4,
            transition: 'border-color 0.25s ease',
          }}
        >
          <span style={{
            fontFamily: font.body, fontSize: 10, fontWeight: 600,
            color: css.textTertiary, letterSpacing: '0.7px', textTransform: 'uppercase',
          }}>
            {s.label}
          </span>
          <span style={{
            fontFamily: font.heading, fontSize: 20, fontWeight: 700,
            color: s.isCenter && stagedCount === 0 ? css.textTertiary : css.textPrimary,
            letterSpacing: '-0.08px', lineHeight: 1,
          }}>
            {s.value}
          </span>
          {s.sub ? (
            <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>{s.sub}</span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>{s.from}</span>
              <ArrowSmallIcon />
              <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>{s.to}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Source Queue Picker ──────────────────────────────────────────────────────

function SourceQueuePicker({
  selected,
  onSelect,
  open,
  onToggleOpen,
}: {
  selected: SourceQueue
  onSelect: (q: SourceQueue) => void
  open: boolean
  onToggleOpen: () => void
}) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={onToggleOpen}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          background: css.surface, border: `0.8px solid ${css.border}`,
          borderRadius: 6, height: 34, padding: '0 10px',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 700, color: css.textSecondary, flex: 1 }}>
          {selected.name}
        </span>
        <HealthPill health={selected.health} capacityPct={selected.capacityPct} />
        <CaretDownIcon />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 38, left: 0, right: 0, zIndex: 100,
          background: css.surface, border: `1px solid ${css.border}`,
          borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{
            padding: '8px 10px', borderBottom: `1px solid ${css.border}`,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <SearchIcon />
            <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>
              Search queues...
            </span>
          </div>

          {sourceQueues.map((q) => {
            const isSelected = q.name === selected.name
            return (
              <div
                key={q.name}
                onClick={() => { onSelect(q); onToggleOpen() }}
                style={{
                  padding: '10px 12px',
                  borderBottom: `1px solid ${css.border}`,
                  background: isSelected ? css.surfacePage : css.surface,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {q.suggested && <SparkIcon />}
                    <span style={{
                      fontFamily: font.body, fontSize: 12, fontWeight: 700,
                      color: css.textPrimary,
                    }}>
                      {q.name}
                    </span>
                    {q.suggested && (
                      <span style={{
                        fontFamily: font.body, fontSize: 9, fontWeight: 700,
                        color: '#1b4079', background: '#eceff4',
                        border: '0.8px solid #afbcd0', borderRadius: 100,
                        padding: '2px 6px', letterSpacing: '0.4px',
                      }}>
                        SUGGESTED
                      </span>
                    )}
                  </div>
                  <HealthPill health={q.health} capacityPct={q.capacityPct} />
                </div>
                <span style={{ fontFamily: font.body, fontSize: 10, color: css.textTertiary }}>
                  {q.eligibleCount} specialist{q.eligibleCount !== 1 ? 's' : ''} trained for Refinance
                </span>
                {q.warningReason && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <WarningIcon color={q.health === 'at-risk' ? '#CE430A' : '#8a5c00'} />
                    <span style={{
                      fontFamily: font.body, fontSize: 10,
                      color: q.health === 'at-risk' ? '#CE430A' : '#8a5c00',
                    }}>
                      {q.warningReason}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── AI Suggestion Banner ─────────────────────────────────────────────────────

function AISuggestionBanner({ reason }: { reason: string }) {
  return (
    <div style={{
      background: '#eceff4', border: '1px solid #afbcd0', borderRadius: 8,
      padding: '7px 10px', display: 'flex', alignItems: 'flex-start', gap: 7,
    }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <SparkIcon />
      </div>
      <span style={{
        fontFamily: font.body, fontSize: 11, fontWeight: 500,
        color: '#1b4079', lineHeight: 1.5,
      }}>
        {reason}
      </span>
    </div>
  )
}

// ─── Source Warning Banner ────────────────────────────────────────────────────

function SourceWarningBanner({ reason, health }: { reason: string; health: QueueHealth }) {
  const color = health === 'at-risk' ? '#CE430A' : '#8a5c00'
  const bg = health === 'at-risk' ? 'rgba(206,67,10,0.06)' : '#f3f0ef'
  const border = health === 'at-risk' ? 'rgba(206,67,10,0.2)' : '#c3b7b1'
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, borderRadius: 8,
      padding: '7px 10px', display: 'flex', alignItems: 'flex-start', gap: 7,
    }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>
        <WarningIcon color={color} />
      </div>
      <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color, lineHeight: 1.5 }}>
        {reason}
      </span>
    </div>
  )
}

// ─── Left Panel — Available to Transfer ──────────────────────────────────────

function LeftPanel({
  source,
  staged,
  onToggle,
  onSelectAll,
  onSelectSource,
}: {
  source: SourceQueue
  staged: string[]
  onToggle: (name: string) => void
  onSelectAll: () => void
  onSelectSource: (q: SourceQueue) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div style={{
      flex: 1, background: css.surface, borderRadius: 16,
      overflow: 'visible', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: css.surfacePage, border: `1px solid ${css.border}`,
        borderRadius: '16px 16px 0 0', padding: '10px 18px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: css.textSecondary }}>
            Available to Transfer
          </span>
          <div style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary, marginTop: 1 }}>
            Trained for Refinance
          </div>
        </div>
        <InfoPill label={`${source.specialists.length} eligible`} />
      </div>

      {/* Source picker + AI hint */}
      <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{
          fontFamily: font.body, fontSize: 10, fontWeight: 600,
          color: css.textTertiary, letterSpacing: '0.6px', textTransform: 'uppercase',
        }}>
          Source queue
        </span>
        <SourceQueuePicker
          selected={source}
          onSelect={onSelectSource}
          open={pickerOpen}
          onToggleOpen={() => setPickerOpen(o => !o)}
        />
        {source.suggested && source.suggestReason && (
          <AISuggestionBanner reason={source.suggestReason} />
        )}
        {!source.suggested && source.warningReason && (
          <SourceWarningBanner reason={source.warningReason} health={source.health} />
        )}
      </div>

      {/* Specialist rows */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {source.specialists.map((s) => {
          const isStaged = staged.includes(s.name)
          return (
            <div
              key={s.name}
              onClick={() => onToggle(s.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 18px', borderTop: `1px solid ${css.border}`,
                background: isStaged ? 'rgba(98,148,96,0.06)' : css.surface,
                cursor: 'pointer',
              }}
            >
              {isStaged ? <CheckCircleIcon /> : <PlusCircleIcon />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textPrimary }}>
                    {s.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  {s.trainedQueues.map((q) => (
                    <span key={q} style={{
                      fontFamily: font.body, fontSize: 9, fontWeight: 700,
                      color: q === 'Refinance' ? '#3f603e' : css.textTertiary,
                      background: q === 'Refinance' ? '#f2f6f2' : '#f7f4f3',
                      border: `0.8px solid ${q === 'Refinance' ? '#c8d9c7' : '#e8e3e2'}`,
                      borderRadius: 6, padding: '3px 8px',
                    }}>
                      {q}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        background: css.surfacePage, border: `1px solid ${css.border}`,
        borderRadius: '0 0 16px 16px', padding: '8px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto',
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          <strong style={{ color: css.textSecondary }}>{staged.length}</strong> staged for transfer
        </span>
        <button
          onClick={onSelectAll}
          style={{
            fontFamily: font.body, fontSize: 12, fontWeight: 600,
            color: css.brand, background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}
        >
          Select all eligible
        </button>
      </div>
    </div>
  )
}

// ─── Right Panel — Refinance Queue ────────────────────────────────────────────

function RightPanel({
  staged,
  onRemove,
}: {
  staged: string[]
  onRemove: (name: string) => void
}) {
  const afterCount = REFINANCE_CURRENT + staged.length

  return (
    <div style={{
      flex: 1, background: css.surface, borderRadius: 16,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        background: css.surfacePage, border: `1px solid ${css.border}`,
        borderRadius: '16px 16px 0 0', padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: css.textSecondary }}>
            Refinance
          </span>
          <div style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary, marginTop: 1 }}>
            Current assignment
          </div>
        </div>
        <InfoPill label={`${REFINANCE_CURRENT} specialists`} />
      </div>

      {/* Staged incoming */}
      {staged.length > 0 && (
        <div style={{ borderTop: `1px solid ${css.border}` }}>
          <div style={{ padding: '6px 18px', background: '#f2f6f2', borderBottom: `1px solid #c8d9c7` }}>
            <span style={{
              fontFamily: font.body, fontSize: 10, fontWeight: 700,
              color: '#3f603e', letterSpacing: '0.5px', textTransform: 'uppercase',
            }}>
              Incoming · {staged.length} staged
            </span>
          </div>
          {staged.map((name) => (
            <div
              key={name}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 18px', borderBottom: `1px solid #c8d9c7`,
                background: 'rgba(98,148,96,0.06)',
              }}
            >
              <CheckCircleIcon />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textPrimary }}>
                  {name}
                </span>
                <button onClick={() => onRemove(name)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <MinusCircleIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing specialists */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {currentRefinance.map((name) => (
          <div
            key={name}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 18px', borderTop: `1px solid ${css.border}`,
              background: css.surface,
            }}
          >
            <UserCircleIcon />
            <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textPrimary }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        background: css.surfacePage, border: `1px solid ${css.border}`,
        borderRadius: '0 0 16px 16px', padding: '8px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginTop: 'auto',
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          <strong style={{ color: css.textSecondary }}>{afterCount}</strong> after transfer
        </span>
        {staged.length > 0 && (
          <button
            onClick={() => staged.slice().forEach(onRemove)}
            style={{
              fontFamily: font.body, fontSize: 12, fontWeight: 600,
              color: 'var(--danger)', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
            }}
          >
            Remove all
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type RosterModalProps = {
  onClose: () => void
  onApply: (count: number, source: string, names: string[]) => void
}

export default function RosterModal({ onClose, onApply }: RosterModalProps) {
  const suggested = sourceQueues.find((q) => q.suggested)!
  const [source, setSource] = useState<SourceQueue>(suggested)
  const [staged, setStaged] = useState<string[]>([])

  function handleSelectSource(q: SourceQueue) {
    setSource(q)
    setStaged([]) // clear staged when source changes
  }

  function toggle(name: string) {
    setStaged((prev) => prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name])
  }

  function remove(name: string) {
    setStaged((prev) => prev.filter((n) => n !== name))
  }

  function selectAll() {
    setStaged(source.specialists.map((s) => s.name))
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.27)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-enter"
        style={{
          background: css.surfacePage, borderRadius: 10,
          padding: 48, width: 896, maxWidth: 'calc(100vw - 48px)',
          display: 'flex', flexDirection: 'column', gap: 20,
        }}
      >
        <SummaryBar source={source} stagedCount={staged.length} />

        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
          <LeftPanel
            source={source}
            staged={staged}
            onToggle={toggle}
            onSelectAll={selectAll}
            onSelectSource={handleSelectSource}
          />
          <RightPanel staged={staged} onRemove={remove} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                height: 36, padding: '0 24px',
                background: css.surfacePage, border: `1px solid ${css.border}`,
                borderRadius: 6, fontFamily: font.body, fontSize: 12,
                fontWeight: 700, color: css.textSecondary, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onApply(staged.length, source.name, staged); onClose() }}
              disabled={staged.length === 0}
              style={{
                height: 36, padding: '0 24px',
                background: staged.length > 0 ? 'var(--brand)' : '#d9d9d9',
                border: 'none', borderRadius: 6,
                fontFamily: font.body, fontSize: 12, fontWeight: 700,
                color: staged.length > 0 ? '#ffffff' : css.textTertiary,
                cursor: staged.length > 0 ? 'pointer' : 'not-allowed',
              }}
            >
              Apply transfer{staged.length > 0 ? ` · ${staged.length}` : ''}
            </button>
        </div>
      </div>
    </div>
  )
}
