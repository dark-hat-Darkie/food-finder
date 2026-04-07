import { getApi } from '@/lib/api'
import { MerchantsList } from './merchants-list'

export default async function MerchantsPage() {
  const api = await getApi()
  const data = await api.getMerchants()

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Merchants</h1>
        <p>Manage store applications and active merchants</p>
      </div>

      <MerchantsList initialData={data} />
    </div>
  )
}
