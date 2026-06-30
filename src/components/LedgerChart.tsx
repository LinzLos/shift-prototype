import { useId, useRef, useState } from 'react'
import { motion } from 'framer-motion'

/*
 * LedgerChart — the "Ledger" data-viz lens from the Viz Lab, generalized for
 * production screens. Smooth area-filled primary line, dashed comparison
 * line(s), quiet gridlines, fixed-size axis labels (HTML overlay so they don't
 * scale with the responsive SVG), animated draw-in, and a hover scrubber with a
 * flipping tooltip.
 *
 * Tiny Wire contract: every colour is a `var(--token)` reference. Pass tokens
 * (e.g. 'var(--chart-blue)') as series colours — never raw hex — so the chart
 * re-themes and dark-modes with the design system. Area fills derive from the
 * series token via color-mix(), so they stay in sync too.
 */

const font = {
  heading: "'Bricolage Grotesque', sans-serif",
  body: "'DM Sans', sans-serif",
}

// Ledger easing — smooth, confident draw-in (matches the Viz Lab Ledger lens).
const DRAW = { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }

export type SeriesVariant = 'area' | 'line' | 'dashed' | 'reference'

export type LedgerSeries = {
  label: string
  values: number[]
  /** A Tiny Wire token, e.g. 'var(--chart-blue)'. Never a raw hex. */
  color: string
  variant: SeriesVariant
  /** Which axis this series is measured against. Defaults to 'left'. */
  axis?: 'left' | 'right'
  /** Tooltip value formatter. Defaults to the raw number. */
  format?: (v: number) => string
}

export type LedgerAxis = {
  /** Lower bound. Omit to auto-fit from the data. */
  min?: number
  /** Upper bound. Omit to auto-fit from the data. */
  max?: number
  /** Explicit gridline / label values. Omit for three auto interior ticks. */
  ticks?: number[]
  /** Axis label formatter. Defaults to the raw number. */
  format?: (v: number) => string
}

export type LedgerChartProps = {
  xLabels: string[]
  series: LedgerSeries[]
  left?: LedgerAxis
  /** Presence enables a second (right-hand) axis for series with axis: 'right'. */
  right?: LedgerAxis
  /** Internal coordinate width. Aspect ratio = viewW / viewH. */
  viewW?: number
  /** Internal coordinate height. */
  viewH?: number
  animate?: boolean
}

// Smooth bezier through points (same curve the Viz Lab Ledger lens uses).
function smoothLine(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i]
    const mx = (a.x + b.x) / 2
    d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`
  }
  return d
}

function axisBounds(axis: LedgerAxis | undefined, vals: number[]) {
  if (vals.length === 0) return { min: 0, max: 1, ticks: [] as number[] }
  const dataMin = Math.min(...vals)
  const dataMax = Math.max(...vals)
  const pad = Math.max(2, (dataMax - dataMin) * 0.12)
  const min = axis?.min ?? Math.floor((dataMin - pad))
  const max = axis?.max ?? Math.ceil((dataMax + pad))
  const ticks =
    axis?.ticks ??
    [0.25, 0.5, 0.75].map((r) => Math.round(min + (max - min) * r))
  return { min, max, ticks }
}

export default function LedgerChart({
  xLabels,
  series,
  left,
  right,
  viewW = 520,
  viewH = 190,
  animate = true,
}: LedgerChartProps) {
  const uid = useId().replace(/:/g, '')

  const hasRight = !!right
  const padL = 34
  const padR = hasRight ? 40 : 14
  const padT = 14
  const padB = 8
  const cW = viewW - padL - padR
  const cH = viewH - padT - padB
  const chartBottom = padT + cH

  // Per-axis bounds (auto-fit when not provided).
  const leftVals = series.filter((s) => (s.axis ?? 'left') === 'left').flatMap((s) => s.values)
  const rightVals = series.filter((s) => s.axis === 'right').flatMap((s) => s.values)
  const L = axisBounds(left, leftVals)
  const R = axisBounds(right, rightVals)

  const n = xLabels.length
  const toX = (i: number) => padL + (i / (n - 1)) * cW
  const toYFor = (axis: 'left' | 'right') => (v: number) => {
    const a = axis === 'right' ? R : L
    return padT + cH - ((v - a.min) / (a.max - a.min)) * cH
  }

  // ── Hover scrubber ──────────────────────────────────────────────────────
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const raw = (((e.clientX - rect.left) / rect.width) * viewW - padL) / cW * (n - 1)
    setHoverIdx(Math.max(0, Math.min(n - 1, Math.round(raw))))
  }

  // Series that participate in hover markers / tooltip (references are guides).
  const liveSeries = series.filter((s) => s.variant !== 'reference')
  const hoverX = hoverIdx !== null ? toX(hoverIdx) : 0

  return (
    <div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 12, flexWrap: 'wrap' }}>
        {series.map((s) => {
          const dashed = s.variant === 'dashed' || s.variant === 'reference'
          const stroke = s.variant === 'reference' ? 'var(--border-strong)' : s.color
          return (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="16" height="8" aria-hidden>
                <line
                  x1="0" y1="4" x2="16" y2="4"
                  stroke={stroke}
                  strokeWidth={s.variant === 'area' || s.variant === 'line' ? 2 : 1.5}
                  strokeDasharray={dashed ? '4 3' : undefined}
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontFamily: font.body, fontSize: 11, color: 'var(--text-tertiary)' }}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'relative' }}>
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${viewW} ${viewH}`}
          style={{ display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            {series.map((s, si) =>
              s.variant === 'area' ? (
                <linearGradient key={si} id={`${uid}-area-${si}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ) : null,
            )}
          </defs>

          {/* Horizontal gridlines + baseline (left axis) */}
          {L.ticks.map((v) => (
            <line
              key={`g-${v}`}
              x1={padL} y1={toYFor('left')(v)} x2={viewW - padR} y2={toYFor('left')(v)}
              stroke="var(--border)" strokeWidth="1"
            />
          ))}
          <line x1={padL} y1={chartBottom} x2={viewW - padR} y2={chartBottom} stroke="var(--border)" strokeWidth="1" />

          {/* Series (draw references first, then comparison, area-primary last/on top) */}
          {[...series]
            .map((s, i) => ({ s, i }))
            .sort((a, b) => order(a.s.variant) - order(b.s.variant))
            .map(({ s, i }) => {
              const toY = toYFor(s.axis ?? 'left')
              const pts = s.values.map((v, idx) => ({ x: toX(idx), y: toY(v) }))
              const d = smoothLine(pts)
              const isRef = s.variant === 'reference'
              const dashed = s.variant === 'dashed' || isRef
              const stroke = isRef ? 'var(--border-strong)' : s.color
              const sw = s.variant === 'area' || s.variant === 'line' ? 2 : 1.5

              return (
                <g key={`s-${i}`}>
                  {s.variant === 'area' && (
                    <motion.path
                      d={`${d} L ${toX(n - 1)} ${chartBottom} L ${toX(0)} ${chartBottom} Z`}
                      fill={`url(#${uid}-area-${i})`}
                      initial={animate ? { opacity: 0 } : false}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                  {/* Solid lines draw on via pathLength; dashed/reference lines
                      fade in instead — framer-motion's pathLength hijacks
                      stroke-dasharray, which would erase the dash pattern. */}
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeDasharray={dashed ? (isRef ? '4 3' : '6 4') : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={animate ? (dashed ? { opacity: 0 } : { pathLength: 0 }) : false}
                    animate={dashed ? { opacity: 1 } : { pathLength: 1 }}
                    transition={dashed ? { duration: 0.5, delay: 0.15 } : DRAW}
                  />
                </g>
              )
            })}

          {/* Hover scrubber */}
          {hoverIdx !== null && (
            <g>
              <line
                x1={hoverX} y1={padT} x2={hoverX} y2={chartBottom}
                stroke="var(--text-tertiary)" strokeWidth="1" opacity={0.4} strokeDasharray="3 3"
              />
              {liveSeries.map((s, si) => {
                const toY = toYFor(s.axis ?? 'left')
                const cy = toY(s.values[hoverIdx])
                const open = s.variant === 'dashed'
                return open ? (
                  <circle key={si} cx={hoverX} cy={cy} r="3.5" fill="var(--surface)" stroke={s.color} strokeWidth="1.5" />
                ) : (
                  <circle key={si} cx={hoverX} cy={cy} r="4" fill={s.color} />
                )
              })}
            </g>
          )}
        </svg>

        {/* Tooltip — fixed-size HTML overlay, flips near the right edge */}
        {hoverIdx !== null && (() => {
          const flip = hoverX > viewW * 0.6
          const topY = Math.min(
            ...liveSeries.map((s) => toYFor(s.axis ?? 'left')(s.values[hoverIdx])),
          )
          return (
            <div
              style={{
                position: 'absolute',
                left: `${(hoverX / viewW) * 100}%`,
                top: `${(topY / viewH) * 100}%`,
                transform: flip
                  ? 'translateX(calc(-100% - 12px)) translateY(calc(-100% - 8px))'
                  : 'translateX(12px) translateY(calc(-100% - 8px))',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '6px 10px',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                boxShadow: 'var(--elevation-md)',
                zIndex: 10,
              }}
            >
              <div style={{ fontFamily: font.body, fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>
                {xLabels[hoverIdx]}
              </div>
              {liveSeries.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: font.body, fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontFamily: font.heading, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto', paddingLeft: 10 }}>
                    {(s.format ?? String)(s.values[hoverIdx])}
                  </span>
                </div>
              ))}
            </div>
          )
        })()}

        {/* Left axis labels — fixed-size HTML overlay (don't scale with the SVG) */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {L.ticks.map((v) => (
            <div
              key={v}
              style={{
                position: 'absolute',
                left: 0,
                width: `${((padL - 6) / viewW) * 100}%`,
                top: `${(toYFor('left')(v) / viewH) * 100}%`,
                transform: 'translateY(-50%)',
                textAlign: 'right',
              }}
            >
              <span style={{ fontFamily: font.body, fontSize: 10, color: 'var(--text-tertiary)' }}>
                {(left?.format ?? String)(v)}
              </span>
            </div>
          ))}
          {/* Right axis labels */}
          {hasRight && R.ticks.map((v) => (
            <div
              key={`r-${v}`}
              style={{
                position: 'absolute',
                right: 0,
                width: `${((padR - 6) / viewW) * 100}%`,
                top: `${(toYFor('right')(v) / viewH) * 100}%`,
                transform: 'translateY(-50%)',
                textAlign: 'left',
              }}
            >
              <span style={{ fontFamily: font.body, fontSize: 10, color: 'var(--text-tertiary)' }}>
                {(right?.format ?? String)(v)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* X axis labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: `${(padL / viewW) * 100}%`,
          paddingRight: `${(padR / viewW) * 100}%`,
          marginTop: 6,
        }}
      >
        {xLabels.map((l, i) => (
          <span key={i} style={{ fontFamily: font.body, fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1 }}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

// Paint order: references at the back, dashed comparison next, area/line primary on top.
function order(v: SeriesVariant) {
  return v === 'reference' ? 0 : v === 'dashed' ? 1 : 2
}
