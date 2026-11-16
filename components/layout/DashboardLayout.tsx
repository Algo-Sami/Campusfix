'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, AlertCircle, Plus, FileText, Bell, User, LogOut,
  Wrench, Menu, X, ChevronDown, Search
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database'

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: Profile
}

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/issues', icon: AlertCircle, label: 'Campus Issues' },
  { href: '/issues/new', icon: Plus, label: 'Report Issue' },
  { href: '/my-issues', icon: FileText, label: 'My Issues' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : profile.email[0].toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-gray-100">
          <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
            <Wrench size={15} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">
            Campus<span className="text-teal-700">Fix</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn('sidebar-link', active && 'active')}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} />
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-56">
              <Search size={15} className="text-gray-400" />
              <span className="text-sm text-gray-400">Search issues...</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications bell */}
            <Link href="/notifications" className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <Bell size={20} />
            </Link>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-teal-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {profile.full_name || profile.email}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="text-xs font-medium text-gray-900 truncate">{profile.full_name}</div>
                    <div className="text-xs text-gray-400 truncate">{profile.email}</div>
                    <div className="mt-1">
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full capitalize">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
