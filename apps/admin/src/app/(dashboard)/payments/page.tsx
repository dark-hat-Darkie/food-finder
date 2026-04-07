import { getApi } from '@/lib/api'
import { PaymentsList } from './payments-list'

export default async function PaymentsPage() {
  const api = await getApi()
  const data = await api.getPayments()

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Payments</h1>
        <p>Manage merchant payouts</p>
      </div>

      <PaymentsList initialData={data} />
    </div>
  )
}
