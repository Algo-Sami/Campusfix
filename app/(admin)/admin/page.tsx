import Link from 'next/link'
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, ArrowUpRight,
  TrendingUp, Building2, Flame, Wrench, ShieldAlert
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDateTime, timeAgo, getCategoryIcon } from '@/lib/utils'
import type { Issue } from '@/types/database'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Real KPI counts
  const [totalRes, openRes, inProgressRes, resolvedRes, rejectedRes] = await Promise.all([
    supabase.from('issues').select('id', { count: 'exact', head: true }),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'In Progress'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'Resolved'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'Rejected'),
  ])

  // Priority Queue: Critical & High issues that are unresolved
  const { data: priorityIssues } = await supabase
    .from('issues')
    .select('*, issue_upvotes(count)')
    .in('status', ['Open', 'In Progress'])
    .in('urgency', ['Critical', 'High'])
    .order('created_at', { ascending: true })
    .limit(6)

  // Recent reports awaiting review
  const { data: newReports } = await supabase
    .from('issues')
    .select('*, reporter:profiles!created_by(full_name)')
    .eq('status', 'Open')
    .order('created_at', { ascending: false })
    .limit(5)

  // Aggregate Category distribution
  const { data: allIssuesForCategory } = await supabase
    .from('issues')
    .select('category, urgency, building, status')

  const categoryCounts: Record<string, number> = {}
  const urgencyCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  const statusCounts: Record<string, number> = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0, Rejected: 0 }

  if (allIssuesForCategory) {
    allIssuesForCategory.forEach((row) => {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1
      if (row.urgency in urgencyCounts) urgencyCounts[row.urgency]++
      if (row.status in statusCounts) statusCounts[row.status]++
    })
  }

  const kpis = [
    { label: 'Total Reports', value: totalRes.count ?? 0, icon: Wrench, color: 'text-slate-900 bg-slate-100' },
    { label: 'Awaiting Triage (Open)', value: openRes.count ?? 0, icon: AlertTriangle, color: 'text-blue-700 bg-blue-50' },
    { label: 'In Progress', value: inProgressRes.count ?? 0, icon: Clock, color: 'text-amber-700 bg-amber-50' },
    { label: 'Resolved', value: resolvedRes.count ?? 0, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Rejected', value: rejectedRes.count ?? 0, icon: XCircle, color: 'text-red-700 bg-red-50' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Campus Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor campus issues, prioritize maintenance, and track resolution performance.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/issues">
            <Button size="sm">
              <Wrench size={16} /> Manage All Issues
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" size="sm">
              <TrendingUp size={16} /> Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{kpi.label}</span>
                  <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Priority Queue Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <Flame size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">High Priority Triage Queue</h2>
              <p className="text-xs text-gray-500">Unresolved issues marked as Critical or High urgency</p>
            </div>
          </div>
          <Link href="/admin/issues?urgency=Critical" className="text-xs font-semibold text-teal-700 hover:underline">
            View priority queue &rarr;
          </Link>
        </div>

        {priorityIssues && priorityIssues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priorityIssues.map((issue) => (
              <div
                key={issue.id}
                className="border border-red-100 bg-red-50/20 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <UrgencyBadge urgency={issue.urgency} />
                    <StatusBadge status={issue.status} />
                  </div>
                  <Link href={`/admin/issues/${issue.id}`}>
                    <h3 className="font-semibold text-sm text-gray-900 hover:text-teal-700 line-clamp-1">
                      {issue.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {issue.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{issue.building}</span>
                  <Link
                    href={`/admin/issues/${issue.id}`}
                    className="font-medium text-teal-700 hover:underline flex items-center gap-1"
                  >
                    Triage <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-gray-400">
            No active critical or high urgency issues pending!
          </div>
        )}
      </div>

      {/* Grid: Recent Open Reports & Categorical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Open Reports */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-semibold text-gray-900 text-base">New Reports Requiring Triage</h2>
            <Link href="/admin/issues?status=Open" className="text-xs text-teal-700 hover:underline">
              View all open
            </Link>
          </div>

          {newReports && newReports.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {newReports.map((report) => (
                <div key={report.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/admin/issues/${report.id}`}>
                      <h4 className="font-medium text-sm text-gray-900 hover:text-teal-700 truncate">
                        {report.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{getCategoryIcon(report.category)} {report.category}</span>
                      <span>&bull;</span>
                      <span>{report.building}</span>
                      <span>&bull;</span>
                      <span>{timeAgo(report.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <UrgencyBadge urgency={report.urgency} />
                    <Link href={`/admin/issues/${report.id}`}>
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No new unassigned reports at this time.
            </div>
          )}
        </div>

        {/* Category Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-3">
            Category Breakdown
          </h2>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const total = totalRes.count || 1
              const pct = Math.round((count / total) * 100)
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>{getCategoryIcon(cat)} {cat}</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}

            {Object.keys(categoryCounts).length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No issue reports logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
