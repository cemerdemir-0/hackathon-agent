import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function StockTable() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/stock`)
      .then(r => r.json())
      .then(d => { setStock(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '32px' }}>
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
          Stok Durumu
        </span>
        {stock.filter(s => s.quantity <= s.threshold).length > 0 && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c0392b',
          }}>
            {stock.filter(s => s.quantity <= s.threshold).length} kritik
          </span>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Ürün', 'Miktar', 'Birim', 'Eşik', 'Durum'].map(h => (
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
          ) : stock.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ ...tdStyle, color: 'var(--gray-400)', textAlign: 'center', padding: '32px' }}>
                Stok verisi bulunamadı
              </td>
            </tr>
          ) : stock.map((s, i) => {
            const critical = s.quantity <= s.threshold
            const pct = Math.min(100, Math.round((s.quantity / s.threshold) * 100))
            return (
              <tr
                key={s.product}
                className="animate-fade-up"
                style={{
                  borderBottom: '1px solid var(--gray-100)',
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0,
                  background: critical ? 'rgba(192,57,43,0.03)' : 'transparent',
                }}
              >
                <td style={{ ...tdStyle, fontWeight: 400 }}>{s.product}</td>
                <td style={{ ...tdStyle }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: '16px',
                      fontWeight: critical ? 500 : 300,
                      color: critical ? '#c0392b' : 'var(--black)',
                    }}>
                      {s.quantity}
                    </span>
                    <div style={{ width: '32px', height: '2px', background: 'var(--gray-100)', position: 'relative' }}>
                      <div style={{
                        position: 'absolute',
                        left: 0, top: 0,
                        height: '100%',
                        width: `${pct}%`,
                        background: critical ? '#c0392b' : 'var(--black)',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                </td>
                <td style={{ ...tdStyle, color: 'var(--gray-400)' }}>{s.unit}</td>
                <td style={{ ...tdStyle, color: 'var(--gray-400)' }}>{s.threshold}</td>
                <td style={tdStyle}>
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '9px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: critical ? '#c0392b' : 'var(--gray-400)',
                    borderBottom: critical ? '1px solid #c0392b' : 'none',
                    paddingBottom: critical ? '1px' : '0',
                  }}>
                    {critical ? 'Kritik' : 'Normal'}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
