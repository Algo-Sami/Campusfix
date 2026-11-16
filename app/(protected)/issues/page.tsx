'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, ThumbsUp, MapPin, Calendar, ChevronRight, ChevronLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { getCategoryIcon, timeAgo, ISSUE_CATEGORIES, ISSUE_URGENCIES, ISSUE_STATUSES } from '@/lib/utils'
import type { Issue } from '@/types/database'

const PAGE_SIZE = 10

export default function IssuesFeedPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '', urgency: '', status: '', building: '' })
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set())
  const [upvoteLoading, setUpvoteLoading] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const supabase = createClient()

  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUserId(user?.id ?? null)
    if (user) {
      const { data } = await supabase
        .from('issue_upvotes')
        .select('issue_id')
        .eq('user_id', user.id)
      setUpvotedIds(new Set(data?.map((u) => u.issue_id) ?? []))
    }
  }, [])

  const fetchIssues = useCallback(async () => {
    setLoading(true)
    setError('')

    let query = supabase
      .from('issues')
      .select('*, issue_upvotes(count)', { count: 'exact' })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.urgency) query = query.eq('urgency', filters.urgency)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.building) query = query.ilike('building', `%${filters.building}%`)

    switch (sort) {
      case 'oldest': query = query.order('created_at', { ascending: true }); break
      case 'recently_updated': query = query.order('updated_at', { ascending: false }); break
      default: query = query.order('created_at', { ascending: false })
    }

    const { data, count, error: err } = await query

    if (err) {
      setError('Failed to load issues. Please try again.')
    } else {
      setIssues((data as unknown as Issue[]) ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [search, filters, sort, page])

  useEffect(() => { fetchUser() }, [fetchUser])
  useEffect(() => { fetchIssues() }, [fetchIssues])

  async function handleUpvote(issueId: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!userId || upvoteLoading) return
    setUpvoteLoading(issueId)

    const hasVoted = upvotedIds.has(issueId)
    if (hasVoted) {
      await supabase.from('issue_upvotes').delete().match({ issue_id: issueId, user_id: userId })
      setUpvotedIds((prev) => { const s = new Set(prev); s.delete(issueId); return s })
    } else {
      await supabase.from('issue_upvotes').insert({ issue_id: issueId, user_id: userId })
      setUpvotedIds((prev) => new Set(prev).add(issueId))
    }
    setUpvoteLoading(null)
    fetchIssues()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Issues</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Discover reported problems across campus and support issues affecting your community.
          </p>
        </div>
        <Link href="/issues/new">
          <Button>
            <Plus size={16} />
            Report an Issue
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search issues by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'category', options: ISSUE_CATEGORIES, placeholder: 'All Categories' },
            { key: 'urgency', options: ISSUE_URGENCIES, placeholder: 'All Urgencies' },
            { key: 'status', options: ISSUE_STATUSES, placeholder: 'All Statuses' },
          ].map(({ key, options, placeholder }) => (
            <select
              key={key}
              value={filters[key as keyof typeof filters]}
              onChange={(e) => { setFilters((p) => ({ ...p, [key]: e.target.value })); setPage(1) }}
              className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
            >
              <option value="">{placeholder}</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="recently_updated">Recently Updated</option>
          </select>
          <button
            onClick={() => { setFilters({ category: '', urgency: '', status: '', building: '' }); setSearch(''); setPage(1) }}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="text-sm text-gray-500">
          Showing {issues.length} of {total} issue{total !== 1 ? 's' : ''}
        </div>
      )}

      {/* Issues Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : issues.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((issue) => {
            const upvoteCount = Array.isArray((issue as any).issue_upvotes)
              ? (issue as any).issue_upvotes.length
              : ((issue as any).issue_upvotes?.[0]?.count ?? 0)
            const hasVoted = upvotedIds.has(issue.id)

            return (
              <div key={issue.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-teal-200 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <Link href={`/issues/${issue.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-snug">
                      {getCategoryIcon(issue.category)} {issue.title}
                    </h3>
                  </Link>
                  <StatusBadge status={issue.status} />
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <UrgencyBadge urgency={issue.urgency} />
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin size={11} />
                    {issue.building} · {issue.room_location}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={11} />
                    {timeAgo(issue.created_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={(e) => handleUpvote(issue.id, e)}
                    disabled={!userId || upvoteLoading === issue.id}
                    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                      hasVoted
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                    aria-label={hasVoted ? 'Remove upvote' : 'Upvote this issue'}
                  >
                    <ThumbsUp size={14} className={hasVoted ? 'fill-teal-600' : ''} />
                    <span className="font-medium">{upvoteCount}</span>
                  </button>
                  <Link href={`/issues/${issue.id}`}>
                    <Button size="sm" variant="ghost" className="text-teal-700 hover:bg-teal-50">
                      View Details
                      <ChevronRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-sm text-gray-600 px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
