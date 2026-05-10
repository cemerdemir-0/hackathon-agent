import { exportReport } from '../utils/exportPdf'

const API = 'http://localhost:8000'

export default function StatsBar({ orders, stock, onTriggerReport, reporting }) {
  const total     = orders.length
  const pending   = orders.filter(o => o.status === 'pending').length
  const delivered = orders.filter(o => o.status === 'delivered').length
  const critical  = stock.filter(s => s.quantity <= s.threshold).length

  const stats = [
    { label: 'Toplam Sipariş', value: total,    color: 'var(--text-1)', accent: 'var(--accent)' },
    { label: 'Bekleyen',       value: pending,  color: '#e8a94d',       accent: 'rgba(232,169,77,0.15)' },
    { label: 'Teslim Edilen',  value: delivered,color: '#4ea872',       accent: 'rgba(78,168,114,0.15)' },
    { label: 'Kritik Stok',    value: critical, color: critical > 0 ? '#e05a4e' : '#4ea872', accent: critical > 0 ? 'rgba(224,90,78,0.15)' : 'rgba(78,168,114,0.15)' },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '12px',
      marginBottom: '4px',
    }}>
      {stats.map((s, i) => (
        <div key={i} className="fade-up" style={{
          animationDelay: `${i * 0.05}s`,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0, right: 0,
            width: '60px', height: '60px',
            background: s.accent,
            borderRadius: '0 10px 0 60px',
          }}/>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
          }}>
            {s.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '32px',
            fontWeight: 700,
            color: s.color,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {s.value}
          </span>
        </div>
      ))}

      {/* Trigger report button */}
      <div className="fade-up" style={{
        animationDelay: '0.2s',
        background: reporting ? 'rgba(232,169,77,0.08)' : 'var(--surface)',
        border: `1px solid ${reporting ? 'rgba(232,169,77,0.3)' : 'var(--border)'}`,
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: reporting ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
        onClick={!reporting ? onTriggerReport : undefined}
        onMouseEnter={e => { if (!reporting) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(232,169,77,0.05)' }}}
        onMouseLeave={e => { if (!reporting) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: reporting ? 'var(--accent)' : 'var(--text-3)',
        }}>
          {reporting ? 'Çalışıyor...' : 'Rapor Tetikle'}
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '24px',
          fontWeight: 700,
          color: reporting ? 'var(--accent)' : 'var(--text-2)',
          lineHeight: 1,
        }}>
          {reporting ? (
            <span style={{ animation: 'pulse 1s infinite', display: 'inline-block' }}>⟳</span>
          ) : '▶'}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-3)',
        }}>
          Multi-agent rapor
        </span>
      </div>

      {/* PDF Export */}
      <div className="fade-up" style={{
        animationDelay: '0.25s',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
        onClick={() => exportReport(orders, stock)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(110,181,255,0.4)'; e.currentTarget.style.background = 'rgba(110,181,255,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-3)',
        }}>
          PDF İndir
        </span>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '24px',
          fontWeight: 700,
          color: '#6eb5ff',
          lineHeight: 1,
        }}>
          ↓
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-3)',
        }}>
          Stok + sipariş raporu
        </span>
      </div>
    </div>
  )
}
