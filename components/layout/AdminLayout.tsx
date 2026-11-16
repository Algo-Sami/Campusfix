'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ShieldAlert, LayoutDashboard, ListFilter, BarChart3,
  Users, Settings, LogOut, Menu, X, Bell, ChevronDown
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface AdminLayoutProps {
  children: React.ReactNode
  profile: Profile
}

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/issues', icon: ListFilter, label: 'Issue Management' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/users', icon: Users, label: 'Users & Roles' },
  { href: '/admin/settings', icon: Settings, label: 'Campus Settings' },
]

export default function AdminLayoutComponent({ children, profile }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AD'

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-800">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <ShieldAlert size={16} className="text-slate-950 font-bold" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white">CampusFix</div>
            <div className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">Administration</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Switch to Student Portal / Logout */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>&larr; Switch to Student View</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={16} />
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Toggle navigation"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-sm font-semibold text-slate-800 hidden sm:inline-block">
              Operations Control Center
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-slate-900 text-teal-400 rounded-full flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900 truncate max-w-[130px]">
                    {profile.full_name}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold uppercase">Administrator</div>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-900 truncate">{profile.full_name}</p>
                    <p className="text-[10px] text-gray-500 truncate">{profile.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Student Portal
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
