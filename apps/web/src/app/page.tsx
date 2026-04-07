import { UtensilsCrossed, QrCode, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-primary-400/20 via-primary-300/10 to-transparent blur-3xl" />
      <div className="absolute top-20 -right-20 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -left-20 w-48 h-48 bg-primary-100/40 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="animate-fade-in-up">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/25 rotate-3">
              <UtensilsCrossed className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center shadow-md -rotate-12">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Food Finder
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-xs mb-10">
            Scan the QR code on your table to browse menus and order food directly from your seat.
          </p>
        </div>

        <div className="animate-fade-in-up stagger-4 w-full max-w-xs">
          <div className="card card-hover text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-7 h-7 text-primary-600" />
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-semibold text-gray-900">No app download needed!</span>
              <br />
              Just point your camera at the QR code on your table to get started.
            </p>
          </div>
        </div>

        <div className="animate-fade-in-up stagger-6 mt-12 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary-300" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary-200" />
        </div>
      </div>
    </div>
  )
}
