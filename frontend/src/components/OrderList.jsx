import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

const STATUS_STYLES = {
  pending:   'bg-yellow-100 text-yellow-800',
  shipped:   'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const STATUS_LABELS = {
  pending:   'Bekliyor',
  shipped:   'Kargoda',
  delivered: 'Teslim',
  cancelled: 'İptal',
}

export default function OrderList() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetch(`${API}/orders`)
      .then(r => r.json())
      .then(setOrders)
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Siparişler</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">ID</th>
              <th className="pb-2">Müşteri</th>
              <th className="pb-2">Ürün</th>
              <th className="pb-2">Durum</th>
              <th className="pb-2">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="py-2 font-mono">#{o.id}</td>
                <td className="py-2">{o.customer}</td>
                <td className="py-2">{o.product}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_LABELS[o.status] || o.status}
                  </span>
                </td>
                <td className="py-2 text-gray-500">{o.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-gray-400 text-sm mt-2">Sipariş yok.</p>}
      </div>
    </div>
  )
}
