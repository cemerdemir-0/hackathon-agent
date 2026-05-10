import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function StockTable({ onDataLoad }) {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`${API}/stock`)
      .then(r => r.json())
      .then(d => {
        setStock(d)
        setLoading(false)
        onDataLoad?.(d)
      })
      .catch(() => setLoading(false))
  }, [])

  const startEdit = (product, quantity) => {
    setEditing(product)
    setEditVal(String(quantity))
  }

  const saveEdit = async (product) => {
    const qty = parseInt(editVal)
    if (isNaN(qty) || qty < 0) { setEditing(null); return }
    setSaving(true)
    try {
      await fetch(`${API}/stock/${encodeURIComponent(product)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      })
      setStock(prev => prev.map(s => s.product === product ? { ...s, quantity: qty } : s))
    } catch {}
    setSaving(false)
    setEditing(null)
  }

  const criticalCount = stock.filter(s => s.quantity <= s.threshold).length

  if (loading) return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ height: '44px', background: 'var(--surface2)', borderRadius: '6px', opacity: 1 - i * 0.15 }}/>
      ))}
    </div>
  )

  return (
    <div>
      {criticalCount > 0 && (
        <div style={{
          margin: '12px 20px 0',
          padding: '8px 12px',
          background: 'rgba(224,90,78,0.08)',
          border: '1px solid rgba(224,90,78,0.2)',
          borderRadius: '6px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: 'var(--danger)', fontSize: '12px' }}>⚠</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--danger)', letterSpacing: '0.03em' }}>
            {criticalCount} ürün kritik seviyede
          </span>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
          <thead>
            <tr>
              {['Ürün', 'Miktar / Eşik', 'Birim', 'Durum'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stock.map((s, i) => {
              const critical = s.quantity <= s.threshold
              const pct = Math.min(100, Math.round((s.quantity / (s.threshold || 1)) * 100))
              const isEditing = editing === s.product
              return (
                <tr key={s.product} className="fade-up" style={{
                  animationDelay: `${i * 0.04}s`,
                  borderBottom: '1px solid var(--border)',
                  background: critical ? 'rgba(224,90,78,0.04)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = critical ? 'rgba(224,90,78,0.08)' : 'var(--surface2)' }}
                  onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = critical ? 'rgba(224,90,78,0.04)' : 'transparent' }}
                >
                  <td style={{ ...TD, fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '13px', color: 'var(--text-1)' }}>
                    {s.product}
                  </td>
                  <td style={TD}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            autoFocus
                            value={editVal}
                            onChange={e => setEditVal(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(s.product)
                              if (e.key === 'Escape') setEditing(null)
                            }}
                            style={{
                              width: '64px',
                              background: 'var(--surface2)',
                              border: '1px solid var(--accent)',
                              borderRadius: '5px',
                              padding: '4px 8px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              color: 'var(--text-1)',
                              outline: 'none',
                            }}
                          />
                          <button onClick={() => saveEdit(s.product)} disabled={saving} style={{
                            background: 'var(--accent)', border: 'none', borderRadius: '4px',
                            padding: '4px 8px', cursor: 'pointer',
                            fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#000',
                          }}>
                            {saving ? '...' : 'Kaydet'}
                          </button>
                          <button onClick={() => setEditing(null)} style={{
                            background: 'transparent', border: '1px solid var(--border)',
                            borderRadius: '4px', padding: '4px 6px', cursor: 'pointer',
                            color: 'var(--text-3)', fontSize: '10px',
                          }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            onClick={() => startEdit(s.product, s.quantity)}
                            title="Düzenle"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '13px',
                              color: critical ? 'var(--danger)' : 'var(--text-1)',
                              fontWeight: critical ? 500 : 300,
                              cursor: 'pointer',
                              borderBottom: '1px dashed var(--border2)',
                              minWidth: '50px',
                            }}
                          >
                            {s.quantity}
                            <span style={{ color: 'var(--text-3)', fontSize: '11px' }}>/{s.threshold}</span>
                          </span>
                          <div style={{ width: '60px', height: '3px', background: 'var(--surface2)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: critical ? 'var(--danger)' : pct < 60 ? 'var(--accent)' : 'var(--success)',
                              borderRadius: '2px',
                              transition: 'width 0.6s ease',
                            }}/>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ ...TD, color: 'var(--text-3)', fontSize: '11px' }}>{s.unit}</td>
                  <td style={TD}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: critical ? 'var(--danger)' : 'var(--success)',
                      padding: '2px 7px',
                      background: critical ? 'rgba(224,90,78,0.1)' : 'rgba(78,168,114,0.1)',
                      borderRadius: '3px',
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
    </div>
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
