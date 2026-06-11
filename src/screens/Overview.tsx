import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueueContext } from '../QueueContext'

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

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="5" cy="5" r="3.5" stroke={css.textTertiary} strokeWidth="1.2" />
      <path d="M8 8L10.5 10.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function CaretDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarButton({ filled, onToggle }: { filled: boolean; onToggle: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transform: hovered ? 'scale(1.25)' : 'scale(1)',
        transition: 'transform 0.18s ease',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 16 16" fill={filled ? '#629460' : 'none'}>
        <path
          d="M8 1.5L9.854 5.257L14 5.865L11 8.786L11.708 12.914L8 10.963L4.292 12.914L5 8.786L2 5.865L6.146 5.257L8 1.5Z"
          stroke="#629460"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// Star path shared by the demo group
const STAR_PATH = 'M8 1.5L9.854 5.257L14 5.865L11 8.786L11.708 12.914L8 10.963L4.292 12.914L5 8.786L2 5.865L6.146 5.257L8 1.5Z'

// 2×2 grid positions (28px stars, 6px gap → 62×62 container)
// center of container = 31px; to center a 28px star: top-left at 17px
// demo star is at (34,34), needs to translate to (17,17) → (-17px,-17px)
const STAR_POS  = [{ t: 0,  l: 0  }, { t: 0,  l: 34 }, { t: 34, l: 0  }, { t: 34, l: 34 }]
const SCATTER   = [{ x: -28, y: -28 }, { x: 28, y: -28 }, { x: -28, y: 28 }]

function FavoritesDemoGroup() {
  const [phase,    setPhase]    = useState<'idle' | 'hover' | 'selected' | 'returning'>('idle')
  const [filled,   setFilled]   = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = []
    const add = (fn: () => void, ms: number) => { const t = setTimeout(fn, ms); ts.push(t) }

    function loop() {
      setPhase('idle');   setFilled(false)
      add(() => setPhase('hover'),                                    1100)
      add(() => { setPhase('selected'); setFilled(true); setShakeKey(k => k + 1) }, 1500)
      add(() => setPhase('returning'),                                3400)
      add(() => setFilled(false),                                     3700)
      add(loop,                                                       4600)
    }

    const kick = setTimeout(loop, 600)
    ts.push(kick)
    return () => ts.forEach(clearTimeout)
  }, [])

  const othersGone   = phase === 'selected'
  const demoSelected = phase === 'selected'

  return (
    <div style={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
      {/* Static stars 0–2 */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top:  STAR_POS[i].t,
            left: STAR_POS[i].l,
            transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.55s ease',
            transform: othersGone
              ? `translate(${SCATTER[i].x}px, ${SCATTER[i].y}px) scale(0.3)`
              : 'translate(0,0) scale(1)',
            opacity: othersGone ? 0 : 1,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none" style={{ display: 'block' }}>
            <path d={STAR_PATH} stroke={css.textTertiary} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ))}

      {/* Demo star */}
      <div
        style={{
          position: 'absolute',
          top:  STAR_POS[3].t,
          left: STAR_POS[3].l,
          transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          transform: demoSelected
            ? 'translate(-17px,-17px) scale(1.65)'
            : phase === 'returning'
              ? 'translate(0,0) scale(1)'
              : phase === 'hover'
                ? 'scale(1.25)'
                : 'translate(0,0) scale(1)',
        }}
      >
        <svg
          key={shakeKey}
          width="28"
          height="28"
          viewBox="0 0 16 16"
          style={{ display: 'block', fill: filled ? '#629460' : 'none', transition: 'fill 0.25s ease' }}
          className={phase === 'selected' ? 'star-jump-shake' : undefined}
        >
          <path d={STAR_PATH} stroke="#629460" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function ArrowRightIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7H11.5M11.5 7L8 3.5M11.5 7L8 10.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AtRiskIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke={color} strokeWidth="1.1" />
      <path d="M6 3.5V6.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="6" cy="8.5" r="0.6" fill={color} />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Header Bar ──────────────────────────────────────────────────────────────

function HeaderBar({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (v: string) => void }) {
  const tabs = ['Real Time', '1d', 'Week', 'Month', 'Custom']

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
      <h1 style={{
        fontFamily: font.heading,
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '-0.08px',
        color: css.textSecondary,
        margin: 0,
      }}>
        Overview
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search */}
        <div style={{
          background: css.surface,
          border: `0.8px solid ${searchQuery ? css.brand : css.border}`,
          borderRadius: 6,
          height: 38,
          width: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          transition: 'border-color 0.15s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
            <SearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search queues…"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: font.body,
                fontSize: 12,
                color: css.textPrimary,
                letterSpacing: '-0.012px',
                width: '100%',
                minWidth: 0,
              }}
            />
          </div>
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              style={{
                border: 'none',
                background: css.surfaceMuted,
                borderRadius: 4,
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                color: css.textTertiary,
                fontSize: 11,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          ) : (
            <div style={{
              background: css.surface,
              border: `0.8px solid ${css.border}`,
              borderRadius: 5,
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 10, color: css.textTertiary, fontFamily: font.body }}>⌘</span>
              <span style={{ fontSize: 9, color: css.textTertiary, fontFamily: font.body, fontWeight: 700, letterSpacing: '0.45px' }}>K</span>
            </div>
          )}
        </div>

        {/* Time filter tabs */}
        <div style={{ display: 'flex', height: 38 }}>
          {tabs.map((tab, i) => {
            const isActive = tab === 'Real Time'
            const isFirst = i === 0
            const isLast = i === tabs.length - 1
            return (
              <div
                key={tab}
                style={{
                  background: isActive ? css.brand : css.surface,
                  borderTop: `1px solid ${css.border}`,
                  borderBottom: `1px solid ${css.border}`,
                  borderLeft: (isFirst || isActive) ? `1px solid ${css.border}` : 'none',
                  borderRight: `1px solid ${css.border}`,
                  borderRadius: isFirst ? '4px 0 0 4px' : isLast ? '0 4px 4px 0' : 0,
                  marginLeft: isActive && !isFirst ? '-1px' : 0,
                  position: 'relative',
                  zIndex: isActive ? 1 : 0,
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
                  letterSpacing: '-0.012px',
                  whiteSpace: 'nowrap',
                }}>
                  {tab}
                </span>
                {isLast && <CaretDownIcon />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────

type PillConfig = { label: string; count: number; check?: boolean }

const pillConfigs: PillConfig[] = [
  { label: 'Favorites',    count: 2,  check: true },
  { label: 'Review',       count: 10 },
  { label: 'Eligibility',  count: 8  },
  { label: 'Closing',      count: 6  },
  { label: 'Fulfillment',  count: 5  },
  { label: 'Exceptions',   count: 3  },
  { label: 'Audit',        count: 2  },
  { label: 'View all',     count: 34 },
]

function FilterPills({ active, onChange, pills }: { active: string; onChange: (label: string) => void; pills: PillConfig[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {pills.map((pill) => {
        const isActive = pill.label === active
        return (
          <button
            key={pill.label}
            onClick={() => onChange(pill.label)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 100,
              border: isActive ? 'none' : `1px solid ${css.border}`,
              background: isActive ? css.textSecondary : css.surface,
              cursor: 'pointer',
              fontFamily: font.body,
              fontSize: 12,
              letterSpacing: '-0.012px',
              whiteSpace: 'nowrap',
            }}
          >
            {pill.check && isActive && <CheckIcon />}
            <span style={{ fontWeight: 700, color: isActive ? css.surface : css.warning }}>
              {pill.label}
            </span>
            <span style={{ fontWeight: 400, color: isActive ? css.surface : css.warning }}>
              {pill.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Queue Card ───────────────────────────────────────────────────────────────

type Stat = { label: string; value: string; sub: string }
type QueueCardProps = {
  title: string
  category: string
  favorite?: boolean
  badge: { text: string; type: 'danger' | 'info' }
  stats: [Stat, Stat]
  flow: { outflow: string; inflow: string }
  footer: { text: string; type: 'danger' | 'info' }
  onOpen?: () => void
  onToggleFavorite?: (e: React.MouseEvent) => void
  actioned?: boolean
}

function StatusBadge({ text, type }: { text: string; type: 'danger' | 'info' }) {
  const color = type === 'danger' ? css.danger : css.info
  const bg = type === 'danger' ? 'rgba(206,67,10,0.08)' : 'rgba(27,64,121,0.08)'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: bg,
      borderRadius: 100,
      padding: '3px 8px 3px 6px',
    }}>
      <AtRiskIcon color={color} />
      <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color, whiteSpace: 'nowrap' }}>
        {text}
      </span>
    </div>
  )
}

function StatColumn({ label, value, sub }: Stat) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontFamily: font.body,
        fontSize: 10,
        fontWeight: 600,
        color: css.textPrimary,
        letterSpacing: '0.7px',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: font.heading,
        fontSize: 20,
        fontWeight: 700,
        color: css.textPrimary,
        letterSpacing: '-0.08px',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{ fontFamily: font.body, fontSize: 9, color: css.textPrimary }}>
        {sub}
      </span>
    </div>
  )
}

function QueueCard({ title, favorite, badge, stats, flow, footer, onOpen, onToggleFavorite, actioned }: QueueCardProps) {
  const footerColor = actioned ? css.brand : footer.type === 'danger' ? css.danger : css.info
  const cardRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect || !overlayRef.current) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    overlayRef.current.style.background =
      `radial-gradient(380px circle at ${x}px ${y}px, rgba(98,148,96,0.09), transparent 70%)`
  }

  return (
    <div
      ref={cardRef}
      onClick={onOpen}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: css.surface,
        border: `1px solid ${css.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: onOpen ? 'pointer' : 'default',
        transform: hovered ? 'scale(1.018)' : 'scale(1)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
        boxShadow: hovered ? '0 6px 24px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      {/* gradient overlay — follows cursor */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 12,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <StarButton filled={!!favorite} onToggle={onToggleFavorite ?? (() => {})} />
        <StatusBadge text={badge.text} type={badge.type} />
      </div>

      <h2 style={{
        fontFamily: font.heading,
        fontSize: 18,
        fontWeight: 700,
        color: css.textPrimary,
        margin: 0,
        letterSpacing: '-0.05px',
      }}>
        {title}
      </h2>

      <div style={{ display: 'flex', gap: 24 }}>
        <StatColumn {...stats[0]} />
        <StatColumn {...stats[1]} />
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80 }}>
          <span style={{
            fontFamily: font.body,
            fontSize: 10,
            fontWeight: 600,
            color: css.textPrimary,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
          }}>
            Outflow
          </span>
          <span style={{
            fontFamily: font.heading,
            fontSize: 20,
            fontWeight: 700,
            color: css.textPrimary,
            letterSpacing: '-0.08px',
            lineHeight: 1,
          }}>
            {flow.outflow}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{
            fontFamily: font.body,
            fontSize: 10,
            fontWeight: 600,
            color: css.textPrimary,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
          }}>
            Inflow
          </span>
          <span style={{
            fontFamily: font.heading,
            fontSize: 20,
            fontWeight: 700,
            color: css.textPrimary,
            letterSpacing: '-0.08px',
            lineHeight: 1,
          }}>
            {flow.inflow}
          </span>
        </div>
      </div>

      <div style={{
        borderTop: `1px solid ${css.border}`,
        paddingTop: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 6,
      }}>
        {actioned ? (
          <span className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5.5" fill={css.brand} />
              <path d="M3.5 6L5.5 8L8.5 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: font.body, fontSize: 12, color: footerColor, fontWeight: 500 }}>
              Actioned · monitoring
            </span>
          </span>
        ) : (
          <>
            <span style={{ fontFamily: font.body, fontSize: 12, color: footerColor, fontWeight: 500 }}>
              {footer.text}
            </span>
            <ArrowRightIcon color={footerColor} />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Queue Data ───────────────────────────────────────────────────────────────

const allQueues: QueueCardProps[] = [
  // ── Review (10) ─────────────────────────────────────────────────────────────
  {
    title: 'Urgent Loan',
    category: 'Review',
    favorite: true,
    badge: { text: '14 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '1,402', sub: '+228 New Today' },
      { label: 'Avg. Process Time', value: '5.2h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '2,012', inflow: '228' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'New Purchase Applications',
    category: 'Review',
    badge: { text: '8 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '3,847', sub: '+312 New Today' },
      { label: 'Avg. Process Time', value: '3.8h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '298', inflow: '312' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Income Verification',
    category: 'Review',
    badge: { text: '22 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '612', sub: '+87 New Today' },
      { label: 'Avg. Process Time', value: '7.4h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '54', inflow: '87' },
    footer: { text: 'Backlogging', type: 'danger' },
  },
  {
    title: 'Employment History Review',
    category: 'Review',
    badge: { text: '11 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '441', sub: '+63 New Today' },
      { label: 'Avg. Process Time', value: '4.1h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '58', inflow: '63' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Credit Score Review',
    category: 'Review',
    badge: { text: '9 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '289', sub: '+44 New Today' },
      { label: 'Avg. Process Time', value: '6.8h', sub: 'vs 4.8h Target' },
    ],
    flow: { outflow: '31', inflow: '44' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Self-Employed Income Review',
    category: 'Review',
    badge: { text: '17 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '178', sub: '+29 New Today' },
      { label: 'Avg. Process Time', value: '8.2h', sub: 'vs 6.0h Target' },
    ],
    flow: { outflow: '22', inflow: '29' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Foreign National Review',
    category: 'Review',
    badge: { text: '4 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '94', sub: '+11 New Today' },
      { label: 'Avg. Process Time', value: '9.1h', sub: 'vs 9.0h Target' },
    ],
    flow: { outflow: '9', inflow: '11' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'VA Loan Review',
    category: 'Review',
    badge: { text: '5 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '521', sub: '+71 New Today' },
      { label: 'Avg. Process Time', value: '3.6h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '68', inflow: '71' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'FHA Loan Review',
    category: 'Review',
    badge: { text: '12 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '834', sub: '+108 New Today' },
      { label: 'Avg. Process Time', value: '4.4h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '104', inflow: '108' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Jumbo Loan Review',
    category: 'Review',
    badge: { text: '7 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '203', sub: '+31 New Today' },
      { label: 'Avg. Process Time', value: '7.6h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '24', inflow: '31' },
    footer: { text: 'Above target time', type: 'danger' },
  },

  // ── Eligibility (8) ─────────────────────────────────────────────────────────
  {
    title: 'Refinance',
    category: 'Eligibility',
    favorite: true,
    badge: { text: '47 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '2,341', sub: '+203 New Today' },
      { label: 'Avg. Process Time', value: '6.1h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '91', inflow: '203' },
    footer: { text: 'Needs attention', type: 'info' },
  },
  {
    title: 'Debt-to-Income Assessment',
    category: 'Eligibility',
    badge: { text: '19 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '734', sub: '+92 New Today' },
      { label: 'Avg. Process Time', value: '5.9h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '78', inflow: '92' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'LTV Eligibility Review',
    category: 'Eligibility',
    badge: { text: '13 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '489', sub: '+64 New Today' },
      { label: 'Avg. Process Time', value: '5.3h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '55', inflow: '64' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Condo & Co-op Approval',
    category: 'Eligibility',
    badge: { text: '6 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '167', sub: '+19 New Today' },
      { label: 'Avg. Process Time', value: '6.4h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '15', inflow: '19' },
    footer: { text: 'Within target', type: 'info' },
  },
  {
    title: 'Second Home Eligibility',
    category: 'Eligibility',
    badge: { text: '8 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '244', sub: '+28 New Today' },
      { label: 'Avg. Process Time', value: '4.8h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '25', inflow: '28' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Investment Property Eligibility',
    category: 'Eligibility',
    badge: { text: '11 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '312', sub: '+47 New Today' },
      { label: 'Avg. Process Time', value: '6.7h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '39', inflow: '47' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'ARM Eligibility Review',
    category: 'Eligibility',
    badge: { text: '3 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '198', sub: '+24 New Today' },
      { label: 'Avg. Process Time', value: '3.9h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '21', inflow: '24' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'USDA Loan Eligibility',
    category: 'Eligibility',
    badge: { text: '2 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '87', sub: '+9 New Today' },
      { label: 'Avg. Process Time', value: '4.6h', sub: 'vs 5.0h Target' },
    ],
    flow: { outflow: '8', inflow: '9' },
    footer: { text: 'Within target', type: 'info' },
  },

  // ── Closing (6) ─────────────────────────────────────────────────────────────
  {
    title: 'Title & Escrow Coordination',
    category: 'Closing',
    badge: { text: '14 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '891', sub: '+103 New Today' },
      { label: 'Avg. Process Time', value: '4.2h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '97', inflow: '103' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Final Disclosure Review',
    category: 'Closing',
    badge: { text: '16 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '423', sub: '+58 New Today' },
      { label: 'Avg. Process Time', value: '5.8h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '49', inflow: '58' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Clear to Close',
    category: 'Closing',
    badge: { text: '21 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '678', sub: '+84 New Today' },
      { label: 'Avg. Process Time', value: '6.3h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '71', inflow: '84' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Wire Transfer Authorization',
    category: 'Closing',
    badge: { text: '9 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '312', sub: '+38 New Today' },
      { label: 'Avg. Process Time', value: '2.8h', sub: 'vs 2.0h Target' },
    ],
    flow: { outflow: '34', inflow: '38' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Deed Recording',
    category: 'Closing',
    badge: { text: '7 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '544', sub: '+67 New Today' },
      { label: 'Avg. Process Time', value: '3.6h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '62', inflow: '67' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'Post-Close Document Verification',
    category: 'Closing',
    badge: { text: '18 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '1,124', sub: '+139 New Today' },
      { label: 'Avg. Process Time', value: '4.9h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '128', inflow: '139' },
    footer: { text: 'Within target', type: 'info' },
  },

  // ── Fulfillment (5) ─────────────────────────────────────────────────────────
  {
    title: 'Appraisal Scheduling',
    category: 'Fulfillment',
    badge: { text: '23 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '567', sub: '+74 New Today' },
      { label: 'Avg. Process Time', value: '8.9h', sub: 'vs 6.0h Target' },
    ],
    flow: { outflow: '61', inflow: '74' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Flood Zone Certification',
    category: 'Fulfillment',
    badge: { text: '4 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '234', sub: '+28 New Today' },
      { label: 'Avg. Process Time', value: '2.4h', sub: 'vs 3.0h Target' },
    ],
    flow: { outflow: '25', inflow: '28' },
    footer: { text: 'On track', type: 'info' },
  },
  {
    title: 'Insurance Verification',
    category: 'Fulfillment',
    badge: { text: '9 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '389', sub: '+47 New Today' },
      { label: 'Avg. Process Time', value: '3.7h', sub: 'vs 4.0h Target' },
    ],
    flow: { outflow: '43', inflow: '47' },
    footer: { text: 'Near target', type: 'info' },
  },
  {
    title: 'Survey & Title Search',
    category: 'Fulfillment',
    badge: { text: '12 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '445', sub: '+56 New Today' },
      { label: 'Avg. Process Time', value: '7.1h', sub: 'vs 5.5h Target' },
    ],
    flow: { outflow: '48', inflow: '56' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Conditions Clearance',
    category: 'Fulfillment',
    badge: { text: '31 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '812', sub: '+98 New Today' },
      { label: 'Avg. Process Time', value: '5.6h', sub: 'vs 4.2h Target' },
    ],
    flow: { outflow: '87', inflow: '98' },
    footer: { text: 'Backlogging', type: 'danger' },
  },

  // ── Exceptions (3) ──────────────────────────────────────────────────────────
  {
    title: 'Manual Underwrite Exception',
    category: 'Exceptions',
    badge: { text: '8 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '156', sub: '+22 New Today' },
      { label: 'Avg. Process Time', value: '11.3h', sub: 'vs 8.0h Target' },
    ],
    flow: { outflow: '18', inflow: '22' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'High-Risk Property Exception',
    category: 'Exceptions',
    badge: { text: '5 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '89', sub: '+13 New Today' },
      { label: 'Avg. Process Time', value: '9.7h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '10', inflow: '13' },
    footer: { text: 'Above target time', type: 'danger' },
  },
  {
    title: 'Non-Warrantable Condo Exception',
    category: 'Exceptions',
    badge: { text: '2 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '47', sub: '+6 New Today' },
      { label: 'Avg. Process Time', value: '8.4h', sub: 'vs 9.0h Target' },
    ],
    flow: { outflow: '5', inflow: '6' },
    footer: { text: 'Near target', type: 'info' },
  },

  // ── Audit (2) ───────────────────────────────────────────────────────────────
  {
    title: 'HMDA Compliance Audit',
    category: 'Audit',
    badge: { text: '24 approaching risk', type: 'info' },
    stats: [
      { label: 'Active Loans', value: '2,891', sub: '+187 New Today' },
      { label: 'Avg. Process Time', value: '6.2h', sub: 'vs 7.0h Target' },
    ],
    flow: { outflow: '174', inflow: '187' },
    footer: { text: 'Within target', type: 'info' },
  },
  {
    title: 'QC Post-Close Audit',
    category: 'Audit',
    badge: { text: '11 at risk', type: 'danger' },
    stats: [
      { label: 'Active Loans', value: '1,203', sub: '+148 New Today' },
      { label: 'Avg. Process Time', value: '5.4h', sub: 'vs 4.5h Target' },
    ],
    flow: { outflow: '135', inflow: '148' },
    footer: { text: 'Above target time', type: 'danger' },
  },
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Overview() {
  const navigate = useNavigate()
  const { actioned } = useQueueContext()
  const [activeFilter, setActiveFilter] = useState('Favorites')
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(allQueues.filter((q) => q.favorite).map((q) => q.title))
  )
  const [searchQuery, setSearchQuery] = useState('')

  function toggleFavorite(e: React.MouseEvent, title: string) {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(title) ? next.delete(title) : next.add(title)
      return next
    })
  }

  const pillConfigs_dynamic = pillConfigs.map((p) =>
    p.label === 'Favorites' ? { ...p, count: favorites.size } : p
  )

  const visibleQueues = (() => {
    const filtered = (() => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        return allQueues.filter((c) => c.title.toLowerCase().includes(q))
      }
      if (activeFilter === 'Favorites') return allQueues.filter((q) => favorites.has(q.title))
      if (activeFilter === 'View all')  return allQueues
      return allQueues.filter((q) => q.category === activeFilter)
    })()
    return [...filtered].sort((a, b) => {
      // 1. danger before info
      if (a.badge.type !== b.badge.type) return a.badge.type === 'danger' ? -1 : 1
      // 2. highest risk count first
      const aCount = parseInt(a.badge.text, 10) || 0
      const bCount = parseInt(b.badge.text, 10) || 0
      if (aCount !== bCount) return bCount - aCount
      // 3. backlogging (inflow > outflow) bubbles up within tier
      const toNum = (s: string) => parseInt(s.replace(/,/g, ''), 10) || 0
      const aBacklog = toNum(a.flow.inflow) > toNum(a.flow.outflow)
      const bBacklog = toNum(b.flow.inflow) > toNum(b.flow.outflow)
      if (aBacklog !== bBacklog) return aBacklog ? -1 : 1
      return 0
    })
  })()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterPills active={activeFilter} onChange={setActiveFilter} pills={pillConfigs_dynamic} />
      <div key={activeFilter + searchQuery} className="filter-enter" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {visibleQueues.length > 0 ? visibleQueues.map((q) => (
          <QueueCard
            key={q.title}
            {...q}
            favorite={favorites.has(q.title)}
            actioned={actioned.includes(q.title)}
            onToggleFavorite={(e) => toggleFavorite(e, q.title)}
            onOpen={() => navigate('/queue-monitor', { state: { queue: q.title } })}
          />
        )) : activeFilter === 'Favorites' && !searchQuery ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 360,
              width: '100%',
            }}>
              <FavoritesDemoGroup />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: css.textPrimary, textAlign: 'center' }}>
                  You have no favorite queues yet.
                </span>
                <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary, textAlign: 'center', lineHeight: 1.6 }}>
                  Select the favorite star in the queue card to get started.
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '48px 0', textAlign: 'center' }}>
            <span style={{ fontFamily: font.body, fontSize: 13, color: css.textTertiary }}>
              No queues match "{searchQuery}"
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
