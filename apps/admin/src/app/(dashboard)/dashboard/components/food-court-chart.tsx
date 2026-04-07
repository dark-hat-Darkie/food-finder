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

interface FoodCourtChartProps {
  data: { name: string; revenue: number; orders: number; merchants: number }[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5">
      <p className="text-sm font-bold text-slate-800 mb-2">{item?.name}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">Revenue</span>
          <span className="font-bold text-slate-700">${Number(item?.revenue).toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">Orders</span>
          <span className="font-bold text-slate-700">{item?.orders}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-slate-500">Merchants</span>
          <span className="font-bold text-slate-700">{item?.merchants}</span>
        </div>
      </div>
    </div>
  )
}

export function FoodCourtChart({ data }: FoodCourtChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="fcGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" fill="url(#fcGradient)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
