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
    <div style={{ width: 64, height: 1, background: '#DDD7D5', flexShrink: 0 }} />
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
      background: '#F7F4F3',
      border: '1px solid #DDD7D5',
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
          const strokeColor = isActive ? '#629460' : '#8A7E7D'
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
                  background: isActive ? '#FFFFFF' : 'transparent',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                }}
              >
                <svg width="20" height="20" fill="none" viewBox={viewBox}>
                  <path d={d} stroke={strokeColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </Link>
              <div className="nav-tooltip">
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
