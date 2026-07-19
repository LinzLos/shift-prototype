import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getLoans, LOAN_STAGES } from '../data/queues'

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

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M8.5 3L4.5 7L8.5 11" stroke={css.textSecondary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke={css.textTertiary} strokeWidth="1.2" />
      <path d="M8.5 8.5L11.5 11.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ color }: { color?: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 2L8 8M8 2L2 8" stroke={color ?? css.textTertiary} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function SortArrow({ dir }: { dir: 'asc' | 'desc' }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: dir === 'desc' ? 'rotate(180deg)' : 'none' }}>
      <path d="M5 8V2M5 2L2.5 4.5M5 2L7.5 4.5" stroke={css.textSecondary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatAmount(n: number) {
  return `$${(n / 1000).toFixed(0)}k`
}

// ─── Filter primitives ────────────────────────────────────────────────────────

const DAY_BUCKETS = [5, 14, 30]

function urgencyColor(days: number) {
  if (days <= 5) return css.danger
  if (days <= 14) return css.warning
  return css.textSecondary
}

function Chip({ label, active, onClick, removable }: {
  label: string
  active?: boolean
  onClick: () => void
  removable?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: active ? 'var(--brand-light)' : css.surface,
        border: `1px solid ${active ? 'var(--brand-mid)' : css.border}`,
        borderRadius: 100, padding: '5px 12px', cursor: 'pointer',
        fontFamily: font.body, fontSize: 12, fontWeight: active ? 700 : 500,
        color: active ? 'var(--brand-dark)' : css.textSecondary,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {removable && active && <CloseIcon color="var(--brand-dark)" />}
    </button>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Loans() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as { queue?: string; days?: number; label?: string; source?: string } | null) ?? null
  const queue = state?.queue ?? 'Refinance'
  const sourceLabel = state?.source ?? null

  const [search, setSearch] = useState('')
  const [dayBucket, setDayBucket] = useState<number | null>(state?.days ?? null)
  const [stage, setStage] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<'days' | 'amount'>('days')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Loans derive from the queue that opened this drill-down, so the counts
  // match the alert that linked here.
  const LOANS = useMemo(() => getLoans(queue), [queue])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const rows = LOANS.filter((l) => {
      if (dayBucket != null && l.daysToClose > dayBucket) return false
      if (stage && l.stage !== stage) return false
      if (q && !l.borrower.toLowerCase().includes(q) && !l.id.toLowerCase().includes(q)) return false
      return true
    })
    const dir = sortDir === 'asc' ? 1 : -1
    return rows.sort((a, b) =>
      sortKey === 'days' ? (a.daysToClose - b.daysToClose) * dir : (a.amount - b.amount) * dir
    )
  }, [LOANS, search, dayBucket, stage, sortKey, sortDir])

  function toggleSort(key: 'days' | 'amount') {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'days' ? 'asc' : 'desc')
    }
  }

  const hasActiveFilters = dayBucket != null || stage != null || search.trim() !== ''

  const columns: { key: string; label: string; sortable?: 'days' | 'amount'; align?: 'right' }[] = [
    { key: 'id', label: 'Loan ID' },
    { key: 'borrower', label: 'Borrower' },
    { key: 'days', label: 'Days to close', sortable: 'days' },
    { key: 'amount', label: 'Amount', sortable: 'amount', align: 'right' },
    { key: 'stage', label: 'Stage' },
    { key: 'specialist', label: 'Specialist' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back + heading */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          onClick={() => navigate('/queue-monitor', { state: { queue } })}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            fontFamily: font.body, fontSize: 12, fontWeight: 600, color: css.textSecondary,
          }}
        >
          <BackIcon />
          Back to Queue Monitor
        </button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 20, letterSpacing: '-0.08px', color: css.textPrimary }}>
            Loans
          </span>
          <span style={{ fontFamily: font.heading, fontWeight: 600, fontSize: 16, letterSpacing: '-0.048px', color: css.textTertiary }}>
            {queue}
          </span>
        </div>
        {sourceLabel && (
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color: css.textTertiary }}>
            Opened from {sourceLabel}
          </span>
        )}
      </div>

      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: css.surfacePage,
        paddingTop: 4, paddingBottom: 12,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: css.surface, border: `1px solid ${css.border}`,
          borderRadius: 8, padding: '0 12px', height: 38, maxWidth: 360,
        }}>
          <SearchIcon />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by loan ID or borrower..."
            style={{
              border: 'none', background: 'transparent', outline: 'none', width: '100%',
              fontFamily: font.body, fontSize: 13, color: css.textPrimary,
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <CloseIcon />
            </button>
          )}
        </div>

        {/* Quick filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: css.textTertiary, marginRight: 2 }}>
            Closing in
          </span>
          {DAY_BUCKETS.map((b) => (
            <Chip
              key={b}
              label={`≤${b} days`}
              active={dayBucket === b}
              removable
              onClick={() => setDayBucket((cur) => (cur === b ? null : b))}
            />
          ))}
          <div style={{ width: 1, height: 18, background: css.border, margin: '0 4px' }} />
          <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: css.textTertiary, marginRight: 2 }}>
            Stage
          </span>
          {LOAN_STAGES.map((s) => (
            <Chip
              key={s}
              label={s}
              active={stage === s}
              removable
              onClick={() => setStage((cur) => (cur === s ? null : s))}
            />
          ))}
        </div>

        {/* Count + clear */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary }}>
            Showing <strong style={{ color: css.textPrimary }}>{filtered.length}</strong> of the {LOANS.length} loans closing soonest in {queue}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setDayBucket(null); setStage(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: font.body, fontSize: 11, fontWeight: 600, color: css.textTertiary,
              }}
            >
              <CloseIcon /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: css.surface, border: `1px solid ${css.border}`,
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 1.2fr 1.3fr',
          gap: 12, padding: '10px 16px',
          borderBottom: `1px solid ${css.border}`, background: css.surfacePage,
        }}>
          {columns.map((c) => (
            <button
              key={c.key}
              onClick={() => c.sortable && toggleSort(c.sortable)}
              disabled={!c.sortable}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                justifyContent: c.align === 'right' ? 'flex-end' : 'flex-start',
                background: 'none', border: 'none', padding: 0,
                cursor: c.sortable ? 'pointer' : 'default',
                fontFamily: font.body, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.5px', textTransform: 'uppercase',
                color: c.sortable && sortKey === c.sortable ? css.textPrimary : css.textTertiary,
              }}
            >
              {c.label}
              {c.sortable && sortKey === c.sortable && <SortArrow dir={sortDir} />}
            </button>
          ))}
        </div>

        {/* Body */}
        {filtered.length > 0 ? (
          <div className="scroll-hidden" style={{ maxHeight: 540, overflowY: 'auto' }}>
            {filtered.map((l, idx) => (
              <div
                key={l.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 1.2fr 1.3fr',
                  gap: 12, padding: '12px 16px', alignItems: 'center',
                  borderBottom: idx < filtered.length - 1 ? `1px solid ${css.border}` : 'none',
                }}
              >
                <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: css.textSecondary }}>{l.id}</span>
                <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: css.textPrimary }}>{l.borrower}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 100, background: urgencyColor(l.daysToClose), flexShrink: 0 }} />
                  <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, color: urgencyColor(l.daysToClose) }}>
                    {l.daysToClose}d
                  </span>
                </span>
                <span style={{ fontFamily: font.body, fontSize: 13, color: css.textPrimary, textAlign: 'right' }}>{formatAmount(l.amount)}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary }}>{l.stage}</span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary }}>{l.specialist}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px 16px', textAlign: 'center' }}>
            <span style={{ fontFamily: font.body, fontSize: 13, color: css.textTertiary }}>
              No loans match the current filters.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
