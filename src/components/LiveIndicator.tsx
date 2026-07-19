import { useState } from 'react'

const font = {
  body: "'DM Sans', sans-serif",
}

// Honest real-time-only status: instead of a dead time-range toggle, screens
// without historical data show this pill and explain where time ranges live.
export default function LiveIndicator({
  tooltipTitle = 'Real-time only',
  tooltipBody,
}: {
  tooltipTitle?: string
  tooltipBody: React.ReactNode
}) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 38,
        padding: '0 12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
      }}>
        <span className="live-dot" style={{
          width: 7,
          height: 7,
          borderRadius: 100,
          background: 'var(--brand)',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: font.body,
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.012px',
          whiteSpace: 'nowrap',
        }}>
          Real Time
        </span>
        <button
          onMouseEnter={() => setShowTip(true)}
          onMouseLeave={() => setShowTip(false)}
          onFocus={() => setShowTip(true)}
          onBlur={() => setShowTip(false)}
          aria-label="Why is this view real-time only?"
          style={{
            background: 'none', border: 'none', padding: 0, marginLeft: 2,
            cursor: 'default', display: 'flex', alignItems: 'center',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6.5" cy="6.5" r="5.5" stroke="var(--text-tertiary)" strokeWidth="1.1" />
            <path d="M6.5 5.8V9.2" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="6.5" cy="3.9" r="0.7" fill="var(--text-tertiary)" />
          </svg>
        </button>
      </div>

      {showTip && (
        <div
          className="filter-enter"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 200,
            maxWidth: 230,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            zIndex: 300,
          }}
        >
          <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {tooltipTitle}
          </div>
          <span style={{ fontFamily: font.body, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {tooltipBody}
          </span>
        </div>
      )}
    </div>
  )
}
