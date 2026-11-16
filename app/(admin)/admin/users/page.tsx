'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Shield, User, Mail, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Profile, UserRole } from '@/types/database'

export default function AdminUsersPage() {
  const supabase = createClient()

  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    setCurrentAdminId(user?.id ?? null)

    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (roleFilter) {
      query = query.eq('role', roleFilter)
    }

    const { data } = await query
    setUsers((data as Profile[]) ?? [])
    setLoading(false)
  }, [search, roleFilter, supabase])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleUpdateRole(targetUserId: string, newRole: UserRole) {
    if (targetUserId === currentAdminId && newRole !== 'admin') {
      alert('You cannot demote yourself from the Administrator role.')
      return
    }

    setUpdatingId(targetUserId)

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (error) {
      alert('Failed to update user role: ' + error.message)
    } else {
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u))
    }

    setUpdatingId(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User &amp; Role Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review authenticated campus accounts, verify identities, and manage role authorizations.
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by full name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700"
        >
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="admin">Admin</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Assign Role</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Loading campus accounts...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = u.id === currentAdminId
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 bg-slate-800 text-teal-400 rounded-full flex items-center justify-center font-bold text-xs">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-medium text-gray-900">{u.full_name || 'No Name'}</span>
                          {isSelf && (
                            <span className="bg-teal-100 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-600">{u.email}</td>

                      <td className="py-3 px-4 text-gray-600">{u.department || '—'}</td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'faculty' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-400">{formatDate(u.created_at)}</td>

                      <td className="py-3 px-4 text-right">
                        <select
                          disabled={updatingId === u.id || isSelf}
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                          className="h-8 px-2 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="faculty">Faculty</option>
                          <option value="admin">Admin</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
