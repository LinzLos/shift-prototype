export default function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="toast-enter" role="status" style={{
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
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, display: 'flex', alignItems: 'center' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
