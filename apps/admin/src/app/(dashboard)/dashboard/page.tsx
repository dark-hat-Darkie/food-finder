import { getApi } from '@/lib/api'
import { DollarSign, ShoppingCart, Store, Building2, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react'
import { RevenueTrendChart } from './components/revenue-trend-chart'
import { OrderStatusChart } from './components/order-status-chart'
import { TopMerchantsChart } from './components/top-merchants-chart'
import { HourlyOrdersChart } from './components/hourly-orders-chart'
import { FoodCourtChart } from './components/food-court-chart'
import { RecentOrdersTable } from './components/recent-orders-table'

export default async function DashboardPage() {
  const api = await getApi()

  let stats: any = {}
  let revenueTrend: any[] = []
  let statusDistribution: any[] = []
  let topMerchants: any[] = []
  let recentOrders: any[] = []
  let hourlyOrders: any[] = []
  let foodCourtPerformance: any[] = []

  try {
    ;[
      stats,
      revenueTrend,
      statusDistribution,
      topMerchants,
      recentOrders,
      hourlyOrders,
      foodCourtPerformance,
    ] = await Promise.all([
      api.getDashboardStats(),
      api.getRevenueTrend(7),
      api.getOrderStatusDistribution(),
      api.getTopMerchants(5),
      api.getRecentOrders(8),
      api.getHourlyOrders(),
      api.getFoodCourtPerformance(),
    ])
  } catch {
    stats = {
      totalRevenue: 0,
      totalOrders: 0,
      totalMerchants: 0,
      totalFoodCourts: 0,
      todayOrders: 0,
      todayRevenue: 0,
      pendingMerchantPayments: 0,
    }
  }

  const cards = [
    { label: 'Total Revenue', value: `$${Number(stats.totalRevenue || 0).toFixed(2)}`, icon: DollarSign, gradient: 'stat-card-gradient-green', iconColor: 'bg-emerald-500 text-white', subtext: 'All-time earnings' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingCart, gradient: 'stat-card-gradient-blue', iconColor: 'bg-blue-500 text-white', subtext: 'Lifetime orders' },
    { label: 'Active Merchants', value: stats.totalMerchants || 0, icon: Store, gradient: 'stat-card-gradient-purple', iconColor: 'bg-violet-500 text-white', subtext: 'Registered stores' },
    { label: 'Food Courts', value: stats.totalFoodCourts || 0, icon: Building2, gradient: 'stat-card-gradient-orange', iconColor: 'bg-brand-500 text-white', subtext: 'Active locations' },
    { label: 'Today Orders', value: stats.todayOrders || 0, icon: TrendingUp, gradient: 'stat-card-gradient-yellow', iconColor: 'bg-amber-500 text-white', subtext: 'Orders today' },
    { label: 'Today Revenue', value: `$${Number(stats.todayRevenue || 0).toFixed(2)}`, icon: DollarSign, gradient: 'stat-card-gradient-emerald', iconColor: 'bg-emerald-600 text-white', subtext: "Today's earnings" },
    { label: 'Pending Payouts', value: stats.pendingMerchantPayments || 0, icon: AlertCircle, gradient: 'stat-card-gradient-red', iconColor: 'bg-rose-500 text-white', subtext: 'Awaiting payment' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your food court platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={`${card.gradient} p-5 rounded-2xl border border-white/60 shadow-sm animate-fade-in stagger-${i + 1} card-hover`}
          >
            <div className="flex items-start justify-between">
              <div className={`${card.iconColor} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold tracking-tight text-slate-800">{card.value}</p>
              <p className="text-sm font-semibold text-slate-600 mt-0.5">{card.label}</p>
              <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Revenue Trend</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 7 days revenue &amp; orders</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-orange-500 rounded" />
                Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-blue-500 rounded" style={{ borderTop: '2px dashed #3b82f6' }} />
                Orders
              </span>
            </div>
          </div>
          <RevenueTrendChart data={revenueTrend} />
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Order Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution by status</p>
          </div>
          <OrderStatusChart data={statusDistribution} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Top Merchants</h2>
            <p className="text-xs text-slate-400 mt-0.5">By revenue</p>
          </div>
          <TopMerchantsChart data={topMerchants} />
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Today&apos;s Orders by Hour</h2>
              <p className="text-xs text-slate-400 mt-0.5">Order volume throughout the day</p>
            </div>
          </div>
          <HourlyOrdersChart data={hourlyOrders} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest activity</p>
          </div>
          <RecentOrdersTable orders={recentOrders} />
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">Food Court Performance</h2>
            <p className="text-xs text-slate-400 mt-0.5">Revenue by location</p>
          </div>
          <FoodCourtChart data={foodCourtPerformance} />
        </div>
      </div>
    </div>
  )
}
