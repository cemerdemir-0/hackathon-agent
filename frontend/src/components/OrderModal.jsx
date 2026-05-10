import { useEffect } from 'react'

const STATUS = {
  pending:   { label: 'Bekliyor',  color: '#e8a94d' },
  shipped:   { label: 'Kargoda',   color: '#6eb5ff' },
  delivered: { label: 'Teslim',    color: '#4ea872' },
  cancelled: { label: 'İptal',     color: '#e05a4e' },
}

export default function OrderModal({ order, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!order) return null
  const s = STATUS[order.status] || { label: order.status, color: 'var(--text-2)' }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeUp 0.2s ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          animation: 'fadeUp 0.25s ease forwards',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '16px',
              color: 'var(--text-1)',
              letterSpacing: '-0.01em',
            }}>
              Sipariş #{order.id}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-3)',
              marginTop: '2px',
            }}>
              {order.created_at}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            width: '32px', height: '32px',
            color: 'var(--text-2)',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Row label="Müşteri"  value={order.customer} highlight />
          <Row label="Ürün"     value={order.product} />
          <Row label="Durum"    value={
            <span style={{
              color: s.color,
              background: s.color + '18',
              padding: '3px 10px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.05em',
            }}>
              {s.label}
            </span>
          }/>
          {order.cargo_code && (
            <Row label="Kargo Kodu" value={
              <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                {order.cargo_code}
              </span>
            }/>
          )}
          {!order.cargo_code && (
            <Row label="Kargo" value={
              <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Henüz atanmadı
              </span>
            }/>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} style={{
            padding: '8px 20px',
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-2)',
            cursor: 'pointer',
            letterSpacing: '0.03em',
          }}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-3)',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: typeof value === 'string' ? 'var(--font-sans)' : undefined,
        fontSize: '14px',
        fontWeight: highlight ? 500 : 400,
        color: highlight ? 'var(--text-1)' : 'var(--text-2)',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}
