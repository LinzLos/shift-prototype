import { useState, useEffect, useMemo, useRef } from 'react'
import Toast from '../components/Toast'
import { useQueueContext } from '../QueueContext'
import { getMetrics } from '../data/queues'
import { insightFor, runSimulation, type SimResult } from '../data/simulation'

// All Simulation copy derives from the Refinance queue record so its numbers
// match the Overview card and Queue Monitor.
const QUEUE = 'Refinance'
const metrics = getMetrics(QUEUE)
const ACTIVE_FMT = metrics.active.toLocaleString('en-US')

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

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'build' | 'running' | 'results'

type ConditionData = {
  id: string
  label: string   // matches Template.label for deduplication
  type: string
  attribute: string
  comparator: string
  current: string
  proposed: string
}

type Template = {
  type: string
  label: string
  attribute: string
  comparator: string
  current: string
  defaultProposed: string
}

const TEMPLATES: Template[] = [
  {
    type: 'Timeframe', label: 'Closing Timeline',
    attribute: 'Closing Timeline', comparator: 'Closing Date Proximity',
    current: '≤ 30 days', defaultProposed: '≤ 14 days',
  },
  {
    type: 'Timeframe', label: 'Processing Status',
    attribute: 'Processing Status', comparator: 'Time in Queue',
    current: '> 48 hours', defaultProposed: '> 24 hours',
  },
  {
    type: 'Numeric', label: 'LTV Ratio',
    attribute: 'Loan Risk Profile', comparator: 'LTV Ratio',
    current: '≤ 80%', defaultProposed: '≤ 90%',
  },
  {
    type: 'Numeric', label: 'DTI Ratio',
    attribute: 'Debt-to-Income', comparator: 'DTI Ratio',
    current: '≥ 43%', defaultProposed: '≥ 50%',
  },
]

// ─── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke={css.textTertiary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 4L12 12M12 4L4 12" stroke={css.textTertiary} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1L10 2.8V5.5C10 7.8 6 11 6 11C6 11 2 7.8 2 5.5V2.8L6 1Z" stroke={css.danger} strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon({ color }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2V12M2 7H12" stroke={color ?? css.textTertiary} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 8V2M2 5L5 2L8 5" stroke={css.textSecondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotIcon({ color }: { color: string }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" fill={color} />
    </svg>
  )
}

function BackArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8 6H4M4 6L6.5 3.5M4 6L6.5 8.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke={css.brand} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Header Bar ──────────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <div style={{
      background: css.surfacePage,
      border: `1px solid ${css.border}`,
      borderRadius: 10,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    }}>
      <h1 style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 20, letterSpacing: '-0.08px', color: css.textPrimary, margin: 0 }}>
        Simulation
      </h1>
      {/* Queue scope label — simulations run against the queue you're monitoring */}
      <span style={{ fontFamily: font.heading, fontWeight: 600, fontSize: 16, letterSpacing: '-0.048px', color: css.textTertiary, padding: '8px 10px' }}>
        {QUEUE}
      </span>
    </div>
  )
}

// ─── Condition Card ───────────────────────────────────────────────────────────

function TypePill({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: font.body, fontSize: 9, fontWeight: 700, letterSpacing: '0.45px',
      color: css.warning, background: 'var(--warning-light)', border: '0.8px solid var(--warning-mid)',
      borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function AttributePill({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: font.body, fontSize: 9, fontWeight: 700, letterSpacing: '0.45px',
      color: css.textTertiary, background: css.surfacePage, border: '0.8px solid var(--border-light)',
      borderRadius: 6, padding: '4px 12px', whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function InsightBanner({ text }: { text: string }) {
  return (
    <div style={{
      background: 'var(--info-light)', border: '1px solid #afbcd0', borderRadius: 10,
      padding: '8px 12px', fontFamily: font.body, fontSize: 13, color: css.info, lineHeight: 1.4,
    }}>
      {text}
    </div>
  )
}

function ConditionCard({
  condition, index, onRemove, onUpdateProposed,
}: {
  condition: ConditionData
  index: number
  onRemove: () => void
  onUpdateProposed: (val: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState(condition.proposed)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setEditVal(condition.proposed) }, [condition.proposed])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  function save() {
    setEditing(false)
    if (editVal.trim()) onUpdateProposed(editVal.trim())
    else setEditVal(condition.proposed)
  }

  return (
    <div
      className="fade-up"
      style={{
        background: css.surface, border: `1px solid ${css.border}`,
        borderRadius: 16, overflow: 'hidden',
        animationDelay: `${index * 60}ms`,
      }}
    >
      <div style={{
        background: css.surfacePage, padding: '10px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <TypePill label={condition.type} />
          <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: css.textSecondary }}>
            Condition {index + 1}
          </span>
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <CloseIcon />
        </button>
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <AttributePill label={condition.attribute} />
          <AttributePill label={condition.comparator} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Current */}
          <div style={{
            background: css.surface, border: `1px solid ${css.border}`,
            borderRadius: 16, padding: 12, minWidth: 120,
          }}>
            <div style={{ fontFamily: font.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: css.textTertiary, marginBottom: 6, paddingLeft: 6 }}>
              Current
            </div>
            <div style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 700, color: css.textPrimary, letterSpacing: '-0.08px', lineHeight: 1, paddingLeft: 6 }}>
              {condition.current}
            </div>
          </div>

          <ArrowRightIcon />

          {/* Proposed — click to edit */}
          <div
            onClick={() => !editing && setEditing(true)}
            style={{
              background: 'var(--brand-light)', border: `1px solid ${editing ? 'var(--brand)' : 'var(--brand-mid)'}`,
              borderRadius: 16, padding: 12, minWidth: 120, cursor: editing ? 'default' : 'pointer',
              transition: 'border-color 0.15s ease',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: css.brand }}>
                Proposed
              </span>
              {!editing && <EditIcon />}
            </div>
            {editing ? (
              <input
                ref={inputRef}
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={save}
                onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setEditing(false); setEditVal(condition.proposed) } }}
                style={{
                  fontFamily: font.heading, fontSize: 20, fontWeight: 700, color: css.brand,
                  background: 'transparent', border: 'none', outline: 'none',
                  width: '100%', letterSpacing: '-0.08px', lineHeight: 1, paddingLeft: 6,
                }}
              />
            ) : (
              <div style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 700, color: css.brand, letterSpacing: '-0.08px', lineHeight: 1, paddingLeft: 6 }}>
                {condition.proposed}
              </div>
            )}
          </div>
        </div>

        <InsightBanner text={insightFor(QUEUE, condition.label, condition.proposed)} />
      </div>
    </div>
  )
}

// ─── Add Condition Form ───────────────────────────────────────────────────────

function AddConditionForm({
  usedLabels, onAdd, onCancel,
}: {
  usedLabels: string[]
  onAdd: (c: ConditionData) => void
  onCancel: () => void
}) {
  const available = TEMPLATES.filter(t => !usedLabels.includes(t.label))
  const [selected, setSelected] = useState<Template | null>(null)
  const [proposed, setProposed] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (selected) { setProposed(selected.defaultProposed); setTimeout(() => inputRef.current?.focus(), 50) } }, [selected])

  function handleAdd() {
    if (!selected || !proposed.trim()) return
    onAdd({
      id: `${selected.label}-${Date.now()}`,
      label: selected.label,
      type: selected.type,
      attribute: selected.attribute,
      comparator: selected.comparator,
      current: selected.current,
      proposed: proposed.trim(),
    })
  }

  return (
    <div className="fade-up" style={{
      background: css.surface,
      border: `1.5px dashed ${css.brand}`,
      borderRadius: 16, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Step 1: Pick attribute */}
      <div>
        <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.7px', textTransform: 'uppercase' }}>
          Select attribute
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {available.map(t => {
            const active = selected?.label === t.label
            return (
              <button
                key={t.label}
                onClick={() => setSelected(t)}
                style={{
                  fontFamily: font.body, fontSize: 12, fontWeight: 600,
                  color: active ? 'var(--brand-dark)' : css.textSecondary,
                  background: active ? 'var(--brand-light)' : css.surface,
                  border: `1px solid ${active ? 'var(--brand)' : css.border}`,
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            )
          })}
          {available.length === 0 && (
            <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>All available conditions added.</span>
          )}
        </div>
      </div>

      {/* Step 2: Set proposed value */}
      {selected && (
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Current */}
            <div style={{ background: css.surfacePage, border: `1px solid ${css.border}`, borderRadius: 12, padding: '10px 14px', minWidth: 110 }}>
              <div style={{ fontFamily: font.body, fontSize: 9, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: css.textTertiary, marginBottom: 4 }}>Current</div>
              <div style={{ fontFamily: font.heading, fontSize: 18, fontWeight: 700, color: css.textPrimary, letterSpacing: '-0.08px' }}>{selected.current}</div>
            </div>
            <ArrowRightIcon />
            {/* Proposed input */}
            <div style={{ background: 'var(--brand-light)', border: `1.5px solid var(--brand)`, borderRadius: 12, padding: '10px 14px', minWidth: 110 }}>
              <div style={{ fontFamily: font.body, fontSize: 9, fontWeight: 600, letterSpacing: '0.7px', textTransform: 'uppercase', color: css.brand, marginBottom: 4 }}>Proposed</div>
              <input
                ref={inputRef}
                value={proposed}
                onChange={e => setProposed(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{
                  fontFamily: font.heading, fontSize: 18, fontWeight: 700, color: css.brand,
                  background: 'transparent', border: 'none', outline: 'none',
                  width: '100%', letterSpacing: '-0.08px',
                }}
              />
            </div>
          </div>
          <InsightBanner text={insightFor(QUEUE, selected.label, proposed || selected.defaultProposed)} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            height: 34, padding: '0 16px', background: 'transparent',
            border: `1px solid ${css.border}`, borderRadius: 6,
            fontFamily: font.body, fontSize: 12, fontWeight: 600,
            color: css.textTertiary, cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={!selected || !proposed.trim()}
          style={{
            height: 34, padding: '0 16px',
            background: selected && proposed.trim() ? css.brand : 'var(--border-light)',
            border: 'none', borderRadius: 6,
            fontFamily: font.body, fontSize: 12, fontWeight: 700,
            color: selected && proposed.trim() ? 'var(--text-inverse)' : css.textTertiary,
            cursor: selected && proposed.trim() ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          Add condition
        </button>
      </div>
    </div>
  )
}

// ─── Condition Builder Panel ──────────────────────────────────────────────────

function ConditionBuilder({
  conditions, phase, onAdd, onRemove, onUpdateProposed, onRun, onReset,
}: {
  conditions: ConditionData[]
  phase: Phase
  onAdd: (c: ConditionData) => void
  onRemove: (id: string) => void
  onUpdateProposed: (id: string, val: string) => void
  onRun: () => void
  onReset: () => void
}) {
  const [addingNew, setAddingNew] = useState(false)
  const isRunning = phase === 'running'
  const canRun = conditions.length > 0 && !isRunning

  function handleAdd(c: ConditionData) {
    onAdd(c)
    setAddingNew(false)
  }

  return (
    <div style={{
      background: css.surfacePage, borderRadius: 10, padding: 24,
      display: 'flex', flexDirection: 'column', gap: 20,
      flex: '0 0 380px',
      opacity: isRunning ? 0.5 : 1,
      pointerEvents: isRunning ? 'none' : 'auto',
      transition: 'opacity 0.3s ease',
    }}>
      {/* Header */}
      <div>
        <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: css.textSecondary, marginBottom: 6 }}>
          Condition Builder
        </div>
        <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: css.textTertiary, lineHeight: 1.4 }}>
          Test how sub-attribute changes shift loan rankings before applying anything
        </div>
      </div>

      {/* Alert banner */}
      <div style={{
        background: 'var(--danger-light)', border: '1px solid var(--danger-mid)', borderRadius: 10,
        padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <div style={{ marginTop: 1, flexShrink: 0 }}><ShieldIcon /></div>
        <div>
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.danger, lineHeight: 1.25 }}>{QUEUE}</div>
          <div style={{ fontFamily: font.body, fontSize: 13, color: css.danger, lineHeight: 1.4 }}>
            has {metrics.urgent} loans within 5 days of closing. Testing time-based conditions may help reprioritize before cutoff.
          </div>
        </div>
      </div>

      {/* Empty state or condition cards */}
      {conditions.length === 0 && !addingNew ? (
        <div style={{
          border: `1.5px dashed ${css.border}`, borderRadius: 12,
          padding: '32px 24px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12, textAlign: 'center',
        }}>
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textSecondary }}>
            No conditions yet
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary, lineHeight: 1.5, maxWidth: 220 }}>
            Add a condition to start testing how loan rankings would shift
          </div>
          <button
            onClick={() => setAddingNew(true)}
            style={{
              marginTop: 4, height: 36, padding: '0 20px',
              background: css.brand, border: 'none', borderRadius: 6,
              fontFamily: font.body, fontSize: 12, fontWeight: 700,
              color: 'var(--text-inverse)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <PlusIcon color="var(--text-inverse)" />
            Add first condition
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {conditions.map((c, i) => (
            <ConditionCard
              key={c.id}
              condition={c}
              index={i}
              onRemove={() => onRemove(c.id)}
              onUpdateProposed={val => onUpdateProposed(c.id, val)}
            />
          ))}

          {addingNew ? (
            <AddConditionForm
              usedLabels={conditions.map(c => c.label)}
              onAdd={handleAdd}
              onCancel={() => setAddingNew(false)}
            />
          ) : conditions.length < TEMPLATES.length ? (
            <button
              onClick={() => setAddingNew(true)}
              style={{
                width: '100%', height: 48, background: 'transparent',
                border: `1.5px dashed ${css.border}`, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, cursor: 'pointer',
                fontFamily: font.body, fontSize: 13, color: css.textTertiary,
              }}
            >
              <PlusIcon />
              Add another condition
            </button>
          ) : null}
        </div>
      )}

      {/* Run / Reset */}
      {conditions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={onRun}
            disabled={!canRun}
            style={{
              width: '100%', height: 48, border: 'none', borderRadius: 6,
              background: canRun ? css.brand : 'var(--border-light)',
              fontFamily: font.body, fontSize: 12, fontWeight: 700,
              color: canRun ? 'var(--text-inverse)' : css.textTertiary,
              cursor: canRun ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s ease',
            }}
          >
            Run simulation
          </button>
          <button
            onClick={onReset}
            style={{
              width: '100%', height: 36, background: 'transparent',
              border: 'none', borderRadius: 6,
              fontFamily: font.body, fontSize: 12, fontWeight: 600,
              color: css.textTertiary, cursor: 'pointer',
            }}
          >
            Reset all conditions
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Loan Table Pills ─────────────────────────────────────────────────────────

const changePillStyles = {
  positive: { bg: 'var(--accent-light)',             border: 'var(--chart-azure)',              color: css.info    },
  negative: { bg: 'rgba(206,67,10,0.08)', border: 'rgba(206,67,10,0.3)', color: css.danger  },
  neutral:  { bg: css.surfacePage,        border: css.border,             color: css.textTertiary },
}

function ClosingPill({ label }: { label: string }) {
  return (
    <span style={{
      fontFamily: font.body, fontSize: 9, fontWeight: 700, color: css.textTertiary,
      background: css.surfacePage, border: `0.8px solid ${css.border}`,
      borderRadius: 6, padding: '3px 8px', whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function ChangePill({ value, type }: { value: string; type: 'positive' | 'negative' | 'neutral' }) {
  const s = changePillStyles[type]
  return (
    <span style={{
      fontFamily: font.body, fontSize: 9, fontWeight: 700, letterSpacing: '0.45px',
      color: s.color, background: s.bg, border: `0.8px solid ${s.border}`,
      borderRadius: 6, padding: '4px 10px', whiteSpace: 'nowrap',
    }}>{value}</span>
  )
}

// ─── Simulation Results Panel ─────────────────────────────────────────────────

function SimulationResults({
  phase, progress, conditionCount, onModify, resultsKey, saved, applied, onSave, onShare, onApply, result,
}: {
  phase: Phase
  progress: number
  conditionCount: number
  onModify: () => void
  resultsKey: number
  saved: boolean
  applied: boolean
  onSave: () => void
  onShare: () => void
  onApply: () => void
  result: SimResult
}) {
  const cell: React.CSSProperties = {
    padding: '10px 12px', borderBottom: `1px solid ${css.border}`,
    fontFamily: font.body, fontSize: 12, color: css.textPrimary, verticalAlign: 'middle',
  }
  const th: React.CSSProperties = {
    padding: '8px 12px', fontFamily: font.body, fontSize: 10, fontWeight: 600,
    color: css.textTertiary, letterSpacing: '0.4px', textTransform: 'uppercase',
    borderBottom: `1px solid ${css.border}`, whiteSpace: 'nowrap', textAlign: 'left',
  }

  // Progress label
  const runLabel = progress < 40
    ? `Scanning ${ACTIVE_FMT} loans in ${QUEUE}…`
    : progress < 80
      ? `Computing rank changes across ${conditionCount} condition${conditionCount !== 1 ? 's' : ''}…`
      : 'Finalizing simulation results…'

  return (
    <div style={{
      background: css.surfacePage, borderRadius: 10, padding: 24,
      display: 'flex', flexDirection: 'column', gap: 20,
      flex: 1, minWidth: 0,
    }}>

      {/* ── Idle state ── */}
      {phase === 'build' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 40px', textAlign: 'center', gap: 12,
        }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="6" y="18" width="28" height="16" rx="3" stroke={css.border} strokeWidth="1.5" />
            <path d="M13 18V14a7 7 0 0114 0v4" stroke={css.border} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="20" cy="26" r="2.5" fill={css.border} />
          </svg>
          <div style={{ fontFamily: font.body, fontWeight: 700, fontSize: 14, color: css.textSecondary }}>
            Configure conditions to run a simulation
          </div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary, lineHeight: 1.6, maxWidth: 280 }}>
            Add at least one condition on the left to see how loan rankings in Refinance would shift — without touching the live queue.
          </div>
        </div>
      )}

      {/* ── Running state ── */}
      {phase === 'running' && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 40px', gap: 24,
        }}>
          {/* Animated progress ring / bar */}
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textSecondary }}>
                Running simulation
              </span>
              <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
                {Math.round(progress)}%
              </span>
            </div>
            {/* Track */}
            <div style={{ height: 6, background: css.surfaceMuted, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                background: `linear-gradient(to right, var(--brand), var(--brand-dark))`,
                width: `${progress}%`,
                transition: 'width 0.18s ease',
              }} />
            </div>
            <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary, textAlign: 'center' }}>
              {runLabel}
            </span>
          </div>

          {/* Condition pills being "evaluated" */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Array.from({ length: conditionCount }).map((_, i) => {
              const done = progress > 30 + i * 25
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 12px', borderRadius: 99,
                    border: `1px solid ${done ? 'var(--brand-mid)' : css.border}`,
                    background: done ? 'var(--brand-light)' : css.surface,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="4.5" fill="#629460" />
                      <path d="M3 5l1.5 1.5L7 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1.5px solid ${css.border}` }} />
                  )}
                  <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: done ? 'var(--brand-dark)' : css.textTertiary }}>
                    Condition {i + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Results state ── */}
      {phase === 'results' && (
        <div key={resultsKey} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 16, color: css.textSecondary }}>
                  Simulation results
                </span>
                <span style={{
                  fontFamily: font.body, fontSize: 12, fontWeight: 700, color: 'var(--brand-dark)',
                  background: 'var(--brand-light)', border: `1px solid var(--brand-mid)`, borderRadius: 100, padding: '4px 12px',
                }}>
                  Scenario preview
                </span>
              </div>
              <button
                onClick={onModify}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: font.body, fontSize: 12, color: css.textTertiary,
                }}
              >
                <BackArrowIcon />
                Modify conditions
              </button>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: css.textTertiary }}>
              Based on {ACTIVE_FMT} loans · {QUEUE} · Simulated, not applied
            </div>
          </div>

          {/* KPI row — computed by the simulation engine from the conditions */}
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { label: 'loans affected', value: result.affected.toLocaleString('en-US'), sub: `of ${ACTIVE_FMT} total, ${result.affectedPct}% (est.)`, delay: 60 },
              { label: 'rank increases', value: `+${result.up.toLocaleString('en-US')}`, sub: 'moved higher in priority',  delay: 130 },
              { label: 'rank decreases', value: `-${result.down.toLocaleString('en-US')}`, sub: 'moved lower in priority',   delay: 200 },
            ].map(({ label, value, sub, delay }) => (
              <div
                key={label}
                className="fade-up"
                style={{
                  flex: 1, background: css.surface, border: `1px solid ${css.border}`,
                  borderRadius: 16, padding: 12, animationDelay: `${delay}ms`,
                }}
              >
                <div style={{ fontFamily: font.body, fontSize: 10, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: 6 }}>
                  {label}
                </div>
                <div style={{ fontFamily: font.heading, fontSize: 20, fontWeight: 700, color: css.textPrimary, letterSpacing: '-0.08px', lineHeight: 1, marginBottom: 4 }}>
                  {value}
                </div>
                <div style={{ fontFamily: font.body, fontSize: 9, color: css.textTertiary }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div
            className="fade-up"
            style={{ background: css.surface, border: `1px solid ${css.border}`, borderRadius: 12, overflow: 'hidden', animationDelay: '260ms' }}
          >
            <div style={{
              padding: '10px 16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', borderBottom: `1px solid ${css.border}`,
            }}>
              <span style={{ fontFamily: font.body, fontWeight: 700, fontSize: 13, color: css.textPrimary }}>
                Top 10 Rank Changes
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {[
                  { label: 'Promoted',  color: '#5B9BD5'       },
                  { label: 'Demoted',   color: css.danger       },
                  { label: 'Unchanged', color: css.textTertiary },
                ].map(({ label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <DotIcon color={color} />
                    <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: css.surfacePage }}>
                  <th style={th}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>New Rank <ArrowUpIcon /></div></th>
                  <th style={th}>Loan</th>
                  <th style={th}>Closing</th>
                  <th style={th}>Time in Q</th>
                  <th style={th}>LTV</th>
                  <th style={th}>Change</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr
                    key={row.rank}
                    className="fade-up"
                    style={{ animationDelay: `${300 + i * 40}ms` }}
                  >
                    <td style={{ ...cell, color: css.textSecondary, fontWeight: 600 }}>{row.rank}</td>
                    <td style={{ ...cell, fontWeight: 600 }}>{row.loan}</td>
                    <td style={cell}><ClosingPill label={row.closing} /></td>
                    <td style={cell}>{row.timeInQ}</td>
                    <td style={cell}>{row.ltv}</td>
                    <td style={cell}><ChangePill value={row.change} type={row.changeType} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer CTA */}
          {applied ? (
            <div
              className="fade-up"
              style={{
                background: 'rgba(98,148,96,0.08)', border: '1px solid var(--brand-mid)',
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="8" cy="8" r="6.5" fill="#629460" />
                <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: 'var(--brand-dark)', marginBottom: 2 }}>
                  Conditions applied to {QUEUE}
                </div>
                <div style={{ fontFamily: font.body, fontSize: 12, color: 'var(--brand-dark)' }}>
                  Live rankings are re-sorting — the queue is marked as actioned on Overview.
                </div>
              </div>
            </div>
          ) : (
            <div
              className="fade-up"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '700ms' }}
            >
              <div>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textPrimary, marginBottom: 2 }}>
                  Happy with these results?
                </div>
                <div style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
                  Save as a scenario to apply or share with your team.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={onSave}
                  disabled={saved}
                  style={{
                    height: 34, padding: '0 16px', background: saved ? 'var(--brand-light)' : css.surface,
                    border: `1px solid ${saved ? 'var(--brand-mid)' : css.border}`, borderRadius: 6,
                    fontFamily: font.body, fontSize: 12, fontWeight: 600,
                    color: saved ? 'var(--brand-dark)' : css.textSecondary, cursor: saved ? 'default' : 'pointer',
                  }}
                >
                  {saved ? 'Saved ✓' : 'Save'}
                </button>
                <button
                  onClick={onShare}
                  style={{
                    height: 34, padding: '0 16px', background: css.surface,
                    border: `1px solid ${css.border}`, borderRadius: 6,
                    fontFamily: font.body, fontSize: 12, fontWeight: 600,
                    color: css.textSecondary, cursor: 'pointer',
                  }}
                >
                  Share
                </button>
                <button
                  onClick={onApply}
                  style={{
                    height: 34, padding: '0 16px', background: css.brand, border: 'none',
                    borderRadius: 6, fontFamily: font.body, fontSize: 12, fontWeight: 700,
                    color: 'var(--text-inverse)', cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Simulation() {
  const [phase, setPhase]       = useState<Phase>('build')
  const [conditions, setConditions] = useState<ConditionData[]>([])
  const [progress, setProgress] = useState(0)
  const [resultsKey, setResultsKey] = useState(0)
  const [saved, setSaved] = useState(false)
  const [applied, setApplied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { markActioned } = useQueueContext()

  // Rank shifts computed from the actual condition thresholds — editing a
  // proposed value and re-running produces different results.
  const result = useMemo(
    () => runSimulation(QUEUE, conditions.map(c => ({ label: c.label, proposed: c.proposed }))),
    [conditions]
  )

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 4000)
  }

  function handleSave() {
    setSaved(true)
    showToast('Scenario saved to your drafts')
  }

  function handleShare() {
    try { navigator.clipboard?.writeText(window.location.href) } catch { /* clipboard unavailable */ }
    showToast('Scenario link copied to clipboard')
  }

  function handleApplyConditions() {
    setApplied(true)
    markActioned(QUEUE)
    showToast(`Conditions applied to ${QUEUE}`)
  }

  // Progress animation when running
  useEffect(() => {
    if (phase !== 'running') return
    const milestones = [14, 27, 39, 52, 63, 74, 83, 91, 97, 100]
    const gaps       = [200, 180, 210, 160, 190, 230, 170, 200, 260, 420]
    const ts: ReturnType<typeof setTimeout>[] = []
    let cumulative = 0
    milestones.forEach((pct, i) => {
      cumulative += gaps[i]
      const t = setTimeout(() => setProgress(pct), cumulative)
      ts.push(t)
    })
    const done = setTimeout(() => {
      setPhase('results')
      setResultsKey(k => k + 1)
    }, cumulative + 500)
    ts.push(done)
    return () => ts.forEach(clearTimeout)
  }, [phase])

  function handleRun() {
    setProgress(0)
    setSaved(false)
    setApplied(false)
    setPhase('running')
  }

  function handleModify() {
    setPhase('build')
  }

  function handleReset() {
    setConditions([])
    setSaved(false)
    setApplied(false)
    setPhase('build')
  }

  function addCondition(c: ConditionData) {
    setConditions(prev => [...prev, c])
  }

  function removeCondition(id: string) {
    setConditions(prev => prev.filter(c => c.id !== id))
  }

  function updateProposed(id: string, val: string) {
    setConditions(prev => prev.map(c => c.id === id ? { ...c, proposed: val } : c))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar />
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <ConditionBuilder
          conditions={conditions}
          phase={phase}
          onAdd={addCondition}
          onRemove={removeCondition}
          onUpdateProposed={updateProposed}
          onRun={handleRun}
          onReset={handleReset}
        />
        <SimulationResults
          phase={phase}
          progress={progress}
          conditionCount={conditions.length}
          onModify={handleModify}
          resultsKey={resultsKey}
          saved={saved}
          applied={applied}
          onSave={handleSave}
          onShare={handleShare}
          onApply={handleApplyConditions}
          result={result}
        />
      </div>
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
