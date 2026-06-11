import { useLocation } from 'react-router-dom'
import Sidenave from './Sidenav'

export default function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--surface-page)'
    }}>

{/* SIDEBAR — floating card */}
<div style={{
  position: 'fixed',
  top: 16,
  left: 16,
  width: 64,
  height: 'auto',
  zIndex: 100,
  borderRadius: 10,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)'
}}>
  <Sidenave />
</div>

      {/* MAIN CONTENT */}
      <main
        key={pathname}
        className="page-enter"
        style={{
          marginLeft: 96,
          flex: 1,
          minHeight: '100vh',
          padding: 24
        }}
      >
        {children}

        <footer className="tw-credit">
          This prototype uses generalized terminology. Internal system names, proprietary metrics, and business-specific thresholds have been abstracted to protect confidential information. Visuals were built using{' '}
          <a href="https://linzlos.github.io/tiny-wire/" target="_blank" rel="noopener noreferrer">Tiny Wire</a>{' '}
          (<a href="https://github.com/LinzLos/tiny-wire" target="_blank" rel="noopener noreferrer">source</a>), a design system I created. The design decisions, constraints, and interactions shown are accurate representations of the work.
        </footer>
      </main>

    </div>
  )
}