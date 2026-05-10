import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const STATUS_LABELS = {
  pending: 'Bekliyor',
  shipped: 'Kargoda',
  delivered: 'Teslim',
  cancelled: 'İptal',
}

const STATUS_COLORS = {
  pending:   '#e8a94d',
  shipped:   '#6eb5ff',
  delivered: '#4ea872',
  cancelled: '#e05a4e',
}

export default function ChartsPanel({ orders, stock }) {
  // Bar chart: sipariş statusleri
  const orderData = Object.entries(
    orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})
  ).map(([status, count]) => ({
    name: STATUS_LABELS[status] || status,
    count,
    color: STATUS_COLORS[status] || 'var(--accent)',
  }))

  // Pie chart: stok doluluk oranı (normal vs kritik)
  const critical = stock.filter(s => s.quantity <= s.threshold).length
  const normal = stock.length - critical
  const stockPie = [
    { name: 'Normal', value: normal, color: '#4ea872' },
    { name: 'Kritik', value: critical, color: '#e05a4e' },
  ].filter(d => d.value > 0)

  // Stok bar: her ürün quantity vs threshold
  const stockBars = stock.map(s => ({
    name: s.product.length > 8 ? s.product.slice(0, 8) + '…' : s.product,
    miktar: s.quantity,
    esik: s.threshold,
    critical: s.quantity <= s.threshold,
  }))

  if (orders.length === 0 && stock.length === 0) return null

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
      gap: '16px',
    }}>
      {/* Sipariş Dağılımı - Bar */}
      {orderData.length > 0 && (
        <ChartCard label="Sipariş Dağılımı">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={orderData} barSize={28} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {orderData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Stok Durumu - Pie */}
      {stockPie.length > 0 && (
        <ChartCard label="Stok Durumu">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={stockPie}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {stockPie.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-2)' }}>
                    {value}
                  </span>
                )}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Stok Seviyeleri - Bar */}
      {stockBars.length > 0 && (
        <ChartCard label="Stok Seviyeleri">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stockBars} barSize={16} barGap={2} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 9, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontFamily: 'var(--font-mono)', fontSize: 10, fill: 'var(--text-3)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="miktar" radius={[3, 3, 0, 0]} name="Miktar">
                {stockBars.map((entry, i) => (
                  <Cell key={i} fill={entry.critical ? '#e05a4e' : '#e8a94d'} />
                ))}
              </Bar>
              <Bar dataKey="esik" radius={[3, 3, 0, 0]} fill="rgba(255,255,255,0.08)" name="Eşik" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ label, children }) {
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
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}/>
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
          color: 'var(--text-1)', letterSpacing: '-0.01em',
        }}>
          {label}
        </span>
      </div>
      <div style={{ padding: '16px 12px 12px' }}>
        {children}
      </div>
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border2)',
      borderRadius: '6px',
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: 'var(--text-1)',
    }}>
      {label && <div style={{ color: 'var(--text-3)', marginBottom: '4px' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.fill || p.color || 'var(--accent)' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}
