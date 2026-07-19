import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import svgPaths from './svg-paths'

function MenuBrand() {
  return (
    <div style={{
      width: 64,
      height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="24" height="24" fill="none" viewBox="0 0 26 26">
        <path d={svgPaths.p4be94d2} stroke="var(--logo)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      </svg>
    </div>
  )
}

function Divider() {
  return (
    <div style={{ width: 64, height: 1, background: 'var(--border)', flexShrink: 0 }} />
  )
}

function IconSun() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function IconMoon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark')
  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) document.documentElement.setAttribute('data-theme', 'dark')
    else document.documentElement.removeAttribute('data-theme')
    try { localStorage.setItem('tw-theme', next ? 'dark' : 'light') } catch { /* ignore */ }
  }
  return (
    <div className="nav-item-wrap" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
        aria-pressed={dark}
        style={{
          width: 40, height: 40, borderRadius: 8, border: 0, background: 'transparent',
          color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          transition: 'background 0.18s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
      >
        {dark ? <IconSun /> : <IconMoon />}
      </button>
      <div className="nav-tooltip">{dark ? 'Switch to light' : 'Switch to dark'}</div>
    </div>
  )
}

const navItems = [
  { path: '/',              label: 'Overview',      viewBox: '0 0 20 20.9592',   d: svgPaths.p9d7d500   },
  { path: '/queue-monitor', label: 'Queue Monitor', viewBox: '0 0 22 20',        d: 'M21 10H17L14 19L8 1L5 10H1' },
  { path: '/simulation',   label: 'Simulation',    viewBox: '0 0 20 16',        d: svgPaths.p13148300  },
  { path: '/performance',  label: 'Performance',   viewBox: '0 0 21 21',        d: svgPaths.p266d6340  },
  { path: '/roster',       label: 'Roster',        viewBox: '0 0 22 22.0001',   d: svgPaths.p383f7100  },
  // Viz Lab — internal design lab, hidden from the product nav for portfolio
  // { path: '/viz-lab',      label: 'Viz Lab',       viewBox: '0 0 20 22',        d: 'M7 2h6M8 2v6L4 16a2 2 0 001.8 2.9h8.4A2 2 0 0016 16l-4-8V2' },
]

export default function Sidenave() {
  const { pathname } = useLocation()

  return (
    <div style={{
      background: 'var(--surface-subtle)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 64,
    }}>
      <MenuBrand />
      <Divider />

      {/* Nav items */}
      <nav aria-label="Primary" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px 8px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {navItems.map(({ path, label, viewBox, d }) => {
          // /loans is a Queue Monitor drill-down, so its nav item stays lit there.
          const isActive = pathname === path || (path === '/queue-monitor' && pathname === '/loans')
          const strokeColor = isActive ? 'var(--brand)' : 'var(--text-tertiary)'
          return (
            <div key={path} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="nav-item-wrap">
              <Link
                to={path}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--surface-muted)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: isActive ? 'var(--surface-muted)' : 'transparent',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'background 0.18s ease',
                }}
              >
                <svg width="20" height="20" fill="none" viewBox={viewBox} aria-hidden="true">
                  <path d={d} style={{ stroke: strokeColor }} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <div className="nav-tooltip">
                {label}
              </div>
            </div>
          )
        })}
      </nav>

      <Divider />
      <div style={{ padding: '8px 8px 12px', display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
        <ThemeToggle />
      </div>
    </div>
  )
}
