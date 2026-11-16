'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search, Filter, ChevronLeft, ChevronRight,
  Eye, Wrench, Building2, AlertCircle
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { formatDate, timeAgo, ISSUE_CATEGORIES, ISSUE_URGENCIES, ISSUE_STATUSES } from '@/lib/utils'
import type { Issue } from '@/types/database'

const PAGE_SIZE = 10

export default function AdminIssuesPage() {
  const supabase = createClient()

  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [urgency, setUrgency] = useState('')
  const [category, setCategory] = useState('')

  const fetchIssues = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from('issues')
      .select('*, reporter:profiles!created_by(full_name, email), assigned_team:maintenance_teams(name)', { count: 'exact' })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,building.ilike.%${search}%`)
    }
    if (status) query = query.eq('status', status)
    if (urgency) query = query.eq('urgency', urgency)
    if (category) query = query.eq('category', category)

    const { data, count, error } = await query

    if (!error) {
      setIssues((data as unknown as Issue[]) ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [search, status, urgency, category, page, supabase])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Issue Triage &amp; Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review reports, adjust urgency, assign maintenance teams, and record progress updates.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by title, location, or building..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700"
          >
            <option value="">All Statuses</option>
            {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={urgency}
            onChange={(e) => { setUrgency(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700"
          >
            <option value="">All Urgencies</option>
            {ISSUE_URGENCIES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>

          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-xs bg-white text-gray-700"
          >
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(search || status || urgency || category) && (
            <button
              onClick={() => { setSearch(''); setStatus(''); setUrgency(''); setCategory(''); setPage(1) }}
              className="h-9 px-3 text-xs text-teal-700 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Building</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-6">
                    <TableSkeleton rows={5} />
                  </td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No issues match the specified criteria.
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-400 text-[11px]">
                      #{issue.id.slice(0, 6)}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">
                      <Link href={`/admin/issues/${issue.id}`} className="hover:text-teal-700 transition-colors">
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {issue.category}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {issue.building}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <UrgencyBadge urgency={issue.urgency} />
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {issue.reporter?.full_name || 'Anonymous'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                      {issue.assigned_team?.name || (
                        <span className="text-gray-300 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap text-[11px]">
                      {timeAgo(issue.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Link href={`/admin/issues/${issue.id}`}>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {issues.length} of {total} records
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs text-gray-600 px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
