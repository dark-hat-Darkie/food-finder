import { getApi } from '@/lib/api'
import { OrdersList } from './orders-list'

export default async function OrdersPage() {
  const api = await getApi()
  const data = await api.getOrders()

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Orders</h1>
        <p>View and manage all orders</p>
      </div>

      <OrdersList initialData={data} />
    </div>
  )
}
