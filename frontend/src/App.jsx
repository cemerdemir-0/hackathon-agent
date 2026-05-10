import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import LoginScreen from './components/LoginScreen'

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('na_auth') === '1')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = () => {
    sessionStorage.setItem('na_auth', '1')
    setAuthed(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('na_auth')
    setAuthed(false)
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />

  const timeStr = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(15,15,17,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--accent)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#000" strokeWidth="1.5"/>
              <path d="M7 4v3l2 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--text-1)',
            letterSpacing: '-0.01em',
          }}>
            Nöbetçi Ajan
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-3)',
            letterSpacing: '0.05em',
            padding: '2px 8px',
            background: 'var(--surface2)',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}>
            KOBİ OPS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-3)',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ color: 'var(--text-2)' }}>{timeStr}</span>
            <span>·</span>
            <span>{dateStr}</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px',
            background: 'rgba(78,168,114,0.1)',
            border: '1px solid rgba(78,168,114,0.2)',
            borderRadius: '20px',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2s infinite',
              display: 'block',
            }}/>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--success)',
              letterSpacing: '0.05em',
            }}>
              CANLI
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--text-3)',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text-2)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-3)' }}
          >
            Çıkış
          </button>
        </div>
      </header>

      <main style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
        <Dashboard />
      </main>
    </div>
  )
}
