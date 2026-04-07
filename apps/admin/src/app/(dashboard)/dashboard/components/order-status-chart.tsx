'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  ACCEPTED: '#3b82f6',
  PREPARING: '#f97316',
  READY: '#10b981',
  DELIVERED: '#6b7280',
  CANCELLED: '#ef4444',
}

interface StatusChartProps {
  data: { name: string; value: number }[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ background: COLORS[item.payload.name] || '#94a3b8' }} />
        <span className="text-sm font-bold text-slate-800">{item.name}</span>
      </div>
      <p className="text-xs text-slate-500 mt-1 ml-5">{item.value} orders</p>
    </div>
  )
}

export function OrderStatusChart({ data }: StatusChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="flex items-center gap-6">
      <div className="w-1/2 min-w-[180px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center -mt-2">
          <p className="text-2xl font-extrabold text-slate-800">{total}</p>
          <p className="text-xs text-slate-400 font-medium">Total Orders</p>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0
          return (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: COLORS[item.name] || '#94a3b8' }}
                />
                <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">{item.value}</span>
                <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
