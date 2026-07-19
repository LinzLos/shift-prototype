import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueueContext } from '../QueueContext'
import LiveIndicator from '../components/LiveIndicator'
import { queues, categories, type QueueDef } from '../data/queues'

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

function StarButton({ title, filled, onToggle }: { title: string; filled: boolean; onToggle: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={filled ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
      aria-pressed={filled}
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
      <svg width="20" height="20" viewBox="0 0 16 16" fill={filled ? 'var(--accent)' : 'none'}>
        <path
          d="M8 1.5L9.854 5.257L14 5.865L11 8.786L11.708 12.914L8 10.963L4.292 12.914L5 8.786L2 5.865L6.146 5.257L8 1.5Z"
          stroke="var(--accent)"
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
          style={{ display: 'block', fill: filled ? 'var(--accent)' : 'none', transition: 'fill 0.25s ease' }}
          className={phase === 'selected' ? 'star-jump-shake' : undefined}
        >
          <path d={STAR_PATH} stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
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

function HeaderBar({ searchQuery, onSearchChange, searchRef }: { searchQuery: string; onSearchChange: (v: string) => void; searchRef: React.RefObject<HTMLInputElement | null> }) {
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
        color: css.textPrimary,
        margin: 0,
      }}>
        Overview
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search — ⌘K focuses it */}
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
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search queues…"
              aria-label="Search queues"
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
              aria-label="Clear search"
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
            <div aria-hidden="true" style={{
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

        {/* Live status — Overview is real-time only by design */}
        <LiveIndicator tooltipBody={<>No historical replay. Use <strong style={{ color: css.textPrimary }}>Queue Monitor</strong> for time ranges.</>} />
      </div>
    </div>
  )
}

// ─── Filter Pills ─────────────────────────────────────────────────────────────

type PillConfig = { label: string; count: number; check?: boolean }

function FilterPills({ active, onChange, pills }: { active: string; onChange: (label: string) => void; pills: PillConfig[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {pills.map((pill) => {
        const isActive = pill.label === active
        return (
          <button
            key={pill.label}
            onClick={() => onChange(pill.label)}
            aria-pressed={isActive}
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
            <span style={{ fontWeight: 700, color: isActive ? css.surface : css.textSecondary }}>
              {pill.label}
            </span>
            <span style={{ fontWeight: 400, color: isActive ? css.surface : css.textTertiary }}>
              {pill.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Queue Card ───────────────────────────────────────────────────────────────

type QueueCardProps = QueueDef & {
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

function StatColumn({ label, value, sub }: { label: string; value: string; sub: string }) {
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
      onKeyDown={(e) => {
        if (onOpen && (e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
          e.preventDefault()
          onOpen()
        }
      }}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open ${title} in Queue Monitor` : undefined}
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
        <StarButton title={title} filled={!!favorite} onToggle={onToggleFavorite ?? (() => {})} />
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Overview() {
  const navigate = useNavigate()
  const { actioned } = useQueueContext()
  const [activeFilter, setActiveFilter] = useState('Favorites')
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(queues.filter((q) => q.favorite).map((q) => q.title))
  )
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // ⌘K / Ctrl+K focuses the queue search — the badge on the field promises it.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  function toggleFavorite(e: React.MouseEvent, title: string) {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  // Pill counts computed from the same data the cards render.
  const pillConfigs: PillConfig[] = [
    { label: 'Favorites', count: favorites.size, check: true },
    ...categories.map((c) => ({ label: c, count: queues.filter((q) => q.category === c).length })),
    { label: 'View all', count: queues.length },
  ]

  const searchActive = searchQuery.trim() !== ''

  const visibleQueues = (() => {
    const filtered = (() => {
      if (searchActive) {
        const q = searchQuery.trim().toLowerCase()
        return queues.filter((c) => c.title.toLowerCase().includes(q))
      }
      if (activeFilter === 'Favorites') return queues.filter((q) => favorites.has(q.title))
      if (activeFilter === 'View all')  return queues
      return queues.filter((q) => q.category === activeFilter)
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
      <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} searchRef={searchRef} />
      {/* Search overrides the category filter, so no pill shows as active while searching */}
      <FilterPills active={searchActive ? '' : activeFilter} onChange={(label) => { setSearchQuery(''); setActiveFilter(label) }} pills={pillConfigs} />
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
