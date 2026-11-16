import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { BarChart3, Clock, CheckCircle2, AlertTriangle, Building2, TrendingUp, ThumbsUp } from 'lucide-react'
import { getCategoryIcon } from '@/lib/utils'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Fetch all issues for aggregates
  const { data: issues } = await supabase
    .from('issues')
    .select('*, issue_upvotes(count)')

  const allIssues = issues || []
  const total = allIssues.length

  const openCount = allIssues.filter(i => i.status === 'Open').length
  const inProgressCount = allIssues.filter(i => i.status === 'In Progress').length
  const resolvedCount = allIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length
  const rejectedCount = allIssues.filter(i => i.status === 'Rejected').length

  // Resolution Rate = Resolved / Total (excluding zero denominator)
  const resolutionRate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0

  // Calculate Average & Median Resolution Time in Hours
  // Definition: time interval between created_at and resolved_at for completed issues.
  const resolutionTimesHours: number[] = []

  allIssues.forEach((issue) => {
    if ((issue.status === 'Resolved' || issue.status === 'Closed') && issue.resolved_at && issue.created_at) {
      const created = new Date(issue.created_at).getTime()
      const resolved = new Date(issue.resolved_at).getTime()
      const diffHours = (resolved - created) / (1000 * 60 * 60)
      if (diffHours >= 0) {
        resolutionTimesHours.push(diffHours)
      }
    }
  })

  resolutionTimesHours.sort((a, b) => a - b)

  const avgResolutionHours = resolutionTimesHours.length > 0
    ? Math.round(resolutionTimesHours.reduce((acc, cur) => acc + cur, 0) / resolutionTimesHours.length)
    : null

  const medianResolutionHours = resolutionTimesHours.length > 0
    ? Math.round(resolutionTimesHours[Math.floor(resolutionTimesHours.length / 2)])
    : null

  // Aggregations: Categories, Urgency, Buildings
  const categoryCounts: Record<string, number> = {}
  const urgencyCounts: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 }
  const buildingCounts: Record<string, number> = {}

  allIssues.forEach(issue => {
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1
    if (issue.urgency in urgencyCounts) urgencyCounts[issue.urgency]++
    buildingCounts[issue.building] = (buildingCounts[issue.building] || 0) + 1
  })

  // Most Upvoted Issues
  const sortedByUpvotes = [...allIssues]
    .sort((a, b) => {
      const aCount = Array.isArray((a as any).issue_upvotes) ? (a as any).issue_upvotes.length : ((a as any).issue_upvotes?.[0]?.count ?? 0)
      const bCount = Array.isArray((b as any).issue_upvotes) ? (b as any).issue_upvotes.length : ((b as any).issue_upvotes?.[0]?.count ?? 0)
      return bCount - aCount
    })
    .slice(0, 5)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Operational Analytics &amp; KPIs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Performance metrics, resolution velocity, and campus maintenance distribution.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-gray-500 font-medium">Total Issues</span>
            <div className="text-3xl font-bold text-gray-900 mt-1">{total}</div>
            <span className="text-[11px] text-gray-400">Total campus reports</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-gray-500 font-medium">Resolution Rate</span>
            <div className="text-3xl font-bold text-emerald-600 mt-1">{resolutionRate}%</div>
            <span className="text-[11px] text-gray-400">{resolvedCount} resolved of {total}</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-gray-500 font-medium">Average Resolution Time</span>
            <div className="text-3xl font-bold text-teal-700 mt-1">
              {avgResolutionHours !== null ? `${avgResolutionHours} hrs` : 'N/A'}
            </div>
            <span className="text-[11px] text-gray-400">Created to Resolved timestamp</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs text-gray-500 font-medium">Median Resolution Time</span>
            <div className="text-3xl font-bold text-sky-700 mt-1">
              {medianResolutionHours !== null ? `${medianResolutionHours} hrs` : 'N/A'}
            </div>
            <span className="text-[11px] text-gray-400">50th percentile of resolved</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts / Distribution Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Status Breakdown
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Open', count: openCount, color: 'bg-blue-500' },
              { label: 'In Progress', count: inProgressCount, color: 'bg-amber-500' },
              { label: 'Resolved / Closed', count: resolvedCount, color: 'bg-emerald-500' },
              { label: 'Rejected', count: rejectedCount, color: 'bg-red-500' },
            ].map(item => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Urgency Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Urgency Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(urgencyCounts).map(([urg, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              let barColor = 'bg-gray-400'
              if (urg === 'Critical') barColor = 'bg-red-600'
              if (urg === 'High') barColor = 'bg-orange-500'
              if (urg === 'Medium') barColor = 'bg-yellow-500'
              if (urg === 'Low') barColor = 'bg-green-500'

              return (
                <div key={urg} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{urg}</span>
                    <span className="font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-2">
            Issues by Category
          </h2>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-700">
                    <span>{getCategoryIcon(cat)} {cat}</span>
                    <span className="font-semibold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Buildings & Most Upvoted Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buildings Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
            <Building2 size={18} className="text-teal-700" />
            Issues by Campus Building
          </h2>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
            {Object.entries(buildingCounts).sort((a, b) => b[1] - a[1]).map(([bldg, count]) => (
              <div key={bldg} className="flex items-center justify-between text-xs py-2 border-b border-gray-50">
                <span className="text-gray-800 font-medium">{bldg}</span>
                <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold">
                  {count} issue{count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
            {Object.keys(buildingCounts).length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">No reports yet.</p>
            )}
          </div>
        </div>

        {/* Most Upvoted Issues */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
            <ThumbsUp size={18} className="text-teal-700" />
            Most Supported Campus Issues
          </h2>
          <div className="space-y-3">
            {sortedByUpvotes.map((item) => {
              const votes = Array.isArray((item as any).issue_upvotes)
                ? (item as any).issue_upvotes.length
                : ((item as any).issue_upvotes?.[0]?.count ?? 0)

              return (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs p-3 bg-gray-50 rounded-xl">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-gray-500 text-[11px] mt-0.5">{item.building} &bull; {item.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={item.status} />
                    <span className="bg-teal-100 text-teal-800 font-bold px-2 py-1 rounded-md text-xs">
                      {votes} votes
                    </span>
                  </div>
                </div>
              )
            })}
            {sortedByUpvotes.length === 0 && (
              <p className="text-xs text-gray-400 py-4 text-center">No reports to rank.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
