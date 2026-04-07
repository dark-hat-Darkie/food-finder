'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface HourlyOrdersChartProps {
  data: { hour: string; orders: number; revenue: number }[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5">
      <p className="text-xs font-bold text-slate-800 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              {entry.name === 'orders' ? 'Orders' : 'Revenue'}
            </span>
            <span className="font-bold text-slate-700">
              {entry.name === 'revenue' ? `$${Number(entry.value).toFixed(2)}` : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HourlyOrdersChart({ data }: HourlyOrdersChartProps) {
  const filteredData = data.filter((d) => d.orders > 0 || d.revenue > 0)

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="hour"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          interval="preserveStartEnd"
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="orders" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="orders" />
      </BarChart>
    </ResponsiveContainer>
  )
}
