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
        <path d={svgPaths.p4be94d2} stroke="#CE430A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
    <button
      type="button"
      onClick={toggle}
      title={dark ? 'Switch to light' : 'Switch to dark'}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      style={{
        width: 40, height: 40, borderRadius: 8, border: 0, background: 'transparent',
        color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        transition: 'background 0.18s ease, color 0.18s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)' }}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  )
}

const navItems = [
  { path: '/',              label: 'Overview',      viewBox: '0 0 20 20.9592',   d: svgPaths.p9d7d500   },
  { path: '/queue-monitor', label: 'Queue Monitor', viewBox: '0 0 22 20',        d: 'M21 10H17L14 19L8 1L5 10H1' },
  { path: '/simulation',   label: 'Simulation',    viewBox: '0 0 20 16',        d: svgPaths.p13148300  },
  { path: '/performance',  label: 'Performance',   viewBox: '0 0 21 21',        d: svgPaths.p266d6340  },
  { path: '/roster',       label: 'Roster',        viewBox: '0 0 22 22.0001',   d: svgPaths.p383f7100  },
  { path: '/viz-lab',      label: 'Viz Lab',       viewBox: '0 0 20 22',        d: 'M7 2h6M8 2v6L4 16a2 2 0 001.8 2.9h8.4A2 2 0 0016 16l-4-8V2' },
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '16px 8px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {navItems.map(({ path, label, viewBox, d }) => {
          const isActive = pathname === path
          const strokeColor = isActive ? 'var(--brand)' : 'var(--text-tertiary)'
          return (
            <div key={path} style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="nav-item-wrap">
              <Link
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  background: isActive ? 'var(--surface)' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                }}
              >
                <svg width="20" height="20" fill="none" viewBox={viewBox}>
                  <path d={d} style={{ stroke: strokeColor }} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <div className="nav-tooltip">
                {label}
              </div>
            </div>
          )
        })}
      </div>

      <Divider />
      <div style={{ padding: '8px 8px 12px', display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
        <ThemeToggle />
      </div>
    </div>
  )
}
