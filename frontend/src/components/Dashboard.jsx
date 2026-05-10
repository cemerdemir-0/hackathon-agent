import { useEffect, useState } from 'react'
import OrderList from './OrderList'
import StockTable from './StockTable'
import ChatInterface from './ChatInterface'
import StatsBar from './StatsBar'
import ChartsPanel from './ChartsPanel'

const API = 'http://localhost:8000'

export default function Dashboard() {
  const [notifications, setNotifications] = useState([])
  const [orders, setOrders] = useState([])
  const [stock, setStock] = useState([])
  const [reporting, setReporting] = useState(false)

  const handleTriggerReport = async () => {
    setReporting(true)
    try {
      await fetch(`${API}/trigger-report`, { method: 'POST' })
    } catch {}
    setTimeout(() => setReporting(false), 8000)
  }

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.slice(-3).map((n, i) => (
            <div key={i} className="fade-up" style={{
              animationDelay: `${i * 0.06}s`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 16px',
              background: n.type === 'stock_alert'
                ? 'rgba(224,90,78,0.08)'
                : 'rgba(232,169,77,0.08)',
              border: `1px solid ${n.type === 'stock_alert' ? 'rgba(224,90,78,0.2)' : 'rgba(232,169,77,0.2)'}`,
              borderRadius: '8px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.08em',
                color: n.type === 'stock_alert' ? 'var(--danger)' : 'var(--accent)',
                flexShrink: 0,
                paddingTop: '1px',
                textTransform: 'uppercase',
              }}>
                {n.type === 'stock_alert' ? '⚠ Stok' : '◆ Rapor'}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--text-2)',
                lineHeight: 1.6,
              }}>
                {n.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <StatsBar
        orders={orders}
        stock={stock}
        onTriggerReport={handleTriggerReport}
        reporting={reporting}
      />

      {/* Charts */}
      <ChartsPanel orders={orders} stock={stock} />

      {/* Main grid — responsive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
        gap: '16px',
      }}>
        <Panel label="Siparişler">
          <OrderList onDataLoad={setOrders} />
        </Panel>
        <Panel label="Stok Durumu">
          <StockTable onDataLoad={setStock} />
        </Panel>
      </div>

      <Panel label="Yapay Zeka Asistan">
        <ChatInterface />
      </Panel>
    </div>
  )
}

function Panel({ label, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: 'var(--accent)',
          flexShrink: 0,
        }}/>
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-1)',
          letterSpacing: '-0.01em',
        }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}
