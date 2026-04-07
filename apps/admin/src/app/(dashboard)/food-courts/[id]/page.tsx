import { getApi } from '@/lib/api'
import { ArrowLeft, QrCode, Table2 } from 'lucide-react'
import Link from 'next/link'
import { TableActions } from './table-actions'
import { TableQrCode } from './table-qr-code'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FoodCourtTablesPage({ params }: Props) {
  const { id } = await params
  const api = await getApi()
  const [foodCourt, tables] = await Promise.all([api.getFoodCourt(id), api.getTables(id)])

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/food-courts" className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{foodCourt.name}</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage tables and QR codes</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Table2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Tables</h2>
              <p className="text-xs text-slate-400">{tables.length} tables configured</p>
            </div>
          </div>
          <TableActions foodCourtId={id} tableCount={tables.length} />
        </div>

        {tables.length === 0 ? (
          <div className="p-16 text-center">
            <QrCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No tables yet</p>
            <p className="text-slate-300 text-sm mt-1">Add tables to generate QR codes</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {tables.map((table: any) => (
              <div key={table.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-5">
                  <TableQrCode tableId={table.id} tableNumber={table.number} foodCourtId={id} qrCodeUrl={table.qrCodeUrl} />
                  <div>
                    <p className="font-semibold text-slate-800">Table #{table.number}</p>
                    {table.qrCodeUrl && (
                      <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{table.qrCodeUrl}</p>
                    )}
                  </div>
                </div>
                <span
                  className={`badge ${table.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${table.isActive ? 'bg-emerald-400' : 'bg-slate-300'} mr-1.5`} />
                  {table.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
