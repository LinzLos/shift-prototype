import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RosterModal from '../components/RosterModal'
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

function CaretDownIcon({ color }: { color?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M3 4.5L6 7.5L9 4.5" stroke={color ?? css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendUpIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M1 8L4 4.5L6.5 6.5L9 2" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1L8.5 2.5V5C8.5 7 5 9 5 9C5 9 1.5 7 1.5 5V2.5L5 1Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function AlertCriticalIcon({ color }: { color: string }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="4.5" stroke={color} strokeWidth="1.2" />
      <path d="M5 3V5.5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="5" cy="7" r="0.6" fill={color} />
    </svg>
  )
}

// ─── Header Bar ──────────────────────────────────────────────────────────────

const queueRisk: Record<string, { label: string; type: 'danger' | 'info' }> = {
  'Refinance':    { label: '47 loans approaching risk', type: 'info'   },
  'Urgent Loan':  { label: '14 loans at risk',          type: 'danger' },
}

function HeaderBar({ queue, activeTab, onTabChange, customLabel, showDatePicker, onDatePickerApply, onDatePickerCancel }: {
  queue: string
  activeTab: string
  onTabChange: (tab: string) => void
  customLabel: string | null
  showDatePicker: boolean
  onDatePickerApply: (from: string, to: string) => void
  onDatePickerCancel: () => void
}) {
  const tabs = ['Real Time', '1d', 'Week', 'Month', 'Custom']
  const risk = queueRisk[queue]
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontFamily: font.heading,
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '-0.08px',
            color: css.textPrimary,
          }}>
            Queue Monitor
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 10px' }}>
            <span style={{
              fontFamily: font.heading,
              fontWeight: 600,
              fontSize: 16,
              letterSpacing: '-0.048px',
              color: css.textTertiary,
            }}>
              {queue}
            </span>
            <CaretDownIcon color={css.textTertiary} />
          </div>
        </div>
        {risk && (
          <span style={{
            fontFamily: font.body,
            fontSize: 11,
            fontWeight: 500,
            color: risk.type === 'danger' ? css.danger : css.info,
            paddingLeft: 2,
          }}>
            {risk.label}
          </span>
        )}
      </div>

      <div style={{ position: 'relative', display: 'flex', height: 38 }}>
        {tabs.map((tab, i) => {
          const isActive = tab === activeTab
          const isRTTab = tab === 'Real Time'
          const isFirst = i === 0
          const isLast = i === tabs.length - 1

          const bg = isActive ? (isRTTab ? css.brand : css.surface) : css.surface
          const textColor = isActive ? (isRTTab ? css.surface : css.textSecondary) : css.textTertiary
          const borderColor = isActive && !isRTTab ? css.textSecondary : css.border

          const displayLabel = (tab === 'Custom' && customLabel) ? customLabel : tab

          return (
            <div
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                background: bg,
                borderTop: `1px solid ${borderColor}`,
                borderBottom: `1px solid ${borderColor}`,
                borderLeft: (isFirst || isActive) ? `1px solid ${borderColor}` : 'none',
                borderRight: `1px solid ${borderColor}`,
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
                fontWeight: isActive ? 600 : 400,
                color: textColor,
                letterSpacing: '-0.012px',
                whiteSpace: 'nowrap',
              }}>
                {displayLabel}
              </span>
              {isLast && <CaretDownIcon />}
            </div>
          )
        })}
        {showDatePicker && (
          <CustomDatePicker onApply={onDatePickerApply} onCancel={onDatePickerCancel} />
        )}
      </div>
    </div>
  )
}

// ─── Custom Date Picker ───────────────────────────────────────────────────────

function CustomDatePicker({ onApply, onCancel }: { onApply: (from: string, to: string) => void; onCancel: () => void }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const canApply = from && to && from <= to

  const inputStyle: React.CSSProperties = {
    width: '100%', border: `1px solid ${css.border}`, borderRadius: 6,
    padding: '6px 8px', fontFamily: font.body, fontSize: 12,
    color: css.textPrimary, background: css.surface, outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    fontFamily: font.body, fontSize: 9, fontWeight: 600,
    color: css.textTertiary, letterSpacing: '0.5px',
    textTransform: 'uppercase', display: 'block', marginBottom: 4,
  }

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      background: css.surface, border: `1px solid ${css.border}`,
      borderRadius: 10, padding: 16, zIndex: 300,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      display: 'flex', flexDirection: 'column', gap: 12,
      minWidth: 240,
    }}
      className="modal-enter"
      onClick={(e) => e.stopPropagation()}
    >
      <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 13, color: css.textPrimary }}>
        Custom range
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={labelStyle}>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: `1px solid ${css.border}`, borderRadius: 6,
            padding: '5px 12px', cursor: 'pointer',
            fontFamily: font.body, fontSize: 11, color: css.textSecondary,
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => canApply && onApply(from, to)}
          style={{
            background: canApply ? css.brand : css.surfaceMuted,
            border: 'none', borderRadius: 6,
            padding: '5px 12px', cursor: canApply ? 'pointer' : 'default',
            fontFamily: font.body, fontSize: 11, fontWeight: 700,
            color: canApply ? 'var(--text-inverse)' : css.textTertiary,
          }}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

// ─── Historical Mode Banner ────────────────────────────────────────────────────

function HistoricalBanner({ tab }: { tab: string }) {
  return (
    <div style={{
      background: 'var(--info-light)',
      border: '1px solid #AFBCD0',
      borderRadius: 8,
      padding: '9px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#1B4079" strokeWidth="1.2" />
        <path d="M7 4V7.5L9 9" stroke="#1B4079" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: 'var(--info)' }}>
        Viewing {tab} data · Actions unavailable in historical view
      </span>
    </div>
  )
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

type BadgeVariant = 'warning' | 'danger' | 'none'
type KpiCardProps = {
  label: string
  value: string
  sub: string
  badge?: { text: string; variant: BadgeVariant }
}

const badgeStyles: Record<BadgeVariant, { bg: string; color: string }> = {
  warning: { bg: 'var(--warning-light)', color: css.warning },
  danger:  { bg: 'rgba(206,67,10,0.08)', color: css.danger },
  none:    { bg: 'transparent', color: 'transparent' },
}

function KpiCard({ label, value, sub, badge }: KpiCardProps) {
  const bv = badge?.variant ?? 'none'
  const bs = badgeStyles[bv]
  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 16,
      padding: 12,
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
        {badge && bv !== 'none' && (
          <span style={{
            fontFamily: font.body,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.45px',
            color: bs.color,
            background: bs.bg,
            borderRadius: 100,
            padding: '4px 6px',
          }}>
            {badge.text}
          </span>
        )}
      </div>
      <div>
        <div style={{
          fontFamily: font.heading,
          fontSize: 20,
          fontWeight: 700,
          color: css.textPrimary,
          letterSpacing: '-0.08px',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          {value}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendUpIcon color={css.textTertiary} />
          <span style={{ fontFamily: font.body, fontSize: 9, color: css.textTertiary }}>
            {sub}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Period data ──────────────────────────────────────────────────────────────

type ChartData = { xLabels: string[]; outflow: number[]; inflow: number[]; bannerText: string; bannerStat: string }
type CapacityData = { load: number; gap: number }

type PeriodConfig = {
  kpis: KpiCardProps[]
  chart: ChartData
  alerts: AlertItem[]
  capacity: CapacityData
}

const periodConfig: Record<string, PeriodConfig> = {
  'Real Time': {
    kpis: [
      { label: 'Active Loans',      value: '2,341', sub: '+18 in last 15 min',        badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Process Time Avg.', value: '6.1 h', sub: 'Target 4.2h · +1.9h over', badge: { text: 'Breaching',    variant: 'danger'  } },
      { label: 'Net Flow',          value: '-112',  sub: '+203 in · -91 out',         badge: { text: 'Backlogging',  variant: 'danger'  } },
    ],
    chart: {
      xLabels: ['12a', '9a', '12p', '1p', '2p', '3p', 'Now'],
      outflow: [110, 115, 120, 125, 128, 132, 140],
      inflow:  [105, 115, 130, 148, 165, 185, 205],
      bannerText: 'Backlog growing – Inflow has exceeded Outflow for 4 straight days',
      bannerStat: '+112 net today',
    },
    alerts: [
      { title: '14 loans within 5 days of closing',               body: 'Tighten closing threshold.',  variant: 'critical', cta: { label: 'See loan details', action: 'loans' } },
      { title: 'Inflow outpacing outflow for 4 consecutive days',  body: 'Rebalance specialist load.', variant: 'critical', cta: { label: 'Reassign Staff', action: 'reassign' } },
      { title: '2 specialists consistently idle',                  body: 'Review Roster assignments.', variant: 'warning',  cta: { label: 'Go to Roster',   action: 'roster'   } },
    ],
    capacity: { load: 130, gap: 45 },
  },
  '1d': {
    kpis: [
      { label: 'Active Loans',      value: '2,254', sub: '+12 from prior day',         badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Process Time Avg.', value: '5.9 h', sub: 'Target 4.2h · +1.7h over',  badge: { text: 'Breaching',    variant: 'danger'  } },
      { label: 'Net Flow',          value: '-89',   sub: '+194 in · -105 out',          badge: { text: 'Backlogging',  variant: 'danger'  } },
    ],
    chart: {
      xLabels: ['12a', '4a', '8a', '12p', '4p', '8p', '12a'],
      outflow: [98, 102, 108, 115, 120, 118, 112],
      inflow:  [95, 100, 108, 118, 135, 152, 165],
      bannerText: 'Backlog grew – Inflow exceeded Outflow across the full day',
      bannerStat: '+89 net yesterday',
    },
    alerts: [
      { title: '11 loans were within 5 days of closing',           body: 'Closing threshold was under pressure.',    variant: 'critical' },
      { title: 'Inflow outpaced outflow for 3 consecutive days',   body: 'Specialist load was imbalanced.',          variant: 'critical' },
      { title: '3 specialists running below target load',          body: 'Idle capacity was not redistributed.',     variant: 'warning'  },
    ],
    capacity: { load: 122, gap: 37 },
  },
  'Week': {
    kpis: [
      { label: 'Active Loans',      value: '2,108', sub: 'Weekly avg · +233 vs last week', badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Process Time Avg.', value: '5.4 h', sub: 'Target 4.2h · +1.2h avg over',  badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Net Flow',          value: '-312',  sub: 'Cumulative this week',            badge: { text: 'Backlogging',  variant: 'danger'  } },
    ],
    chart: {
      xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      outflow: [95, 98, 102, 108, 114, 112, 118],
      inflow:  [92, 112, 120, 126, 132, 130, 140],
      bannerText: 'Weekly backlog – Inflow exceeded Outflow across 6 of 7 days',
      bannerStat: '+312 net this week',
    },
    alerts: [
      { title: 'Backlog grew by 312 loans over 7 days',            body: 'Sustained inflow pressure building.',      variant: 'critical' },
      { title: 'Process time averaged 1.2h above target',          body: 'Specialist throughput below required pace.',variant: 'critical' },
      { title: 'Peak inflow on Tuesday — 241 loans in one day',    body: 'No surge capacity was activated.',          variant: 'warning'  },
    ],
    capacity: { load: 108, gap: 23 },
  },
  'Month': {
    kpis: [
      { label: 'Active Loans',      value: '1,847', sub: 'Monthly avg · trending up',      badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Process Time Avg.', value: '4.9 h', sub: 'Target 4.2h · +0.7h avg over',  badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Net Flow',          value: '-891',  sub: 'Cumulative this month',           badge: { text: 'Backlogging',  variant: 'danger'  } },
    ],
    chart: {
      xLabels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 28'],
      outflow: [88, 92, 98, 104, 112],
      inflow:  [85, 92, 100, 114, 128],
      bannerText: 'Monthly trend – Inflow exceeded Outflow in 19 of 28 days',
      bannerStat: '+891 net this month',
    },
    alerts: [
      { title: 'Cumulative backlog reached 891 loans this month',  body: 'Monthly capacity gap widening.',            variant: 'warning'  },
      { title: 'Process time trended upward all month',            body: 'Now 0.7h above monthly target avg.',        variant: 'warning'  },
      { title: 'Inflow exceeded outflow in 19 of 28 days',         body: 'Structural imbalance — not a spike.',       variant: 'warning'  },
    ],
    capacity: { load: 94, gap: 9 },
  },
  'Custom': {
    kpis: [
      { label: 'Active Loans',      value: '2,041', sub: 'Avg over selected range',        badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Process Time Avg.', value: '5.2 h', sub: 'Target 4.2h · +1.0h avg over',  badge: { text: 'Above target', variant: 'warning' } },
      { label: 'Net Flow',          value: '-544',  sub: 'Cumulative over range',           badge: { text: 'Backlogging',  variant: 'danger'  } },
    ],
    chart: {
      xLabels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 28'],
      outflow: [90, 95, 100, 108, 115],
      inflow:  [88, 96, 106, 118, 132],
      bannerText: 'Selected range – Inflow exceeded Outflow across most of the period',
      bannerStat: '+544 net over range',
    },
    alerts: [
      { title: 'Backlog accumulated 544 loans over selected range', body: 'Inflow consistently above outflow.',        variant: 'warning'  },
      { title: 'Process time averaged 1.0h above target',          body: 'Throughput gap present throughout range.',   variant: 'warning'  },
      { title: 'Load imbalance detected in 2 specialists',         body: 'Persistent idle capacity not redeployed.',   variant: 'warning'  },
    ],
    capacity: { load: 100, gap: 15 },
  },
}

// ─── Chart ────────────────────────────────────────────────────────────────────

function InflowOutflowChart({ data }: { data: ChartData }) {
  const W = 480
  const H = 160
  const padL = 36
  const padR = 12
  const padT = 12
  const padB = 24
  const cW = W - padL - padR
  const cH = H - padT - padB

  const { xLabels, outflow, inflow, bannerText, bannerStat } = data
  const allVals = [...outflow, ...inflow]
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)
  const maxY = Math.ceil((maxVal + 20) / 50) * 50
  const minY = Math.max(0, Math.floor((minVal - 15) / 25) * 25)
  const yRange = maxY - minY
  const yLeft = [1, 2, 3].map(n => Math.round(minY + (yRange * n) / 4))
  const target = xLabels.map(() => 108)

  function toX(i: number) { return padL + (i / (xLabels.length - 1)) * cW }
  function toY(v: number)  { return padT + cH - ((v - minY) / (maxY - minY)) * cH }

  function pts(arr: number[]) {
    return arr.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
  }
  function pathD(arr: number[]) {
    return arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ')
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Inflow',      dot: '#5B9BD5', dashed: false },
          { label: 'Outflow',     dot: '#333',    dashed: false },
          { label: 'Target pace', dot: '#aaa',    dashed: true  },
        ].map(({ label, dot, dashed }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {dashed
              ? <svg width="14" height="8"><line x1="0" y1="4" x2="14" y2="4" stroke={dot} strokeWidth="1.5" strokeDasharray="3 2" /></svg>
              : <svg width="8" height="8"><circle cx="4" cy="4" r="3" fill={dot} /></svg>
            }
            <span style={{ fontFamily: font.body, fontSize: 10, color: css.textTertiary }}>{label}</span>
          </div>
        ))}
      </div>

      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {yLeft.map((v) => (
          <g key={v}>
            <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={css.border} strokeWidth="0.5" strokeDasharray="3 3" />
            <text x={padL - 5} y={toY(v) + 4} textAnchor="end" style={{ fontFamily: font.body, fontSize: 9, fill: css.textTertiary }}>{v}</text>
          </g>
        ))}

        {xLabels.map((l, i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - 4}
            textAnchor={i === 0 ? 'start' : i === xLabels.length - 1 ? 'end' : 'middle'}
            style={{ fontFamily: font.body, fontSize: 9, fill: css.textTertiary }}
          >
            {l}
          </text>
        ))}

        <polyline points={pts(target)} fill="none" stroke="#aaa" strokeWidth="1" strokeDasharray="4 3" />

        <path d={pathD(outflow)} fill="none" stroke="#1E1918" strokeWidth="1.5" strokeLinejoin="round" />
        {outflow.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="2.5" fill={css.surface} stroke="#1E1918" strokeWidth="1.2" />
        ))}

        <path d={pathD(inflow)} fill="none" stroke="#5B9BD5" strokeWidth="1.5" strokeLinejoin="round" />
        {inflow.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="2.5" fill={css.surface} stroke="#5B9BD5" strokeWidth="1.2" />
        ))}
      </svg>

      <div style={{
        marginTop: 12,
        background: 'rgba(206,67,10,0.06)',
        border: `1px solid rgba(206,67,10,0.2)`,
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color: css.danger }}>
          {bannerText}
        </span>
        <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color: css.danger, whiteSpace: 'nowrap' }}>
          {bannerStat}
        </span>
      </div>
    </div>
  )
}

// ─── Alerts Card ─────────────────────────────────────────────────────────────

type AlertItem = {
  title: string
  body: string
  variant: 'critical' | 'warning'
  cta?: { label: string; action: 'reassign' | 'roster' | 'loans' }
}


const alertVariantStyles = {
  critical: { bg: 'var(--danger-light)', border: 'var(--danger-mid)', titleColor: css.danger  },
  warning:  { bg: 'var(--warning-light)', border: 'var(--warning-mid)', titleColor: css.warning },
}

function AlertsCard({ onReassign, onRoster, onLoans, transferred, isRealTime, periodAlerts, chartData }: { onReassign: () => void; onRoster: () => void; onLoans: () => void; transferred: string[]; isRealTime: boolean; periodAlerts: AlertItem[]; chartData: ChartData }) {
  const staffActioned = transferred.length > 0
  const items = periodAlerts

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 14, color: css.textPrimary }}>
        Alerts
      </span>


      {items.map((a) => {
        const isResolved = a.cta?.action === 'reassign' && staffActioned
        const s = alertVariantStyles[a.variant]
        const ctaColor = a.variant === 'critical' ? css.danger : css.warning
        const handleCta = a.cta?.action === 'reassign' ? onReassign : a.cta?.action === 'loans' ? onLoans : onRoster
        // Loans drill-down is read-only — available in every time range; staffing actions stay real-time only.
        const showCta = !!a.cta && (isRealTime || a.cta.action === 'loans')

        if (isResolved) {
          return (
            <div
              key={a.title}
              className="fade-up"
              style={{
                background: 'rgba(98,148,96,0.07)',
                border: '1px solid var(--brand-mid)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4.5" fill="#629460" />
                  <path d="M3 5L4.5 6.5L7.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: font.body, fontSize: 13, fontWeight: 700,
                  color: 'var(--brand-dark)', lineHeight: 1.25, marginBottom: 2,
                }}>
                  {a.title}
                </div>
                <div style={{ fontFamily: font.body, fontSize: 12, color: 'var(--brand-dark)', lineHeight: 1.5 }}>
                  Specialist load rebalanced — monitoring
                </div>
                <span style={{
                  display: 'inline-block', marginTop: 6,
                  fontFamily: font.body, fontSize: 10, fontWeight: 600,
                  color: 'var(--brand)', letterSpacing: '0.3px',
                }}>
                  Actioned · just now
                </span>
              </div>
            </div>
          )
        }

        return (
          <div
            key={a.title}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              {a.variant === 'critical' ? <AlertCriticalIcon color={css.danger} /> : <ShieldIcon color={css.warning} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: font.body, fontSize: 13, fontWeight: 700,
                color: s.titleColor, lineHeight: 1.25, marginBottom: 2,
              }}>
                {a.title}
              </div>
              <div style={{ fontFamily: font.body, fontSize: 13, color: css.textSecondary, lineHeight: 1.5 }}>
                {a.body}
              </div>
              {a.cta && showCta && (
                <button
                  onClick={handleCta}
                  style={{
                    marginTop: 8, background: 'none',
                    border: `1px solid ${ctaColor}`, borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer',
                    fontFamily: font.body, fontSize: 11, fontWeight: 700,
                    color: ctaColor, display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {a.cta.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5H8M8 5L5.5 2.5M8 5L5.5 7.5" stroke={ctaColor} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Chart — evidence for the inflow/outflow alert */}
      <div style={{ borderTop: `1px solid ${css.border}`, paddingTop: 12 }}>
        <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 13, color: css.textPrimary }}>
          Inflow vs. Outflow
        </span>
        <div style={{ marginTop: 10 }}>
          <InflowOutflowChart data={chartData} />
        </div>
      </div>
    </div>
  )
}

// ─── Rankings Card ────────────────────────────────────────────────────────────

type RankingFactor = {
  name: string
  fill: number
  activeConditions: string[]
}

const rankingFactors: RankingFactor[] = [
  {
    name: 'Closing Timeline', fill: 0.74,
    activeConditions: ['Closing ≤ 30 days'],
  },
  {
    name: 'Processing Status', fill: 0.62,
    activeConditions: ['LTV ≥ 80%', 'Time in queue > 48 hrs'],
  },
  {
    name: 'Loan Risk Profile', fill: 0.50,
    activeConditions: ['DTI ≥ 43%'],
  },
  {
    name: 'Documentation Status', fill: 0.38,
    activeConditions: ['Income unverified'],
  },
]

function ProgressBar({ fill }: { fill: number }) {
  return (
    <div style={{
      height: 4,
      background: '#d9d9d9',
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: `${fill * 100}%`,
        background: 'linear-gradient(to right, #bfc7d4, #8195b5)',
        borderRadius: 12,
      }} />
    </div>
  )
}


function RankingsCard() {
  const [open, setOpen] = useState(false)
  const totalActiveConditions = rankingFactors.reduce((n, f) => n + f.activeConditions.length, 0)

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Header — always visible, click to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%',
        }}
      >
        <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 14, color: css.textPrimary }}>
          What's driving rankings
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>Ranking rules</span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Summary banner — always visible */}
      <div style={{
        background: css.surfacePage,
        border: `1px solid ${css.border}`,
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: css.textSecondary, lineHeight: 1.5 }}>
          <strong style={{ color: css.textPrimary }}>{totalActiveConditions} conditions</strong> actively pushing loans to the top of this queue across <strong style={{ color: css.textPrimary }}>{rankingFactors.length} risk factors</strong>
        </span>
      </div>

      {/* Ranking factors — only when expanded */}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rankingFactors.map((f) => (
            <div key={f.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: css.textPrimary }}>
                {f.name}
              </span>
              <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>
                {Math.round(f.fill * 100)}% ranking influence
              </span>
              {f.activeConditions.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {f.activeConditions.map((label) => (
                    <span key={label} style={{
                      fontFamily: font.body, fontSize: 9, fontWeight: 700,
                      letterSpacing: '0.45px', color: 'var(--brand-dark)', background: 'var(--brand-light)',
                      border: '0.8px solid var(--brand-mid)', borderRadius: 6,
                      padding: '4px 8px', whiteSpace: 'nowrap',
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Capacity Card ────────────────────────────────────────────────────────────

type Specialist = { name: string; loans: string; fill: number; queue: string }

const allSpecialists: Specialist[] = [
  { name: 'Simone Adeyemi', loans: '148 loans', fill: 0.74, queue: 'Refinance' },
  { name: 'Theo Bateman',   loans: '141 loans', fill: 0.68, queue: 'Refinance' },
  { name: 'Steph Curry',    loans: '130 loans', fill: 0.62, queue: 'Refinance' },
  { name: 'Draymond Green', loans: '121 loans', fill: 0.58, queue: 'Refinance' },
  { name: 'Jordan Marks',   loans: '112 loans', fill: 0.54, queue: 'Refinance' },
  { name: 'Chris Navarro',  loans: '108 loans', fill: 0.52, queue: 'Refinance' },
  { name: 'Priya Okonkwo',  loans: '98 loans',  fill: 0.47, queue: 'Refinance' },
  { name: 'Yemi Osei',      loans: '91 loans',  fill: 0.44, queue: 'Refinance' },
  { name: 'Dana Reyes',     loans: '86 loans',  fill: 0.41, queue: 'Refinance' },
  { name: 'Marcus Webb',    loans: '80 loans',  fill: 0.38, queue: 'Refinance' },
  { name: 'Aaliya Frost',   loans: '76 loans',  fill: 0.36, queue: 'Refinance' },
  { name: 'Ben Okafor',     loans: '72 loans',  fill: 0.34, queue: 'Refinance' },
  { name: 'Carmen Diaz',    loans: '68 loans',  fill: 0.32, queue: 'Refinance' },
  { name: 'Devon Park',     loans: '63 loans',  fill: 0.30, queue: 'Refinance' },
  { name: 'Elise Tran',     loans: '59 loans',  fill: 0.28, queue: 'Refinance' },
  { name: 'Felix Grant',    loans: '54 loans',  fill: 0.26, queue: 'Refinance' },
  { name: 'Grace Yuen',     loans: '48 loans',  fill: 0.23, queue: 'Refinance' },
  { name: 'Hassan Ali',     loans: '42 loans',  fill: 0.20, queue: 'Refinance' },
]

function SpecialistRow({ name, loans, fill, isNew = false }: { name: string; loans: string; fill: number; isNew?: boolean }) {
  return (
    <div className={isNew ? 'fade-up' : undefined} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontFamily: font.body, fontSize: 13, fontWeight: 600,
            color: isNew ? 'var(--brand-dark)' : css.textPrimary,
          }}>
            {name}
          </span>
          {isNew && (
            <span style={{
              fontFamily: font.body, fontSize: 9, fontWeight: 700,
              color: 'var(--brand-dark)', background: 'var(--brand-light)',
              border: '0.8px solid var(--brand-mid)', borderRadius: 6,
              padding: '2px 6px', letterSpacing: '0.4px',
            }}>
              NEW
            </span>
          )}
        </div>
        <span style={{ fontFamily: font.body, fontSize: 9, color: css.textTertiary }}>
          {isNew ? 'Just assigned' : loans}
        </span>
      </div>
      <ProgressBar fill={isNew ? 0.05 : fill} />
      <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: css.textSecondary }}>
        Assigned: Refinance
      </span>
    </div>
  )
}

function CapacityCard({ onReassign, transferred, isRealTime, capacityData }: { onReassign: () => void; transferred: string[]; isRealTime: boolean; capacityData: CapacityData }) {
  const [search, setSearch] = useState('')
  const activeCount = 18 + transferred.length
  const capacityGap = Math.max(0, capacityData.gap - transferred.length * 5)
  const gapAtRisk = capacityGap > 30
  const filtered = allSpecialists.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{
      background: css.surface,
      border: `1px solid ${css.border}`,
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: font.heading, fontWeight: 700, fontSize: 14, color: css.textPrimary }}>
          Capacity vs. Load
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: font.body, fontSize: 11, color: css.textTertiary }}>{activeCount} active</span>
          {isRealTime && (
            <button
              onClick={onReassign}
              style={{
                background: css.brand, border: 'none', borderRadius: 6,
                padding: '5px 10px', cursor: 'pointer',
                fontFamily: font.body, fontSize: 11, fontWeight: 700,
                color: 'var(--text-inverse)', whiteSpace: 'nowrap',
              }}
            >
              Reassign Staff
            </button>
          )}
        </div>
      </div>

      {/* Stat row — gap cell turns danger when at risk */}
      <div style={{ display: 'flex', border: `1px solid ${css.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {[
          { label: 'Queue load / Specialist', value: `${capacityData.load}`, danger: false },
          { label: 'Target load / Specialist', value: '85',                  danger: false },
          { label: 'Capacity gap',             value: `+${capacityGap}`,     danger: gapAtRisk },
        ].map(({ label, value, danger }, i) => (
          <div
            key={label}
            style={{
              flex: 1, padding: '8px 10px',
              borderLeft: i > 0 ? `1px solid ${css.border}` : 'none',
              background: danger ? 'rgba(206,67,10,0.05)' : 'transparent',
            }}
          >
            <div style={{
              fontFamily: font.body, fontSize: 8, letterSpacing: '0.3px',
              textTransform: 'uppercase', marginBottom: 4,
              color: danger ? css.danger : css.textTertiary,
            }}>
              {label}
            </div>
            <div style={{
              fontFamily: font.heading, fontWeight: 700, fontSize: 16, lineHeight: 1,
              color: danger ? css.danger : css.textPrimary,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Post-transfer banner — always visible after reassignment ── */}
      {transferred.length > 0 && (
        <div style={{
          background: 'rgba(98,148,96,0.08)', border: '1px solid var(--brand-mid)',
          borderRadius: 8, padding: '7px 10px',
          display: 'flex', alignItems: 'flex-start', gap: 7,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="7" cy="7" r="6" fill="#629460" />
            <path d="M4.5 7L6.5 9L9.5 5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 500, color: 'var(--brand-dark)', lineHeight: 1.5 }}>
            {transferred.length} specialist{transferred.length !== 1 ? 's' : ''} transferred in — {transferred.join(', ')}
          </span>
        </div>
      )}

      {/* Search — always visible */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: css.surfacePage, border: `0.8px solid ${css.border}`,
        borderRadius: 6, padding: '0 10px', height: 32,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="5" cy="5" r="3.5" stroke={css.textTertiary} strokeWidth="1.2" />
          <path d="M8 8L10.5 10.5" stroke={css.textTertiary} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontFamily: font.body, fontSize: 11, color: css.textPrimary, width: '100%',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 2L8 8M8 2L2 8" stroke={css.textTertiary} strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Scrollable specialist list — NEW pinned at top, existing below ── */}
      <div style={{ position: 'relative' }}>
        <div
          className="scroll-hidden"
          style={{
            maxHeight: 280,
            overflowY: 'scroll',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* NEW specialists always at top */}
          {transferred.map((name) => (
            <SpecialistRow key={`new-${name}`} name={name} loans="" fill={0} isNew />
          ))}
          {/* Existing list filtered by search */}
          {filtered.length > 0
            ? filtered.map((s) => (
                <SpecialistRow key={s.name} name={s.name} loans={s.loans} fill={s.fill} />
              ))
            : (
              <span style={{ fontFamily: font.body, fontSize: 12, color: css.textTertiary, padding: '4px 0' }}>
                No specialists match "{search}"
              </span>
            )
          }
        </div>

        {/* Bottom fade — signals more content below */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 48,
          background: `linear-gradient(to bottom, transparent, ${css.surface})`,
          pointerEvents: 'none',
          borderRadius: '0 0 4px 4px',
        }} />
      </div>
    </div>
  )
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="toast-enter" style={{
      position: 'fixed',
      bottom: 32,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2000,
      background: 'var(--text-primary)',
      borderRadius: 8,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      whiteSpace: 'nowrap',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" fill="#629460" />
        <path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: 'var(--text-inverse)' }}>
        {message}
      </span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, display: 'flex', alignItems: 'center' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

export default function QueueMonitor() {
  const location = useLocation()
  const navigate = useNavigate()
  const { markActioned } = useQueueContext()
  const queue: string = (location.state as { queue?: string } | null)?.queue ?? 'Refinance'
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [transferred, setTransferred] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Real Time')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customLabel, setCustomLabel] = useState<string | null>(null)
  const isRealTime = activeTab === 'Real Time'

  const period = periodConfig[activeTab] ?? periodConfig['Custom']

  function formatDate(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function handleTabChange(tab: string) {
    if (tab === 'Custom') {
      setShowDatePicker(true)
    } else {
      setShowDatePicker(false)
      setActiveTab(tab)
    }
  }

  function handleDateApply(from: string, to: string) {
    setShowDatePicker(false)
    setActiveTab('Custom')
    setCustomLabel(`${formatDate(from)} – ${formatDate(to)}`)
  }

  function handleApply(count: number, source: string, names: string[]) {
    setShowModal(false)
    setTransferred((prev) => [...prev, ...names])
    markActioned(queue)
    setToast(`${count} specialist${count !== 1 ? 's' : ''} moved from ${source} to ${queue}`)
    setTimeout(() => setToast(null), 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <HeaderBar
        queue={queue}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        customLabel={customLabel}
        showDatePicker={showDatePicker}
        onDatePickerApply={handleDateApply}
        onDatePickerCancel={() => setShowDatePicker(false)}
      />
      {!isRealTime && <HistoricalBanner tab={customLabel ?? activeTab} />}

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 16 }}>
        {period.kpis.map((c) => <KpiCard key={c.label} {...c} />)}
      </div>

      {/* Main row: left col (alerts + chart) | right col (capacity + rankings) */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <AlertsCard onReassign={() => setShowModal(true)} onRoster={() => navigate('/roster')} onLoans={() => navigate('/loans', { state: { queue, days: 5, label: '≤5 days to close', source: 'closing-risk alert' } })} transferred={transferred} isRealTime={isRealTime} periodAlerts={period.alerts} chartData={period.chart} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CapacityCard onReassign={() => setShowModal(true)} transferred={transferred} isRealTime={isRealTime} capacityData={period.capacity} />
          <RankingsCard />
        </div>
      </div>

      {showModal && (
        <RosterModal
          onClose={() => setShowModal(false)}
          onApply={handleApply}
        />
      )}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
