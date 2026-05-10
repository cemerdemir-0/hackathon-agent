import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

export default function StockTable() {
  const [stock, setStock] = useState([])

  useEffect(() => {
    fetch(`${API}/stock`)
      .then(r => r.json())
      .then(setStock)
      .catch(() => {})
  }, [])

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Stok Durumu</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2">Ürün</th>
              <th className="pb-2">Miktar</th>
              <th className="pb-2">Birim</th>
              <th className="pb-2">Eşik</th>
              <th className="pb-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {stock.map(s => {
              const critical = s.quantity <= s.threshold
              return (
                <tr key={s.product} className={`border-b last:border-0 ${critical ? 'bg-red-50' : ''}`}>
                  <td className="py-2 font-medium">{s.product}</td>
                  <td className={`py-2 font-bold ${critical ? 'text-red-600' : 'text-green-600'}`}>
                    {s.quantity}
                  </td>
                  <td className="py-2 text-gray-500">{s.unit}</td>
                  <td className="py-2 text-gray-500">{s.threshold}</td>
                  <td className="py-2">
                    {critical
                      ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Kritik</span>
                      : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Normal</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {stock.length === 0 && <p className="text-gray-400 text-sm mt-2">Stok verisi yok.</p>}
      </div>
    </div>
  )
}
