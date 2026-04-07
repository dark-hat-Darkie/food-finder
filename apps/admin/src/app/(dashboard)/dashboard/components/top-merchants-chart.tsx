'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface TopMerchantsChartProps {
  data: { name: string; revenue: number; orders: number }[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-xl p-3.5">
      <p className="text-sm font-bold text-slate-800 mb-1.5">{item?.name}</p>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-slate-500">Revenue:</span>
        <span className="font-bold text-slate-700">${Number(item?.revenue).toFixed(2)}</span>
      </div>
      <div className="flex items-center gap-3 text-xs mt-0.5">
        <span className="text-slate-500">Orders:</span>
        <span className="font-bold text-slate-700">{item?.orders}</span>
      </div>
    </div>
  )
}

const BAR_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']

export function TopMerchantsChart({ data }: TopMerchantsChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700 truncate mr-4">{item.name}</span>
            <span className="text-sm font-bold text-slate-800 flex-shrink-0">
              ${Number(item.revenue).toFixed(2)}
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.revenue / maxRevenue) * 100}%`,
                background: `linear-gradient(90deg, ${BAR_COLORS[i] || BAR_COLORS[4]}, ${BAR_COLORS[Math.max(0, i - 1)] || BAR_COLORS[0]})`,
              }}
            />
          </div>
        </div>
      ))}
      {data.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-6">No merchant data available</p>
      )}
    </div>
  )
}
