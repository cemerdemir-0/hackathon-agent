import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)' }}>
      <header style={{
        borderBottom: '1px solid var(--black)',
        padding: '0 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '24px',
            fontWeight: 300,
            letterSpacing: '0.12em',
            color: 'var(--black)',
            textTransform: 'uppercase',
          }}>
            Nöbetçi Ajan
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '0.2em',
            color: 'var(--gray-400)',
            textTransform: 'uppercase',
          }}>
            KOBİ Operasyon
          </span>
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'var(--gray-400)',
          textTransform: 'uppercase',
        }}>
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </header>
      <main style={{ padding: '48px', maxWidth: '1400px', margin: '0 auto' }}>
        <Dashboard />
      </main>
    </div>
  )
}
