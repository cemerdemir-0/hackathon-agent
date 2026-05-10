import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

const STATUS_META = {
  pending:   { label: 'Bekliyor', dot: 'var(--gray-400)' },
  shipped:   { label: 'Kargoda',  dot: 'var(--black)' },
  delivered: { label: 'Teslim',   dot: 'var(--black)' },
  cancelled: { label: 'İptal',    dot: '#c0392b' },
}

export default function OrderList() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/orders`)
      .then(r => r.json())
      .then(d => { setOrders(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '32px' }}>
      <TableHeader title="Siparişler" count={orders.length} />

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['No', 'Müşteri', 'Ürün', 'Durum', 'Tarih'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, color: 'var(--gray-400)', textAlign: 'center', padding: '32px' }}>
                Yükleniyor...
              </td>
            </tr>
          ) : orders.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, color: 'var(--gray-400)', textAlign: 'center', padding: '32px' }}>
                Sipariş bulunamadı
              </td>
            </tr>
          ) : orders.map((o, i) => {
            const meta = STATUS_META[o.status] || { label: o.status, dot: 'var(--gray-400)' }
            return (
              <tr
                key={o.id}
                className="animate-fade-up"
                style={{
                  borderBottom: '1px solid var(--gray-100)',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                }}
              >
                <td style={{ ...tdStyle, fontFamily: "'DM Mono', monospace", fontSize: '11px', color: 'var(--gray-400)' }}>
                  #{o.id}
                </td>
                <td style={{ ...tdStyle, fontWeight: 400 }}>{o.customer}</td>
                <td style={{ ...tdStyle, color: 'var(--gray-600)' }}>{o.product}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '5px', height: '5px',
                      borderRadius: '50%',
                      background: meta.dot,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {meta.label}
                    </span>
                  </div>
                </td>
                <td style={{ ...tdStyle, color: 'var(--gray-400)', fontSize: '11px' }}>{o.created_at}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TableHeader({ title, count }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '1px solid var(--black)',
    }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '20px',
        fontWeight: 300,
        letterSpacing: '0.05em',
      }}>
        {title}
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        color: 'var(--gray-400)',
        letterSpacing: '0.1em',
      }}>
        {count} kayıt
      </span>
    </div>
  )
}

const thStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'var(--gray-400)',
  fontWeight: 400,
  textAlign: 'left',
  padding: '0 0 12px 0',
  borderBottom: '1px solid var(--gray-200)',
}

const tdStyle = {
  fontFamily: "'DM Mono', monospace",
  fontSize: '12px',
  fontWeight: 300,
  padding: '12px 0',
  color: 'var(--black)',
  verticalAlign: 'middle',
}
