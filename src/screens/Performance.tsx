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

function CaretDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4h8M3.5 6.5h5M5 9h2" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" />
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

function HeaderBar() {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{
          fontFamily: font.heading,
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: '-0.08px',
          color: css.textPrimary,
          margin: 0,
        }}>
          Performance
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
          fontFamily: font.body,
          fontSize: 12,
          color: css.textSecondary,
          fontWeight: 500,
        }}>
          Refinance
          <CaretDownIcon />
        </button>
      </div>

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
  )
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

type KpiCardProps = {
  label: string
  value: string
  sub: string
  subColor?: string
}

function KpiCard({ label, value, sub, subColor }: KpiCardProps) {
  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      flex: 1,
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: font.body,
        fontSize: 10,
        fontWeight: 600,
        color: css.textTertiary,
        letterSpacing: '0.7px',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: font.heading,
        fontSize: 28,
        fontWeight: 700,
        color: css.textPrimary,
        letterSpacing: '-0.1px',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontFamily: font.body,
        fontSize: 11,
        color: subColor ?? css.textTertiary,
      }}>
        {sub}
      </span>
    </div>
  )
}

// ─── Throughput Chart ─────────────────────────────────────────────────────────

function ThroughputChart() {
  const W = 600
  const H = 140
  const padL = 40
  const padR = 48
  const padT = 12
  const padB = 28

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const xLabels = ['12a', '9a', '12p', '1p', '2p', '3p', 'Now']
  const toX = (i: number) => padL + (i / (xLabels.length - 1)) * chartW

  // Loans completed (max 120) — left axis
  const loansData = [10, 30, 60, 70, 80, 88, 91]
  const loansMax = 120
  const toYLoans = (v: number) => padT + chartH - (v / loansMax) * chartH

  // Handle time avg in minutes (max 240) — right axis
  const handleData = [180, 160, 120, 100, 95, 90, 87]
  const handleMax = 240
  const toYHandle = (v: number) => padT + chartH - (v / handleMax) * chartH

  // Target pace (loans) — dashed line ~linear to 91
  const targetData = [0, 20, 45, 52, 62, 75, 91]

  const toPoints = (data: number[], toY: (v: number) => number) =>
    data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')

  const yLeftLabels = [0, 40, 80, 120]
  const yRightLabels = [0, 80, 160, 240]

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: font.heading, fontSize: 15, fontWeight: 700, color: css.textPrimary }}>
          Team throughput over time
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, background: 'var(--info)', borderRadius: 1 }} />
            <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>Loans completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 16, height: 2, background: css.textPrimary, borderRadius: 1 }} />
            <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>Handle time avg.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="4" viewBox="0 0 16 4">
              <path d="M0 2h4M6 2h4M12 2h4" stroke={css.textTertiary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>Target pace</span>
          </div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid lines */}
        {yLeftLabels.map((v) => (
          <line
            key={v}
            x1={padL} y1={toYLoans(v)}
            x2={W - padR} y2={toYLoans(v)}
            stroke={css.border} strokeWidth="0.8"
          />
        ))}

        {/* Y-axis left labels */}
        {yLeftLabels.map((v) => (
          <text
            key={v}
            x={padL - 6} y={toYLoans(v) + 4}
            textAnchor="end"
            fontFamily={font.body} fontSize="9" fill="var(--text-tertiary)"
          >{v}</text>
        ))}

        {/* Y-axis right labels */}
        {yRightLabels.map((v) => (
          <text
            key={v}
            x={W - padR + 6} y={toYHandle(v) + 4}
            textAnchor="start"
            fontFamily={font.body} fontSize="9" fill="var(--text-tertiary)"
          >{v}</text>
        ))}

        {/* X-axis labels */}
        {xLabels.map((label, i) => (
          <text
            key={label}
            x={toX(i)} y={H - 4}
            textAnchor="middle"
            fontFamily={font.body} fontSize="9" fill="var(--text-tertiary)"
          >{label}</text>
        ))}

        {/* Target pace dashed line */}
        <polyline
          points={toPoints(targetData, toYLoans)}
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />

        {/* Handle time line */}
        <polyline
          points={toPoints(handleData, toYHandle)}
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Loans completed line */}
        <polyline
          points={toPoints(loansData, toYLoans)}
          fill="none"
          stroke="#1b4079"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Endpoint dots */}
        <circle cx={toX(6)} cy={toYLoans(91)} r="4" fill="#1b4079" />
        <circle cx={toX(6)} cy={toYHandle(87)} r="4" fill="var(--text-primary)" />
      </svg>

      {/* Insight banner */}
      <div style={{
        marginTop: 12,
        background: 'var(--info-light)',
        border: '1px solid #afbcd0',
        borderRadius: 8,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="7" cy="7" r="6" stroke="#1b4079" strokeWidth="1.2" />
          <path d="M7 4.5V7.5" stroke="#1b4079" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="7" cy="9.5" r="0.6" fill="#1b4079" />
        </svg>
        <span style={{ fontFamily: font.body, fontSize: 12, color: 'var(--info)', lineHeight: 1.5 }}>
          Handle time has improved 12% since 9am — team is on track to meet today's target if current pace holds.
        </span>
      </div>
    </div>
  )
}

// ─── Performance Table ────────────────────────────────────────────────────────

type Specialist = {
  name: string
  completed: number
  handleDays: number
  vsTarget: number
}

const specialists: Specialist[] = [
  { name: 'Simone Adeyemi', completed: 14, handleDays: 3,  vsTarget: 61 },
  { name: 'Theo Bateman',   completed: 11, handleDays: 5,  vsTarget: 52 },
  { name: 'Steph Curry',    completed: 18, handleDays: 10, vsTarget: 47 },
  { name: 'Draymond Green', completed: 4,  handleDays: 12, vsTarget: 33 },
  { name: 'Jordan Marks',   completed: 3,  handleDays: 18, vsTarget: 28 },
  { name: 'Chris Navarro',  completed: 16, handleDays: 7,  vsTarget: 55 },
  { name: 'Chris Okonkwo',  completed: 12, handleDays: 22, vsTarget: 19 },
  { name: 'Chris Osei',     completed: 13, handleDays: 9,  vsTarget: 31 },
  { name: 'Dana Reyes',     completed: 5,  handleDays: 25, vsTarget: 14 },
  { name: 'Marcus Webb',    completed: 3,  handleDays: 11, vsTarget: 44 },
]

function HandlePill({ days }: { days: number }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: 'var(--warning-light)',
      border: '1px solid var(--warning-mid)',
      borderRadius: 100,
      padding: '2px 8px',
      fontFamily: font.body,
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--warning)',
      whiteSpace: 'nowrap',
    }}>
      {days}d
    </span>
  )
}

function VsTargetBar({ value }: { value: number }) {
  const color = value >= 50 ? css.brand : value >= 30 ? css.warning : css.danger
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 4, background: css.surfaceMuted, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary, minWidth: 32 }}>
        {value}%
      </span>
    </div>
  )
}

function PerformanceTable() {
  const colStyle = (flex?: number, minWidth?: number): React.CSSProperties => ({
    flex: flex ?? 1,
    minWidth,
    fontFamily: font.body,
    fontSize: 12,
    color: css.textSecondary,
  })

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Table header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: `1px solid ${css.border}`,
        gap: 16,
      }}>
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Specialist
          </span>
          <SortIcon />
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Completed
          </span>
        </div>
        <div style={{ flex: 1.5 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Handle time
          </span>
        </div>
        <div style={{ flex: 2 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: css.textTertiary, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            vs. Target
          </span>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: css.surfaceMuted,
          border: `0.8px solid ${css.border}`,
          borderRadius: 6,
          padding: '4px 10px',
          cursor: 'pointer',
          fontFamily: font.body,
          fontSize: 11,
          color: css.textSecondary,
        }}>
          <ColumnsIcon />
          Columns
        </button>
      </div>

      {/* Table rows */}
      {specialists.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            gap: 16,
            borderBottom: i < specialists.length - 1 ? `1px solid ${css.border}` : 'none',
            background: i % 2 === 0 ? css.surface : css.surfacePage,
          }}
        >
          <div style={{ flex: 2 }}>
            <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: css.textPrimary }}>
              {s.name}
            </span>
          </div>
          <div style={colStyle(1)}>
            <span style={{ fontFamily: font.heading, fontSize: 16, fontWeight: 700, color: css.textPrimary }}>
              {s.completed}
            </span>
          </div>
          <div style={{ flex: 1.5 }}>
            <HandlePill days={s.handleDays} />
          </div>
          <div style={{ flex: 2 }}>
            <VsTargetBar value={s.vsTarget} />
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        borderTop: `1px solid ${css.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          Showing 10 of 14
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

export default function Performance() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <KpiCard
          label="Loans Completed"
          value="91"
          sub="+14 vs yesterday"
          subColor={css.brand}
        />
        <KpiCard
          label="Handle Time Avg."
          value="6.1h"
          sub="Target 4.2h"
          subColor={css.danger}
        />
        <KpiCard
          label="Team Target"
          value="61%"
          sub="8 of 14 members on target"
        />
        <KpiCard
          label="Idle Time Avg."
          value="3.4h"
          sub="2 members > 5h idle"
          subColor={css.warning}
        />
        <KpiCard
          label="Rework Rate"
          value="2.1%"
          sub="Down from 3.4% last week"
          subColor={css.brand}
        />
      </div>

      <ThroughputChart />
      <PerformanceTable />
    </div>
  )
}
