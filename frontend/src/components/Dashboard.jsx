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
    <div className="space-y-4">
      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.slice(-3).map((n, i) => (
            <div
              key={i}
              className={`p-3 rounded text-sm font-medium ${
                n.type === 'stock_alert'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {n.type === 'stock_alert' ? '⚠️ Stok Uyarısı:' : '📋 Sabah Raporu:'} {n.message}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrderList />
        <StockTable />
      </div>

      <ChatInterface />
    </div>
  )
}
