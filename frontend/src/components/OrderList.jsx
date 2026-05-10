import { useEffect, useState } from 'react'
import OrderModal from './OrderModal'

const API = 'http://localhost:8000'

const STATUS = {
  pending:   { label: 'Bekliyor',  color: '#e8a94d', bg: 'rgba(232,169,77,0.1)' },
  shipped:   { label: 'Kargoda',   color: '#6eb5ff', bg: 'rgba(110,181,255,0.1)' },
  delivered: { label: 'Teslim',    color: '#4ea872', bg: 'rgba(78,168,114,0.1)' },
  cancelled: { label: 'İptal',     color: '#e05a4e', bg: 'rgba(224,90,78,0.1)' },
}

export default function OrderList({ onDataLoad }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetch(`${API}/orders`)
      .then(r => r.json())
      .then(d => {
        setOrders(d)
        setLoading(false)
        onDataLoad?.(d)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton rows={4} cols={5} />

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
          <thead>
            <tr>
              {['No', 'Müşteri', 'Ürün', 'Durum', 'Tarih'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...TD, textAlign: 'center', color: 'var(--text-3)', padding: '32px' }}>
                  Sipariş bulunamadı
                </td>
              </tr>
            ) : orders.map((o, i) => {
              const s = STATUS[o.status] || { label: o.status, color: 'var(--text-3)', bg: 'var(--surface2)' }
              return (
                <tr
                  key={o.id}
                  className="fade-up"
                  onClick={() => setSelected(o)}
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...TD, color: 'var(--text-3)', fontSize: '11px' }}>#{o.id}</td>
                  <td style={{ ...TD, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '13px', color: 'var(--text-1)' }}>
                    {o.customer}
                  </td>
                  <td style={{ ...TD, color: 'var(--text-2)', fontSize: '12px' }}>{o.product}</td>
                  <td style={TD}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '3px 8px',
                      background: s.bg,
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      color: s.color,
                      letterSpacing: '0.03em',
                    }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: s.color, flexShrink: 0 }}/>
                      {s.label}
                    </span>
                  </td>
                  <td style={{ ...TD, color: 'var(--text-3)', fontSize: '11px' }}>{o.created_at}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && <OrderModal order={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

const TH = {
  fontFamily: 'var(--font-mono)',
  fontSize: '10px',
  fontWeight: 400,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-3)',
  padding: '10px 20px',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
  background: 'var(--surface)',
}

const TD = {
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  fontWeight: 300,
  padding: '12px 20px',
  color: 'var(--text-2)',
  verticalAlign: 'middle',
}

function Skeleton({ rows, cols }) {
  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '12px' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} style={{
              height: '14px',
              flex: j === 0 ? '0 0 40px' : j === 2 ? '2' : '1',
              background: 'var(--surface2)',
              borderRadius: '3px',
              overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${i * 0.1}s`,
              }}/>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
