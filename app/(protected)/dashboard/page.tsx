import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, AlertCircle, FileText, TrendingUp, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, timeAgo } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // KPI counts
  const [totalRes, openRes, inProgressRes, resolvedRes] = await Promise.all([
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('created_by', user.id).eq('status', 'Open'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('created_by', user.id).eq('status', 'In Progress'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('created_by', user.id).eq('status', 'Resolved'),
  ])

  // Recent campus issues
  const { data: recentIssues } = await supabase
    .from('issues')
    .select('*, issue_upvotes(count)')
    .order('created_at', { ascending: false })
    .limit(5)

  // My recent issues
  const { data: myIssues } = await supabase
    .from('issues')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const kpis = [
    { label: 'Total Submitted', value: totalRes.count ?? 0, icon: <FileText size={20} className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Open Issues', value: openRes.count ?? 0, icon: <AlertCircle size={20} className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'In Progress', value: inProgressRes.count ?? 0, icon: <Clock size={20} className="text-orange-600" />, color: 'bg-orange-50' },
    { label: 'Resolved', value: resolvedRes.count ?? 0, icon: <CheckCircle size={20} className="text-emerald-600" />, color: 'bg-emerald-50' },
  ]

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Stay informed about campus issues and help improve your campus.</p>
        </div>
        <Link href="/issues/new">
          <Button>
            <Plus size={16} />
            Report an Issue
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="py-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  {kpi.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-500">{kpi.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/issues/new" className="group">
          <div className="bg-teal-700 hover:bg-teal-800 text-white rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div>
              <div className="font-semibold">Report an Issue</div>
              <div className="text-sm text-teal-200">Submit a new campus problem</div>
            </div>
          </div>
        </Link>
        <Link href="/issues" className="group">
          <div className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <div>
              <div className="font-semibold">Browse Issues</div>
              <div className="text-sm text-slate-300">See all campus reports</div>
            </div>
          </div>
        </Link>
        <Link href="/my-issues" className="group">
          <div className="bg-sky-700 hover:bg-sky-800 text-white rounded-xl p-5 flex items-center gap-4 transition-colors cursor-pointer">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={20} />
            </div>
            <div>
              <div className="font-semibold">My Reports</div>
              <div className="text-sm text-sky-200">Track your submissions</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campus Issues */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Campus Issues</h2>
              <Link href="/issues" className="text-sm text-teal-700 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentIssues && recentIssues.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{issue.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{issue.building} · {issue.room_location}</div>
                      </div>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <UrgencyBadge urgency={issue.urgency} />
                      <span className="text-xs text-gray-400">{timeAgo(issue.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400 text-sm">
                No campus issues reported yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Recent Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">My Recent Reports</h2>
              <Link href="/my-issues" className="text-sm text-teal-700 hover:underline">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {myIssues && myIssues.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {myIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{issue.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{issue.category}</div>
                      </div>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Updated {timeAgo(issue.updated_at)}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <TrendingUp size={32} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">You haven&apos;t reported any issues yet.</p>
                <Link href="/issues/new" className="inline-block mt-3">
                  <Button size="sm">Report Your First Issue</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
