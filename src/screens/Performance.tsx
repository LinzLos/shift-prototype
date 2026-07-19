import LedgerChart from '../components/LedgerChart'
import LiveIndicator from '../components/LiveIndicator'
import { useQueueContext } from '../QueueContext'
import { assignedTo, team, DAILY_TARGET } from '../data/team'

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

const TARGET_HANDLE_HOURS = 4.2

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
          Performance
        </h1>
        {/* Queue scope label — performance stats are Refinance-scoped in this prototype */}
        <span style={{
          fontFamily: font.body,
          fontSize: 12,
          color: css.textSecondary,
          fontWeight: 500,
        }}>
          Refinance
        </span>
      </div>

      {/* Today's stats only — no historical performance data is kept here */}
      <LiveIndicator tooltipBody={<>Showing today's stats. Use <strong style={{ color: css.textPrimary }}>Queue Monitor</strong> for time ranges.</>} />
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

function ThroughputChart({ completedToday, handleAvg }: { completedToday: number; handleAvg: number }) {
  const xLabels = ['12a', '9a', '12p', '1p', '2p', '3p', 'Now']
  // Cumulative completions through the day, ending at today's total.
  const loansData = [0.11, 0.33, 0.66, 0.77, 0.88, 0.97, 1].map((f) => Math.round(f * completedToday))
  // Handle time per loan (hours) declining toward the current average.
  const handleData = [1.13, 1.11, 1.08, 1.05, 1.03, 1.02, 1].map((f) => Math.round(f * handleAvg * 10) / 10)
  const targetData = [0, 0.22, 0.49, 0.57, 0.68, 0.82, 1].map((f) => Math.round(f * completedToday))
  const improvedPct = Math.round(((handleData[1] - handleData[6]) / handleData[1]) * 100)

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
      </div>

      <LedgerChart
        xLabels={xLabels}
        viewW={600}
        viewH={170}
        left={{ min: 0, max: 120, ticks: [0, 40, 80, 120] }}
        right={{ min: 0, max: 12, ticks: [0, 4, 8, 12], format: (v) => `${v}h` }}
        series={[
          { label: 'Loans completed',  values: loansData,  color: 'var(--chart-blue)', variant: 'area' },
          { label: 'Handle time avg.', values: handleData, color: 'var(--text-primary)', variant: 'dashed', axis: 'right', format: (v) => `${v}h` },
          { label: 'Target pace',      values: targetData, color: 'var(--border-strong)', variant: 'reference' },
        ]}
      />

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
          Handle time has improved {improvedPct}% since 9am — team is on track to meet today's target if current pace holds.
        </span>
      </div>
    </div>
  )
}

// ─── Performance Table ────────────────────────────────────────────────────────

function HandlePill({ hours }: { hours: number | null }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: hours == null ? css.surfacePage : 'var(--warning-light)',
      border: hours == null ? `1px solid ${css.border}` : '1px solid var(--warning-mid)',
      borderRadius: 100,
      padding: '2px 8px',
      fontFamily: font.body,
      fontSize: 11,
      fontWeight: 500,
      color: hours == null ? css.textTertiary : 'var(--warning)',
      whiteSpace: 'nowrap',
    }}>
      {hours == null ? '—' : `${hours}h`}
    </span>
  )
}

function VsTargetBar({ value }: { value: number | null }) {
  if (value == null) {
    return <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>Just assigned</span>
  }
  const color = value >= 100 ? css.brand : value >= 50 ? css.warning : css.danger
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 80, height: 4, background: css.surfaceMuted, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(value, 100)}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: font.body, fontSize: 12, color: css.textSecondary, minWidth: 32 }}>
        {value}%
      </span>
    </div>
  )
}

type PerfRow = {
  name: string
  completed: number | null
  handleHours: number | null
  vsTarget: number | null
}

function PerformanceTable({ rows }: { rows: PerfRow[] }) {
  const th: React.CSSProperties = {
    fontFamily: font.body, fontSize: 11, fontWeight: 600,
    color: css.textTertiary, letterSpacing: '0.5px', textTransform: 'uppercase',
  }

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
        <div style={{ flex: 2 }}>
          <span style={th}>Specialist</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={th}>Completed</span>
        </div>
        <div style={{ flex: 1.5 }}>
          <span style={th}>Handle time</span>
        </div>
        <div style={{ flex: 2 }}>
          <span style={th}>vs. Target ({DAILY_TARGET}/day)</span>
        </div>
      </div>

      {/* Table rows */}
      {rows.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 20px',
            gap: 16,
            borderBottom: i < rows.length - 1 ? `1px solid ${css.border}` : 'none',
            background: i % 2 === 0 ? css.surface : css.surfacePage,
          }}
        >
          <div style={{ flex: 2 }}>
            <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 500, color: css.textPrimary }}>
              {s.name}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontFamily: font.heading, fontSize: 16, fontWeight: 700, color: css.textPrimary }}>
              {s.completed == null ? '—' : s.completed}
            </span>
          </div>
          <div style={{ flex: 1.5 }}>
            <HandlePill hours={s.handleHours} />
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
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary }}>
          Showing all {rows.length} specialists on Refinance
        </span>
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Performance() {
  const { transfers } = useQueueContext()
  const members = assignedTo('Refinance')

  // Every number below is computed from the same team data the table renders,
  // so the KPIs can't disagree with the rows.
  const completedToday = members.reduce((n, m) => n + m.completedToday, 0)
  const handleAvg = Math.round((members.reduce((n, m) => n + m.handleHours, 0) / members.length) * 10) / 10
  const onTarget = members.filter((m) => m.completedToday >= DAILY_TARGET).length
  const teamTargetPct = Math.round((onTarget / members.length) * 100)

  const rows: PerfRow[] = [
    // Transferred specialists show up immediately, with no stats yet.
    ...transfers
      .map((name) => team.find((m) => m.name === name))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .map((m) => ({ name: m.name, completed: null, handleHours: null, vsTarget: null })),
    ...members.map((m) => ({
      name: m.name,
      completed: m.completedToday,
      handleHours: m.handleHours,
      vsTarget: Math.round((m.completedToday / DAILY_TARGET) * 100),
    })),
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar />

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 12 }}>
        <KpiCard
          label="Loans Completed"
          value={`${completedToday}`}
          sub="+14 vs yesterday"
          subColor={css.brand}
        />
        <KpiCard
          label="Handle Time Avg."
          value={`${handleAvg}h`}
          sub={`Target ${TARGET_HANDLE_HOURS}h`}
          subColor={handleAvg > TARGET_HANDLE_HOURS ? css.danger : css.brand}
        />
        <KpiCard
          label="Team Target"
          value={`${teamTargetPct}%`}
          sub={`${onTarget} of ${members.length} members on target`}
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

      <ThroughputChart completedToday={completedToday} handleAvg={handleAvg} />
      <PerformanceTable rows={rows} />
    </div>
  )
}
