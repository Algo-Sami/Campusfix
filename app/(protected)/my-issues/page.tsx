'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Calendar, MapPin, ThumbsUp, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { timeAgo, ISSUE_CATEGORIES, ISSUE_STATUSES, getCategoryIcon } from '@/lib/utils'
import type { Issue } from '@/types/database'

const PAGE_SIZE = 8

export default function MyIssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const supabase = createClient()

  const loadMyIssues = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    let query = supabase
      .from('issues')
      .select('*, issue_upvotes(count)', { count: 'exact' })
      .eq('created_by', user.id)
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }
    if (categoryFilter) {
      query = query.eq('category', categoryFilter)
    }

    const { data, count } = await query
    setIssues((data as unknown as Issue[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [search, statusFilter, categoryFilter, page, supabase])

  useEffect(() => {
    loadMyIssues()
  }, [loadMyIssues])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage and track the campus issues you have submitted.
          </p>
        </div>
        <Link href="/issues/new">
          <Button>
            <Plus size={16} /> Report an Issue
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search my reports by keyword..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
          >
            <option value="">All Statuses</option>
            {ISSUE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
          >
            <option value="">All Categories</option>
            {ISSUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {(search || statusFilter || categoryFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setPage(1) }}
              className="h-9 px-3 text-sm text-gray-500 hover:text-gray-900"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <AlertCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No reports found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
            {search || statusFilter || categoryFilter
              ? 'No issues matched your filters. Try clearing your search.'
              : 'You have not submitted any campus maintenance issues yet.'}
          </p>
          <Link href="/issues/new">
            <Button size="sm">Report an Issue</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((issue) => {
            const upvoteCount = Array.isArray((issue as any).issue_upvotes)
              ? (issue as any).issue_upvotes.length
              : ((issue as any).issue_upvotes?.[0]?.count ?? 0)

            return (
              <div
                key={issue.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                      {getCategoryIcon(issue.category)} {issue.category}
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>

                  <Link href={`/issues/${issue.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-teal-700 transition-colors line-clamp-1 mb-2">
                      {issue.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {issue.building}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp size={12} /> {upvoteCount}
                    </span>
                  </div>
                  <Link href={`/issues/${issue.id}`}>
                    <span className="text-teal-700 font-medium hover:underline flex items-center gap-1">
                      View <ChevronRight size={14} />
                    </span>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-gray-600 px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
