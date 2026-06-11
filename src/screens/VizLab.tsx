import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Config ───────────────────────────────────────────────────────────────────

// Robinhood: organic spring — soft, slightly bouncy (consumer fintech feel)
const RH_SPRING   = { type: 'spring' as const, stiffness: 180, damping: 22, mass: 0.9 }
// Bloomberg: crisp tween — precise, mechanical (terminal feel)
const BBG_SPRING  = { type: 'tween'  as const, duration: 0.36, ease: [0.4, 0, 0.2, 1] as const }
// Stripe: smooth ease-out — clean, confident, professional
const STR_SPRING  = { type: 'tween'  as const, duration: 0.4,  ease: [0.25, 0.46, 0.45, 0.94] as const }
// Grid blur/scale uses a unified tween so it doesn't fight either card spring
const GRID_SPRING = { type: 'tween'  as const, duration: 0.4,  ease: [0.4, 0, 0.2, 1] as const }

// Robinhood palettes — muted brightened to #888 for AA contrast on dark bg
const RH_DARK = {
  bg:     '#0D0D0D', border: '#242424', text: '#FFFFFF',
  muted:  '#888888', dim:    '#333333',
  green:  '#00C805', inflow: 'rgba(255,255,255,0.42)',
  gradA:  'rgba(0,200,5,0.22)', gradB: 'rgba(0,200,5,0)',
}
const RH_LIGHT = {
  bg:     '#FFFFFF',  border: '#EBEBEB', text: '#0D0D0D',
  muted:  '#898989',  dim:    '#E8E8E8',
  green:  '#019904',  inflow: 'rgba(0,0,0,0.22)',
  gradA:  'rgba(1,153,4,0.10)', gradB: 'rgba(1,153,4,0)',
}

// Bloomberg palettes — muted at #9E9E9E (5.9:1 on black) and #5C5344 (5.1:1 on cream) for AA
const BBG_DARK = {
  bg:     '#000000', border: '#1E1E1E', text:   '#FFFFFF',
  muted:  '#9E9E9E', dim:    '#2A2A2A',
  orange: '#F0931C', amber:  '#FFB83F', green: '#4CAF50', red: '#EF5350',
}
const BBG_LIGHT = {
  bg:     '#FDFBF5', border: '#DDD5C3', text:   '#1C1A12',
  muted:  '#5C5344', dim:    '#EAE5D8',
  orange: '#C86400', amber:  '#956000', green: '#276A2C', red: '#C12020',
}

// Stripe palettes — dark navy to clean white
const STR_DARK = {
  bg:     '#0A2540', border: '#1A3A54', text:   '#FFFFFF',
  muted:  '#8898AA', dim:    '#1A3550',
  purple: '#7B73FF', teal:   '#36BFFA',
  gradA:  'rgba(123,115,255,0.3)', gradB: 'rgba(123,115,255,0)',
  badge:  'rgba(123,115,255,0.18)',
}
const STR_LIGHT = {
  bg:     '#FFFFFF', border: '#E6EBF1', text:   '#0A2540',
  muted:  '#697386', dim:    '#F7FAFC',
  purple: '#635BFF', teal:   '#0891D1',
  gradA:  'rgba(99,91,255,0.12)', gradB: 'rgba(99,91,255,0)',
  badge:  'rgba(99,91,255,0.1)',
}

type RHP  = typeof RH_DARK
type BBGP = typeof BBG_DARK
type STRP = typeof STR_DARK

const font = {
  heading: "'Bricolage Grotesque', sans-serif",
  body:    "'DM Sans', sans-serif",
  mono:    "'Courier New', monospace",
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type Period = 'Today' | '1D' | '1W' | '1M'

const periodData: Record<Period, { xLabels: string[]; outflow: number[]; inflow: number[] }> = {
  'Today': {
    xLabels: ['12a', '9a', '12p', '1p', '2p', '3p', 'Now'],
    outflow: [110, 115, 120, 125, 128, 132, 140],
    inflow:  [105, 115, 130, 148, 165, 185, 205],
  },
  '1D': {
    xLabels: ['12a', '4a', '8a', '12p', '4p', '8p', '12a'],
    outflow: [98, 102, 108, 115, 120, 118, 112],
    inflow:  [95, 108, 122, 138, 150, 155, 148],
  },
  '1W': {
    xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    outflow: [95, 98, 102, 108, 114, 112, 118],
    inflow:  [92, 112, 120, 126, 132, 130, 140],
  },
  '1M': {
    xLabels: ['Mar 1', 'Mar 8', 'Mar 15', 'Mar 22', 'Mar 28'],
    outflow: [88, 92, 98, 104, 112],
    inflow:  [85, 92, 100, 114, 128],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function angularLine(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function buildRHChart(
  data: { outflow: number[]; inflow: number[] },
  W: number, H: number, pL: number, pR: number, pT: number, pB: number
) {
  const cW = W - pL - pR, cH = H - pT - pB
  const all = [...data.outflow, ...data.inflow]
  const minV = Math.min(...all) - 6, maxV = Math.max(...all) + 6
  const toX = (i: number) => pL + (i / (data.outflow.length - 1)) * cW
  const toY = (v: number) => pT + cH - ((v - minV) / (maxV - minV)) * cH
  const outPts = data.outflow.map((v, i) => ({ x: toX(i), y: toY(v) }))
  const inPts  = data.inflow.map((v, i) => ({ x: toX(i), y: toY(v) }))
  const outLine = smoothLine(outPts)
  const inLine  = smoothLine(inPts)
  const outArea = `${outLine} L ${toX(data.outflow.length - 1)} ${pT + cH} L ${toX(0)} ${pT + cH} Z`
  return { toX, toY, outLine, inLine, outArea }
}

// ─── Mode toggle ──────────────────────────────────────────────────────────────

function ModeToggle({ mode, onToggle, color }: { mode: 'dark' | 'light'; onToggle: (e: React.MouseEvent) => void; color: string }) {
  return (
    <button onClick={onToggle} title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'} style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 4, opacity: 0.6, flexShrink: 0,
    }}>
      {mode === 'dark' ? (
        <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
          <circle cx="6.5" cy="6.5" r="2.6" stroke={color} strokeWidth="1.2" />
          <path d="M6.5 1v1.4M6.5 10.6V12M1 6.5h1.4M10.6 6.5H12M2.7 2.7l1 1M9.3 9.3l1 1M9.3 2.7l-1 1M3.7 9.3l-1 1"
            stroke={color} strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="13" height="13" fill="none" viewBox="0 0 13 13">
          <path d="M11 7.5A5 5 0 0 1 5.5 2a5 5 0 1 0 5.5 5.5z"
            stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

// ─── Robinhood — mini chart ───────────────────────────────────────────────────

function MiniRHChart({ p }: { p: RHP }) {
  const W = 300, H = 88
  const data = periodData['Today']
  const { outLine, inLine, outArea } = buildRHChart(data, W, H, 0, 0, 4, 4)
  const gradId = `rh-mini-${p.bg.replace('#', '')}`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.gradA} />
          <stop offset="100%" stopColor={p.gradB} />
        </linearGradient>
      </defs>
      <path d={outArea} fill={`url(#${gradId})`} style={{ transition: 'opacity 0.35s ease' }} />
      {/* No nodes on mini chart — pure lines */}
      <path d={outLine} fill="none" strokeWidth="1.2" style={{ stroke: p.green,  transition: 'stroke 0.35s ease' }} />
      <path d={inLine}  fill="none" strokeWidth="0.8" strokeDasharray="3 2" style={{ stroke: p.inflow, transition: 'stroke 0.35s ease' }} />
    </svg>
  )
}

// ─── Robinhood — expanded chart ───────────────────────────────────────────────
// Hover: smooth fade (0.2s ease-out), scrubber snaps to nearest point
// Node style: no permanent nodes — tiny filled dot appears only on hover

function ExpandedRHChart({ period, p }: { period: Period; p: RHP }) {
  // W = 1100 keeps fontSize ~1:1 with typical demo container (~1200px content)
  const W = 1100, H = 176
  const padL = 10, padR = 28, padT = 14, padB = 6
  const data = periodData[period]
  const { toX, toY, outLine, inLine, outArea } = buildRHChart(data, W, H, padL, padR, padT, padB)
  const gradId = `rh-exp-${p.bg.replace('#', '')}`

  const [hoverIdx,  setHoverIdx]  = useState<number | null>(null)
  const [hoverX,    setHoverX]    = useState(0)
  const [hoverOutY, setHoverOutY] = useState(0)
  const [hoverInY,  setHoverInY]  = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const rawIdx = ((e.clientX - rect.left) / rect.width * W - padL) / (W - padL - padR) * (data.xLabels.length - 1)
    const idx = Math.max(0, Math.min(data.xLabels.length - 1, Math.round(rawIdx)))
    setHoverIdx(idx)
    setHoverX(toX(idx))
    setHoverOutY(toY(data.outflow[idx]))
    setHoverInY(toY(data.inflow[idx]))
  }

  const ttBg  = p.bg === '#FFFFFF' ? '#F0F0F0' : '#1A1A1A'
  const ttBdr = p.bg === '#FFFFFF' ? '#D0D0D0' : p.dim

  return (
    <>
    <div style={{ position: 'relative' }}>
    <svg key={period} ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.gradA} />
          <stop offset="100%" stopColor={p.gradB} />
        </linearGradient>
      </defs>

      <motion.path d={outArea} fill={`url(#${gradId})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} />
      {/* Thinner lines: inflow 1px, outflow 1.5px */}
      <motion.path d={inLine} fill="none" stroke={p.inflow} strokeWidth="1" strokeDasharray="5 3"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.08 }} />
      <motion.path d={outLine} fill="none" stroke={p.green} strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }} />

      {/* Hover — fade in/out 0.2s ease-out (Robinhood: gentle) */}
      <AnimatePresence>
        {hoverIdx !== null && (
          <motion.g key="rh-hover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Scrubber line */}
            <line x1={hoverX} y1={padT} x2={hoverX} y2={padT + (H - padT - padB)}
              stroke={p.muted} strokeWidth="0.8" opacity={0.4} />

            {/* Outflow dot — small filled (Robinhood: no permanent nodes, dot on hover only) */}
            <circle cx={hoverX} cy={hoverOutY} r="3" fill={p.green} />
            {/* Inflow dot — open, smaller */}
            <circle cx={hoverX} cy={hoverInY} r="2" fill={p.bg} stroke={p.inflow} strokeWidth="1" />

          </motion.g>
        )}
      </AnimatePresence>
    </svg>
    {hoverIdx !== null && (() => {
      const flip = hoverX > W * 0.6
      return (
        <div style={{
          position: 'absolute',
          left: `${hoverX / W * 100}%`,
          top: `${Math.min(hoverOutY, hoverInY) / H * 100}%`,
          transform: flip
            ? 'translateX(calc(-100% - 10px)) translateY(calc(-100% - 8px))'
            : 'translateX(10px) translateY(calc(-100% - 8px))',
          background: ttBg,
          border: `0.5px solid ${ttBdr}`,
          borderRadius: 4,
          padding: '5px 8px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: p.green }}>OUT {data.outflow[hoverIdx]}</div>
          <div style={{ fontFamily: font.body, fontSize: 11, color: p.muted }}>IN {data.inflow[hoverIdx]}</div>
        </div>
      )
    })()}
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: `${padL / W * 100}%`,
      paddingRight: `${padR / W * 100}%`,
      marginTop: 4,
    }}>
      {data.xLabels.map((l, i) => (
        <span key={i} style={{ fontFamily: font.body, fontSize: 11, color: p.muted, lineHeight: 1 }}>{l}</span>
      ))}
    </div>
    </>
  )
}

// ─── Bloomberg — mini chart ───────────────────────────────────────────────────

function MiniBBGChart({ p }: { p: BBGP }) {
  const W = 300, H = 80
  const { outflow, inflow } = periodData['Today']
  const n = outflow.length
  const maxV = Math.max(...outflow, ...inflow) + 12
  const slotW = W / n
  const barW  = slotW * 0.58
  const toBarX  = (i: number) => i * slotW + (slotW - barW) / 2
  const toBarCX = (i: number) => i * slotW + slotW / 2
  const toY     = (v: number) => H - (v / maxV) * H
  const toBarH  = (v: number) => (v / maxV) * H
  const inPts = inflow.map((v, i) => ({ x: toBarCX(i), y: toY(v) }))
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      {outflow.map((v, i) => (
        <rect key={i} x={toBarX(i)} y={toY(v)} width={barW} height={toBarH(v)}
          style={{ fill: p.orange, transition: 'fill 0.3s ease' }} />
      ))}
      {/* Angular inflow line — thinner */}
      <path d={angularLine(inPts)} fill="none" strokeWidth="1" strokeDasharray="3 2"
        style={{ stroke: p.amber, transition: 'stroke 0.3s ease' }} />
      {/* Diamond nodes — Bloomberg signature */}
      {inflow.map((v, i) => {
        const cx = toBarCX(i), cy = toY(v), s = 2
        return (
          <polygon key={i}
            points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
            strokeWidth="0.8"
            style={{ fill: p.bg, stroke: p.amber, transition: 'fill 0.3s ease, stroke 0.3s ease' }} />
        )
      })}
    </svg>
  )
}

// ─── Bloomberg — expanded chart ───────────────────────────────────────────────
// Hover: fast snap (0.08s) — terminal responsiveness
// Node style: diamond at each inflow point (Bloomberg signature)

function ExpandedBBGChart({ period, p }: { period: Period; p: BBGP }) {
  const W = 1100, H = 186
  const padL = 44, padR = 28, padT = 14, padB = 6
  const cW = W - padL - padR, cH = H - padT - padB
  const data = periodData[period]
  const n = data.outflow.length
  const slotW = cW / n
  const barW  = slotW * 0.60
  const maxV  = Math.ceil((Math.max(...data.outflow, ...data.inflow) + 15) / 25) * 25
  const chartBottom = padT + cH
  const toBarX  = (i: number) => padL + i * slotW + (slotW - barW) / 2
  const toBarCX = (i: number) => padL + i * slotW + slotW / 2
  const toY     = (v: number) => padT + cH - (v / maxV) * cH
  const toBarH  = (v: number) => (v / maxV) * cH
  const yTicks  = [0.25, 0.5, 0.75].map(r => Math.round(maxV * r / 25) * 25)
  const inPts   = data.inflow.map((v, i) => ({ x: toBarCX(i), y: toY(v) }))
  const inPath  = angularLine(inPts)

  const [hoverIdx,   setHoverIdx]   = useState<number | null>(null)
  const [hoverBarCX, setHoverBarCX] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const xRel = (e.clientX - rect.left) / rect.width * W - padL
    const idx = Math.max(0, Math.min(n - 1, Math.floor(xRel / slotW)))
    setHoverIdx(idx)
    setHoverBarCX(toBarCX(idx))
  }

  return (
    <>
    <div style={{ position: 'relative' }}>
    <svg key={period} ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}
    >
      {/* Grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={p.dim} strokeWidth="1" />
        </g>
      ))}
      <line x1={padL} y1={chartBottom} x2={W - padR} y2={chartBottom} stroke={p.dim} strokeWidth="1" />

      {/* Bars with stagger rise animation */}
      {data.outflow.map((v, i) => (
        <motion.rect key={`${period}-${i}`}
          x={toBarX(i)} y={toY(v)} width={barW} height={toBarH(v)}
          style={{ transformBox: 'fill-box' as any, transformOrigin: 'bottom' }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1, fill: hoverIdx === i ? p.amber : p.orange }}
          transition={{
            scaleY: { duration: 0.45, delay: i * 0.055, ease: [0.16, 1, 0.3, 1] },
            fill: { duration: 0.08 },
          }}
        />
      ))}

      {/* Inflow angular line — thinner */}
      <motion.path d={inPath} fill="none" stroke={p.amber} strokeWidth="1" strokeDasharray="4 3"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }} />

      {/* Diamond nodes on inflow — Bloomberg signature */}
      {data.inflow.map((v, i) => {
        const cx = toBarCX(i), cy = toY(v), s = 3.5
        return (
          <g key={`dg-${period}-${i}`} transform={`translate(${cx}, ${cy})`}>
            <motion.polygon
              points={`0,${-s} ${s},0 0,${s} ${-s},0`}
              fill={p.bg} stroke={p.amber} strokeWidth="1"
              style={{ transformBox: 'fill-box' as any, transformOrigin: 'center' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.3 }}
            />
          </g>
        )
      })}

      {/* Hover — fast snap 0.08s (Bloomberg: terminal responsiveness) */}
      <AnimatePresence>
        {hoverIdx !== null && (
          <motion.g key="bbg-hover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
          >
            <line x1={hoverBarCX} y1={padT} x2={hoverBarCX} y2={chartBottom}
              stroke={p.orange} strokeWidth="1" opacity={0.4} strokeDasharray="2 2" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
    {hoverIdx !== null && (() => {
      const outV = data.outflow[hoverIdx]
      const inV  = data.inflow[hoverIdx]
      const gap  = inV - outV
      const flip = hoverBarCX > W * 0.58
      return (
        <div style={{
          position: 'absolute',
          left: `${hoverBarCX / W * 100}%`,
          top: `${toY(Math.max(outV, inV)) / H * 100}%`,
          transform: flip
            ? 'translateX(calc(-100% - 10px)) translateY(calc(-100% - 8px))'
            : 'translateX(10px) translateY(calc(-100% - 8px))',
          background: p.bg,
          border: `0.8px solid ${p.orange}`,
          borderRadius: 2,
          padding: '5px 8px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: p.orange }}>OUT:{outV}</div>
          <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: p.amber }}>IN:{inV}</div>
          <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: gap > 0 ? p.red : p.green }}>GAP:{gap > 0 ? `+${gap}` : gap}</div>
        </div>
      )
    })()}
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {yTicks.map(v => (
        <div key={v} style={{
          position: 'absolute',
          left: 0,
          width: `${(padL - 5) / W * 100}%`,
          top: `${toY(v) / H * 100}%`,
          transform: 'translateY(-50%)',
          textAlign: 'right',
        }}>
          <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: p.muted }}>{v}</span>
        </div>
      ))}
    </div>
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      paddingLeft: `${padL / W * 100}%`,
      paddingRight: `${padR / W * 100}%`,
      marginTop: 4,
    }}>
      {data.xLabels.map((l, i) => (
        <span key={i} style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: p.muted, lineHeight: 1 }}>{l}</span>
      ))}
    </div>
    </>
  )
}

// ─── Stripe — mini chart ─────────────────────────────────────────────────────

function MiniStripeChart({ p }: { p: STRP }) {
  const W = 300, H = 88
  const data = periodData['Today']
  const { outLine, inLine, outArea } = buildRHChart(data, W, H, 0, 0, 4, 4)
  const gradId = `str-mini-${p.bg.replace('#', '')}`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.gradA} />
          <stop offset="100%" stopColor={p.gradB} />
        </linearGradient>
      </defs>
      <path d={outArea} fill={`url(#${gradId})`} />
      <path d={inLine}  fill="none" strokeWidth="1"   strokeDasharray="4 3" style={{ stroke: p.teal,   transition: 'stroke 0.35s ease' }} />
      <path d={outLine} fill="none" strokeWidth="1.5"                        style={{ stroke: p.purple, transition: 'stroke 0.35s ease' }} />
    </svg>
  )
}

// ─── Stripe — expanded chart ──────────────────────────────────────────────────

function ExpandedStripeChart({ period, p }: { period: Period; p: STRP }) {
  const W = 1100, H = 176
  const padL = 44, padR = 28, padT = 14, padB = 6
  const data = periodData[period]
  const { toX, toY, outLine, inLine, outArea } = buildRHChart(data, W, H, padL, padR, padT, padB)
  const gradId = `str-exp-${p.bg.replace('#', '')}`

  const all  = [...data.outflow, ...data.inflow]
  const minV = Math.min(...all) - 6
  const maxV = Math.max(...all) + 6
  const yTicks = [0.25, 0.5, 0.75].map(r => Math.round((minV + (maxV - minV) * r) / 5) * 5)

  const [hoverIdx,  setHoverIdx]  = useState<number | null>(null)
  const [hoverX,    setHoverX]    = useState(0)
  const [hoverOutY, setHoverOutY] = useState(0)
  const [hoverInY,  setHoverInY]  = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const rawIdx = ((e.clientX - rect.left) / rect.width * W - padL) / (W - padL - padR) * (data.xLabels.length - 1)
    const idx = Math.max(0, Math.min(data.xLabels.length - 1, Math.round(rawIdx)))
    setHoverIdx(idx); setHoverX(toX(idx)); setHoverOutY(toY(data.outflow[idx])); setHoverInY(toY(data.inflow[idx]))
  }

  const ttBg  = p.bg === '#FFFFFF' ? '#FFFFFF' : '#0D2036'
  const ttBdr = p.bg === '#FFFFFF' ? '#E6EBF1' : '#1E3A54'

  return (
    <>
    <div style={{ position: 'relative' }}>
    <svg key={period} ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`}
      style={{ display: 'block', cursor: 'crosshair' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.gradA} />
          <stop offset="100%" stopColor={p.gradB} />
        </linearGradient>
      </defs>

      {/* Horizontal grid */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={padL} y1={toY(v)} x2={W - padR} y2={toY(v)} stroke={p.dim} strokeWidth="1" />
        </g>
      ))}
      <line x1={padL} y1={padT + (H - padT - padB)} x2={W - padR} y2={padT + (H - padT - padB)}
        stroke={p.dim} strokeWidth="1" />

      {/* Area + lines */}
      <motion.path d={outArea} fill={`url(#${gradId})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
      <motion.path d={inLine} fill="none" strokeWidth="1.5" strokeDasharray="6 4"
        style={{ stroke: p.teal }}
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }} />
      <motion.path d={outLine} fill="none" strokeWidth="2"
        style={{ stroke: p.purple }}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />

      {/* Hover */}
      <AnimatePresence>
        {hoverIdx !== null && (
          <motion.g key="str-hover"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <line x1={hoverX} y1={padT} x2={hoverX} y2={padT + (H - padT - padB)}
              stroke={p.muted} strokeWidth="1" opacity={0.4} strokeDasharray="3 3" />
            <circle cx={hoverX} cy={hoverOutY} r="4.5" fill={p.purple} />
            <circle cx={hoverX} cy={hoverInY}  r="3.5" fill={ttBg} stroke={p.teal} strokeWidth="1.5" />
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
    {hoverIdx !== null && (() => {
      const flip = hoverX > W * 0.6
      return (
        <div style={{
          position: 'absolute',
          left: `${hoverX / W * 100}%`,
          top: `${Math.min(hoverOutY, hoverInY) / H * 100}%`,
          transform: flip
            ? 'translateX(calc(-100% - 12px)) translateY(calc(-100% - 8px))'
            : 'translateX(12px) translateY(calc(-100% - 8px))',
          background: ttBg,
          border: `0.8px solid ${ttBdr}`,
          borderRadius: 6,
          padding: '6px 10px',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 600, color: p.purple }}>OUT  {data.outflow[hoverIdx]}</div>
          <div style={{ fontFamily: font.body, fontSize: 12, color: p.teal }}>IN  {data.inflow[hoverIdx]}</div>
        </div>
      )
    })()}
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {yTicks.map(v => (
        <div key={v} style={{
          position: 'absolute',
          left: 0,
          width: `${(padL - 6) / W * 100}%`,
          top: `${toY(v) / H * 100}%`,
          transform: 'translateY(-50%)',
          textAlign: 'right',
        }}>
          <span style={{ fontFamily: font.body, fontSize: 11, fontWeight: 600, color: p.muted }}>{v}</span>
        </div>
      ))}
    </div>
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      paddingLeft: `${padL / W * 100}%`,
      paddingRight: `${padR / W * 100}%`,
      marginTop: 4,
    }}>
      {data.xLabels.map((l, i) => (
        <span key={i} style={{ fontFamily: font.body, fontSize: 11, color: p.muted, lineHeight: 1 }}>{l}</span>
      ))}
    </div>
    </>
  )
}


// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VizLab() {
  const [selected,     setSelected]     = useState<'robinhood' | 'bloomberg' | 'stripe' | null>(null)
  const [rhPeriod,     setRhPeriod]     = useState<Period>('Today')
  const [bbgPeriod,    setBbgPeriod]    = useState<Period>('Today')
  const [strPeriod,    setStrPeriod]    = useState<Period>('Today')
  const [rhMode,       setRhMode]       = useState<'dark' | 'light'>('dark')
  const [bbgMode,      setBbgMode]      = useState<'dark' | 'light'>('dark')
  const [strMode,      setStrMode]      = useState<'dark' | 'light'>('dark')
  const [rhCardHover,  setRhCardHover]  = useState(false)
  const [bbgCardHover, setBbgCardHover] = useState(false)
  const [strCardHover, setStrCardHover] = useState(false)

  // Expanded views use the user-controlled toggle
  const rp = rhMode  === 'dark' ? RH_DARK  : RH_LIGHT
  const bp = bbgMode === 'dark' ? BBG_DARK : BBG_LIGHT
  const sp = strMode === 'dark' ? STR_DARK : STR_LIGHT
  // Preview cards start dark, transition to light on hover
  const rhCardP  = rhCardHover  ? RH_LIGHT  : RH_DARK
  const bbgCardP = bbgCardHover ? BBG_LIGHT : BBG_DARK
  const strCardP = strCardHover ? STR_LIGHT : STR_DARK
  const isExpanded = selected !== null

  function delta(data: { outflow: number[] }) {
    const pct = (data.outflow.at(-1)! / data.outflow[0] - 1) * 100
    return { str: `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`, positive: pct >= 0 }
  }
  function stats(period: Period) {
    const d = periodData[period]
    const last = d.outflow.at(-1)!
    return {
      last,
      high: Math.max(...d.outflow),
      low:  Math.min(...d.outflow),
      avg:  Math.round(d.outflow.reduce((a, b) => a + b, 0) / d.outflow.length),
      gap:  d.inflow.at(-1)! - last,
    }
  }

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: font.heading, fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--text-primary)', lineHeight: 1 }}>
          Viz Lab
        </h1>
        <p style={{ fontFamily: font.body, fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
          Same data. Different lenses.
        </p>
      </div>

      {/* Grid */}
      <motion.div
        animate={isExpanded ? { filter: 'blur(5px)', scale: 0.96, opacity: 0.4 } : { filter: 'blur(0px)', scale: 1, opacity: 1 }}
        transition={GRID_SPRING}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, transformOrigin: 'top center' }}
      >
        {/* ── Robinhood card ── */}
        <motion.div layoutId="rh-card" transition={RH_SPRING}
          onClick={() => { if (!isExpanded) { setRhCardHover(false); setSelected('robinhood') } }}
          onMouseEnter={() => !isExpanded && setRhCardHover(true)}
          onMouseLeave={() => setRhCardHover(false)}
          whileHover={!isExpanded ? { scale: 1.025, transition: { type: 'spring', stiffness: 260, damping: 20 } } : {}}
          style={{
            background: rhCardP.bg, border: `1px solid ${rhCardP.border}`, borderRadius: 16, overflow: 'hidden',
            cursor: isExpanded ? 'default' : 'pointer',
            visibility: selected === 'robinhood' ? 'hidden' : 'visible',
            transition: 'background 0.35s ease, border-color 0.35s ease',
          }}
        >
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, color: rhCardP.green, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'color 0.35s ease' }}>Robinhood</span>
              <span style={{ fontFamily: font.body, fontSize: 10, color: rhCardP.muted, transition: 'color 0.35s ease' }}>Inflow vs Outflow</span>
            </div>
            <div style={{ fontFamily: font.heading, fontSize: 42, fontWeight: 700, color: rhCardP.text, lineHeight: 1, transition: 'color 0.35s ease' }}>140</div>
            <div style={{ fontFamily: font.body, fontSize: 12, marginTop: 5 }}>
              <span style={{ color: rhCardP.green, fontWeight: 600, transition: 'color 0.35s ease' }}>+27.3%</span>
              <span style={{ color: rhCardP.muted, marginLeft: 6, transition: 'color 0.35s ease' }}>vs midnight</span>
            </div>
          </div>
          <div style={{ marginTop: 14 }}><MiniRHChart p={rhCardP} /></div>
        </motion.div>

        {/* ── Bloomberg card ── */}
        <motion.div layoutId="bbg-card" transition={BBG_SPRING}
          onClick={() => { if (!isExpanded) { setBbgCardHover(false); setSelected('bloomberg') } }}
          onMouseEnter={() => !isExpanded && setBbgCardHover(true)}
          onMouseLeave={() => setBbgCardHover(false)}
          whileHover={!isExpanded ? { scale: 1.015, transition: { type: 'tween', duration: 0.14, ease: 'easeOut' } } : {}}
          style={{
            background: bbgCardP.bg, border: `1px solid ${bbgCardP.border}`, borderRadius: 16, overflow: 'hidden',
            cursor: isExpanded ? 'default' : 'pointer',
            visibility: selected === 'bloomberg' ? 'hidden' : 'visible',
            transition: 'background 0.3s ease, border-color 0.3s ease',
          }}
        >
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: font.mono, fontSize: 9.5, fontWeight: 700, color: bbgCardP.orange, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.3s ease' }}>Bloomberg</span>
              <span style={{ fontFamily: font.mono, fontSize: 9, fontWeight: 700, color: bbgCardP.muted, transition: 'color 0.3s ease' }}>INFLOW/OUTFLOW</span>
            </div>
            <div style={{ fontFamily: font.mono, fontSize: 40, fontWeight: 700, color: bbgCardP.text, lineHeight: 1, letterSpacing: '-1px', transition: 'color 0.3s ease' }}>140</div>
            <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, marginTop: 6, color: bbgCardP.green, transition: 'color 0.3s ease' }}>
              ▲ +27.3% <span style={{ color: bbgCardP.muted, transition: 'color 0.3s ease' }}>VS MIDNIGHT</span>
            </div>
          </div>
          <div style={{ marginTop: 16 }}><MiniBBGChart p={bbgCardP} /></div>
        </motion.div>

        {/* ── Stripe card ── */}
        <motion.div layoutId="str-card" transition={STR_SPRING}
          onClick={() => { if (!isExpanded) { setStrCardHover(false); setSelected('stripe') } }}
          onMouseEnter={() => !isExpanded && setStrCardHover(true)}
          onMouseLeave={() => setStrCardHover(false)}
          whileHover={!isExpanded ? { scale: 1.02, transition: { type: 'tween', duration: 0.2, ease: 'easeOut' } } : {}}
          style={{
            background: strCardP.bg, border: `1px solid ${strCardP.border}`, borderRadius: 16, overflow: 'hidden',
            cursor: isExpanded ? 'default' : 'pointer',
            visibility: selected === 'stripe' ? 'hidden' : 'visible',
            transition: 'background 0.35s ease, border-color 0.35s ease',
          }}
        >
          <div style={{ padding: '20px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: 700, color: strCardP.purple, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.35s ease' }}>Stripe</span>
              <span style={{ fontFamily: font.body, fontSize: 10, color: strCardP.muted, transition: 'color 0.35s ease' }}>Inflow vs Outflow</span>
            </div>
            <div style={{ fontFamily: font.body, fontSize: 42, fontWeight: 600, color: strCardP.text, lineHeight: 1, letterSpacing: '-0.5px', transition: 'color 0.35s ease' }}>140</div>
            <div style={{ fontFamily: font.body, fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', background: strCardP.badge, color: strCardP.purple, fontWeight: 600, fontSize: 11, borderRadius: 4, padding: '2px 7px', transition: 'background 0.35s ease, color 0.35s ease' }}>+27.3%</span>
              <span style={{ color: strCardP.muted, transition: 'color 0.35s ease' }}>vs midnight</span>
            </div>
          </div>
          <div style={{ marginTop: 14 }}><MiniStripeChart p={strCardP} /></div>
        </motion.div>
      </motion.div>

      {/* ═══ Expanded overlays ═══════════════════════════════════════════════ */}
      <AnimatePresence>

        {/* ── Robinhood expanded ── */}
        {selected === 'robinhood' && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }} onClick={() => setSelected(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 40 }}
            />
            <motion.div layoutId="rh-card" transition={RH_SPRING}
              style={{
                position: 'fixed', top: '8vh', left: '14vw', right: '14vw',
                maxHeight: '84vh', overflowY: 'auto',
                background: rp.bg, border: `1px solid ${rp.border}`,
                borderRadius: 20, zIndex: 50, display: 'flex', flexDirection: 'column',
              }}
            >
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ delay: 0.18, duration: 0.28 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px 24px' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, color: rp.green, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Robinhood Style</div>
                    <div style={{ fontFamily: font.body, fontSize: 14, color: rp.muted }}>Loan Throughput · Outflow vs Inflow Demand</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: rp.bg === '#FFFFFF' ? '#F0F0F0' : 'rgba(255,255,255,0.07)', border: `1px solid ${rp.dim}`, borderRadius: 8, padding: '4px 10px' }}>
                      <ModeToggle mode={rhMode} color={rp.muted} onToggle={(e) => { e.stopPropagation(); setRhMode(m => m === 'dark' ? 'light' : 'dark') }} />
                      <span style={{ fontFamily: font.body, fontSize: 13, color: rp.muted }}>{rhMode === 'dark' ? 'Dark' : 'Light'}</span>
                    </div>
                    <button onClick={() => setSelected(null)} style={{ background: rp.bg === '#FFFFFF' ? '#F0F0F0' : 'rgba(255,255,255,0.07)', border: `1px solid ${rp.dim}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: rp.muted, flexShrink: 0 }}>
                      <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: font.heading, fontSize: 48, fontWeight: 700, color: rp.text, lineHeight: 1 }}>{periodData[rhPeriod].outflow.at(-1)}</span>
                    <span style={{ fontFamily: font.body, fontSize: 15, color: rp.muted }}>loans / hr</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 10 }}>
                    {(() => { const d = delta(periodData[rhPeriod]); return <span style={{ fontFamily: font.body, fontSize: 14, color: d.positive ? rp.green : '#FF5000', fontWeight: 600 }}>{d.str}</span> })()}
                    <span style={{ fontFamily: font.body, fontSize: 13, color: rp.muted }}>vs period start</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 4 }}>
                      {[{ color: rp.green, dash: false, label: 'Outflow' }, { color: rp.inflow, dash: true, label: 'Inflow' }].map(({ color, dash, label }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={color} strokeWidth={dash ? 1 : 1.5} strokeDasharray={dash ? '5 3' : undefined} /></svg>
                          <span style={{ fontFamily: font.body, fontSize: 13, color: rp.muted }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{}}><ExpandedRHChart period={rhPeriod} p={rp} /></div>

                <div style={{ display: 'flex', gap: 2, marginTop: 16 }}>
                  {(['Today', '1D', '1W', '1M'] as Period[]).map(p => (
                    <button key={p} onClick={(e) => { e.stopPropagation(); setRhPeriod(p) }} style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, background: rhPeriod === p ? (rp.bg === '#FFFFFF' ? '#EBEBEB' : 'rgba(255,255,255,0.1)') : 'transparent', border: 'none', borderRadius: 7, color: rhPeriod === p ? rp.text : rp.muted, padding: '6px 16px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s' }}>{p}</button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* ── Bloomberg expanded ── */}
        {selected === 'bloomberg' && (() => {
          const s = stats(bbgPeriod)
          const d = delta(periodData[bbgPeriod])
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }} onClick={() => setSelected(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 40 }}
              />
              <motion.div layoutId="bbg-card" transition={BBG_SPRING}
                style={{ position: 'fixed', top: '8vh', left: '14vw', right: '14vw', maxHeight: '84vh', overflowY: 'auto', background: bp.bg, border: `1px solid ${bp.border}`, borderRadius: 20, zIndex: 50, display: 'flex', flexDirection: 'column' }}
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.18, duration: 0.28 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 28px 20px' }}
                >
                  <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: bp.orange, letterSpacing: '0.06em', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>SHIFT ── LOAN OPS THROUGHPUT</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: bp.muted }}>MAR 28, 2026</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(240,147,28,0.08)', border: `1px solid ${bp.orange}`, borderRadius: 4, padding: '3px 8px', opacity: 0.85 }}>
                        <ModeToggle mode={bbgMode} color={bp.orange} onToggle={(e) => { e.stopPropagation(); setBbgMode(m => m === 'dark' ? 'light' : 'dark') }} />
                        <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: bp.orange }}>{bbgMode === 'dark' ? 'DARK' : 'LIGHT'}</span>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: 'rgba(240,147,28,0.1)', border: `1px solid ${bp.orange}`, borderRadius: 4, width: 28, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: bp.orange, fontFamily: font.mono, fontSize: 11, fontWeight: 700 }}>✕</button>
                    </div>
                  </div>

                  <div style={{ height: 1, background: bp.orange, marginBottom: 16, opacity: 0.4 }} />

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <span style={{ fontFamily: font.mono, fontSize: 48, fontWeight: 700, color: bp.text, letterSpacing: '-1px', lineHeight: 1 }}>{s.last}</span>
                      <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: bp.muted }}>OUT/HR</span>
                      <span style={{ fontFamily: font.mono, fontSize: 15, fontWeight: 700, color: d.positive ? bp.green : bp.red, marginLeft: 4 }}>{d.positive ? '▲' : '▼'} {d.str}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 0, marginTop: 10, borderTop: `1px solid ${bp.dim}`, borderBottom: `1px solid ${bp.dim}`, padding: '7px 0' }}>
                      {[
                        { label: 'HIGH', value: s.high,                                 color: bp.orange },
                        { label: 'LOW',  value: s.low,                                  color: bp.orange },
                        { label: 'AVG',  value: s.avg,                                  color: bp.text   },
                        { label: 'IN',   value: periodData[bbgPeriod].inflow.at(-1)!,   color: bp.amber  },
                        { label: 'GAP',  value: s.gap > 0 ? `+${s.gap}` : `${s.gap}`,  color: s.gap > 0 ? bp.red : bp.green },
                      ].map(({ label, value, color }, idx, arr) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: idx === 0 ? 0 : 20, paddingRight: 20, borderRight: idx < arr.length - 1 ? `1px solid ${bp.dim}` : 'none' }}>
                          <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: bp.muted, letterSpacing: '0.08em' }}>{label}</span>
                          <span style={{ fontFamily: font.mono, fontSize: 15, fontWeight: 700, color }}>{value}</span>
                        </div>
                      ))}
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
                        {[{ color: bp.orange, dash: false, label: 'OUT' }, { color: bp.amber, dash: true, label: 'IN' }].map(({ color, dash, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <svg width="14" height="8"><line x1="0" y1="4" x2="14" y2="4" stroke={color} strokeWidth={dash ? 1 : 2.5} strokeDasharray={dash ? '4 3' : undefined} /></svg>
                            <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: bp.muted }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{}}><ExpandedBBGChart period={bbgPeriod} p={bp} /></div>

                  <div style={{ marginTop: 10, borderTop: `1px solid ${bp.dim}`, paddingTop: 10, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 0' }}>
                    {[{ label: 'OUT', values: periodData[bbgPeriod].outflow, color: bp.orange }, { label: 'IN', values: periodData[bbgPeriod].inflow, color: bp.amber }].map(({ label, values, color }) => (
                      <div key={label} style={{ display: 'contents' }}>
                        <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: bp.muted, paddingRight: 16, letterSpacing: '0.08em' }}>{label} │</span>
                        <div style={{ display: 'flex' }}>{values.map((v, i) => <span key={i} style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color, paddingRight: 16 }}>{v}</span>)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 2, marginTop: 14 }}>
                    {(['Today', '1D', '1W', '1M'] as Period[]).map(p => (
                      <button key={p} onClick={(e) => { e.stopPropagation(); setBbgPeriod(p) }} style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, background: bbgPeriod === p ? 'rgba(240,147,28,0.12)' : 'transparent', border: bbgPeriod === p ? `1px solid ${bp.orange}` : '1px solid transparent', borderRadius: 4, color: bbgPeriod === p ? bp.orange : bp.muted, padding: '4px 14px', cursor: 'pointer', letterSpacing: '0.05em', transition: 'background 0.12s, color 0.12s, border-color 0.12s' }}>
                        {bbgPeriod === p ? `[${p}]` : p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )
        })()}

        {/* ── Stripe expanded ── */}
        {selected === 'stripe' && (() => {
          const s = stats(strPeriod)
          const d = delta(periodData[strPeriod])
          return (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }} onClick={() => setSelected(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.55)', zIndex: 40 }}
              />
              <motion.div layoutId="str-card" transition={STR_SPRING}
                style={{ position: 'fixed', top: '8vh', left: '14vw', right: '14vw', maxHeight: '84vh', overflowY: 'auto', background: sp.bg, border: `1px solid ${sp.border}`, borderRadius: 20, zIndex: 50, display: 'flex', flexDirection: 'column' }}
              >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ delay: 0.18, duration: 0.28 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '28px 32px 24px' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, color: sp.purple, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5 }}>Stripe Style</div>
                      <div style={{ fontFamily: font.body, fontSize: 14, color: sp.muted }}>Loan Throughput · Outflow vs Inflow Demand</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: sp.dim, border: `1px solid ${sp.border}`, borderRadius: 8, padding: '4px 10px' }}>
                        <ModeToggle mode={strMode} color={sp.muted} onToggle={(e) => { e.stopPropagation(); setStrMode(m => m === 'dark' ? 'light' : 'dark') }} />
                        <span style={{ fontFamily: font.body, fontSize: 13, color: sp.muted }}>{strMode === 'dark' ? 'Dark' : 'Light'}</span>
                      </div>
                      <button onClick={() => setSelected(null)} style={{ background: sp.dim, border: `1px solid ${sp.border}`, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sp.muted, flexShrink: 0 }}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 12 12"><path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  </div>

                  {/* Hero metric */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{ fontFamily: font.body, fontSize: 48, fontWeight: 600, color: sp.text, lineHeight: 1, letterSpacing: '-1px' }}>{periodData[strPeriod].outflow.at(-1)}</span>
                      <span style={{ fontFamily: font.body, fontSize: 15, color: sp.muted }}>loans / hr</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', background: d.positive ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', color: d.positive ? '#059669' : '#DC2626', fontFamily: font.body, fontWeight: 600, fontSize: 13, borderRadius: 6, padding: '3px 10px', marginLeft: 4 }}>
                        {d.positive ? '↑' : '↓'} {d.str}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
                      <span style={{ fontFamily: font.body, fontSize: 13, color: sp.muted }}>vs period start</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {[{ color: sp.purple, dash: false, label: 'Outflow' }, { color: sp.teal, dash: true, label: 'Inflow' }].map(({ color, dash, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="16" height="8"><line x1="0" y1="4" x2="16" y2="4" stroke={color} strokeWidth={dash ? 1.5 : 2} strokeDasharray={dash ? '6 4' : undefined} /></svg>
                            <span style={{ fontFamily: font.body, fontSize: 13, color: sp.muted }}>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary tiles */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                    {[
                      { label: 'Peak',       value: s.high,                                  color: sp.purple },
                      { label: 'Low',        value: s.low,                                   color: sp.muted  },
                      { label: 'Avg',        value: s.avg,                                   color: sp.text   },
                      { label: 'Demand gap', value: s.gap > 0 ? `+${s.gap}` : `${s.gap}`,   color: s.gap > 0 ? '#DC2626' : '#059669' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ background: sp.dim, border: `1px solid ${sp.border}`, borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontFamily: font.body, fontSize: 11, color: sp.muted, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: font.body, fontSize: 20, fontWeight: 600, color, letterSpacing: '-0.3px' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div style={{}}><ExpandedStripeChart period={strPeriod} p={sp} /></div>

                  {/* Period tabs — pill style */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 16, background: sp.dim, border: `1px solid ${sp.border}`, borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
                    {(['Today', '1D', '1W', '1M'] as Period[]).map(p => (
                      <button key={p} onClick={(e) => { e.stopPropagation(); setStrPeriod(p) }}
                        style={{ fontFamily: font.body, fontSize: 13, fontWeight: 600, background: strPeriod === p ? sp.bg : 'transparent', border: 'none', borderRadius: 7, color: strPeriod === p ? sp.purple : sp.muted, padding: '5px 16px', cursor: 'pointer', transition: 'background 0.15s, color 0.15s', boxShadow: strPeriod === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </>
          )
        })()}

      </AnimatePresence>
    </div>
  )
}
