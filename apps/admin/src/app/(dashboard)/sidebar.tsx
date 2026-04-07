'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Building2,
  Store,
  ShoppingCart,
  CreditCard,
  LogOut,
  UtensilsCrossed,
  X,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/food-courts', label: 'Food Courts', icon: Building2 },
  { href: '/merchants', label: 'Merchants', icon: Store },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/payments', label: 'Payments', icon: CreditCard },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50"
      >
        <UtensilsCrossed className="w-5 h-5 text-brand-500" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-sidebar z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">Food Finder</span>
              <p className="text-[11px] text-sidebar-text font-medium uppercase tracking-wider">Admin</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-sidebar-text hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-2">
          <div className="h-px bg-sidebar-border" />
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-sidebar-active text-sidebar-text-active'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
                )}
                <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-brand-400' : 'text-sidebar-text group-hover:text-slate-300'}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400/60" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 mt-auto">
          <div className="h-px bg-sidebar-border mb-3" />
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-sidebar-text hover:bg-sidebar-hover hover:text-red-300 w-full transition-all duration-200 group"
          >
            <LogOut className="w-[18px] h-[18px] group-hover:text-red-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
