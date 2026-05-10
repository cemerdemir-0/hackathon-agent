import { useEffect, useState } from 'react'
import OrderList from './OrderList'
import StockTable from './StockTable'
import ChatInterface from './ChatInterface'

const API = 'http://localhost:8000'

export default function Dashboard() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/notifications`)
        const data = await res.json()
        setNotifications(data.notifications || [])
      } catch {}
    }
    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.25em',
            color: 'var(--gray-400)',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Sistem Bildirimleri — {notifications.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {notifications.slice(-3).map((n, i) => (
              <div
                key={i}
                className="animate-slide-in"
                style={{
                  padding: '16px 20px',
                  background: n.type === 'stock_alert' ? '#c0392b' : 'var(--black)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0,
                }}
              >
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '9px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  flexShrink: 0,
                  paddingTop: '2px',
                }}>
                  {n.type === 'stock_alert' ? 'Stok' : 'Rapor'}
                </span>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '11px',
                  lineHeight: 1.6,
                  color: 'rgba(255,255,255,0.9)',
                }}>
                  {n.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section label */}
      <SectionDivider label="Operasyon Özeti" />

      {/* Tables row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'var(--black)',
        border: '1px solid var(--black)',
        marginBottom: '1px',
      }}>
        <div style={{ background: 'var(--white)' }}>
          <OrderList />
        </div>
        <div style={{ background: 'var(--white)' }}>
          <StockTable />
        </div>
      </div>

      {/* Chat */}
      <div style={{ border: '1px solid var(--black)', borderTop: 'none' }}>
        <ChatInterface />
      </div>
    </div>
  )
}

function SectionDivider({ label }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '24px',
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '0.25em',
        color: 'var(--gray-400)',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
    </div>
  )
}
