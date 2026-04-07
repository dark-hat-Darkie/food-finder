import { getApi } from '@/lib/api'
import { Plus, MapPin, Building2 } from 'lucide-react'
import { FoodCourtsList } from './food-courts-list'

export default async function FoodCourtsPage() {
  const api = await getApi()
  const foodCourts = await api.getFoodCourts()

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="page-header mb-0">
          <h1>Food Courts</h1>
          <p>Manage food courts and their tables</p>
        </div>
        <CreateFoodCourtButton />
      </div>

      {foodCourts.length === 0 ? (
        <div className="card p-16 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No food courts yet</p>
          <p className="text-slate-300 text-sm mt-1">Create your first food court to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {foodCourts.map((court: any, i: number) => (
            <div
              key={court.id}
              className={`card card-hover p-6 animate-fade-in stagger-${i + 1}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <span
                  className={`badge ${court.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${court.isActive ? 'bg-emerald-400' : 'bg-slate-300'} mr-1.5`} />
                  {court.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="font-bold text-lg mt-4 text-slate-800">{court.name}</h3>
              {court.address && (
                <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {court.address}
                </p>
              )}

              <div className="flex gap-5 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-2xl font-extrabold text-slate-800">{court._count?.tables || 0}</p>
                  <p className="text-xs text-slate-400 font-medium">Tables</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-800">{court._count?.merchants || 0}</p>
                  <p className="text-xs text-slate-400 font-medium">Merchants</p>
                </div>
              </div>

              <a
                href={`/food-courts/${court.id}`}
                className="btn-secondary w-full text-center mt-4 flex items-center justify-center gap-1.5 text-xs py-2.5"
              >
                Manage Tables
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateFoodCourtButton() {
  return (
    <button className="btn-primary flex items-center gap-2">
      <Plus className="w-4 h-4" /> Add Food Court
    </button>
  )
}
