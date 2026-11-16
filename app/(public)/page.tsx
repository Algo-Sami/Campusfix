import Link from 'next/link'
import { ArrowRight, CheckCircle, AlertTriangle, Users, TrendingUp, Bell, Shield, BarChart3, Clock, Wrench, Star, Zap, MessageSquare, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-teal-700/40 text-teal-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-teal-600/30">
              <Zap size={14} />
              Smart Campus Maintenance Portal
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Fix Campus Problems.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">
                Together.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10 max-w-2xl mx-auto">
              CampusFix brings your campus community together to report maintenance issues, support important problems, and track every step toward resolution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-500 text-white w-full sm:w-auto shadow-lg shadow-teal-900/30">
                  Report an Issue
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-slate-600 text-white bg-white/10 hover:bg-white/20 w-full sm:w-auto backdrop-blur-sm">
                  Explore Campus Issues
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-md mx-auto">
              {[
                { label: 'Issues Tracked', value: '500+' },
                { label: 'Campus Buildings', value: '20+' },
                { label: 'Avg Resolution', value: '3 days' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-teal-400">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 md:h-14">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Campus Maintenance Problem</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Campus maintenance has traditionally been fragmented, slow, and opaque.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare size={22} className="text-red-500" />,
                title: 'Scattered Reports',
                desc: 'Issues reported through WhatsApp groups, emails, and paper logs that easily get lost or overlooked.',
              },
              {
                icon: <Clock size={22} className="text-orange-500" />,
                title: 'Forgotten Requests',
                desc: 'Maintenance requests disappear without acknowledgement, leaving reporters wondering if anyone cared.',
              },
              {
                icon: <AlertTriangle size={22} className="text-yellow-500" />,
                title: 'Duplicate Reports',
                desc: 'The same problem reported by dozens of people, wasting time and creating confusion for maintenance teams.',
              },
              {
                icon: <Search size={22} className="text-blue-500" />,
                title: 'No Visibility',
                desc: 'Reporters have no way to see if their issue was acknowledged, assigned, or when it will be fixed.',
              },
              {
                icon: <TrendingUp size={22} className="text-purple-500" />,
                title: 'No Prioritization',
                desc: 'All issues treated equally, so critical safety problems can sit unaddressed alongside minor inconveniences.',
              },
              {
                icon: <BarChart3 size={22} className="text-teal-500" />,
                title: 'No Analytics',
                desc: 'Campus leadership has no data on recurring problems, resolution times, or maintenance team performance.',
              },
            ].map((problem) => (
              <div key={problem.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                  {problem.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How CampusFix Works</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A simple three-step process from problem discovery to resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-teal-300 to-sky-300" />

            {[
              {
                step: '01',
                icon: <Wrench size={28} className="text-teal-700" />,
                title: 'Report',
                desc: 'Students report campus issues with location, category, description, and urgency. Search existing reports first to avoid duplicates.',
                color: 'bg-teal-100 border-teal-200',
              },
              {
                step: '02',
                icon: <Users size={28} className="text-sky-700" />,
                title: 'Community Support',
                desc: 'Other campus members discover existing issues and upvote problems affecting them, helping prioritize the most impactful fixes.',
                color: 'bg-sky-100 border-sky-200',
              },
              {
                step: '03',
                icon: <CheckCircle size={28} className="text-emerald-700" />,
                title: 'Resolution',
                desc: 'Administrators review reports, assign maintenance teams, provide official updates, and mark issues resolved with notes.',
                color: 'bg-emerald-100 border-emerald-200',
              },
            ].map((step, i) => (
              <div key={step.step} className="relative text-center">
                <div className={`w-28 h-28 ${step.color} rounded-2xl border-2 flex items-center justify-center mx-auto mb-6 shadow-sm`}>
                  {step.icon}
                  <span className="absolute -top-3 -right-3 w-7 h-7 bg-slate-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete platform for campus issue management, from reporting to resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Wrench />, title: 'Smart Reporting', desc: 'Guided issue submission with categories, location, and urgency.' },
              { icon: <Search />, title: 'Issue Feed', desc: 'Browse all campus issues with search, filters, and sorting.' },
              { icon: <TrendingUp />, title: 'Community Upvoting', desc: 'Support issues that affect you to help administrators prioritize.' },
              { icon: <AlertTriangle />, title: 'Duplicate Awareness', desc: 'Find existing reports before submitting to reduce clutter.' },
              { icon: <Clock />, title: 'Real-Time Tracking', desc: 'Live status updates from Open through In Progress to Resolved.' },
              { icon: <Bell />, title: 'Notifications', desc: 'Get notified when your issue status changes or is resolved.' },
              { icon: <Shield />, title: 'Admin Controls', desc: 'Full triage, assignment, and resolution workflow for administrators.' },
              { icon: <BarChart3 />, title: 'Analytics', desc: 'Operational analytics and charts for campus leadership insights.' },
            ].map((f) => (
              <div key={f.title} className="p-5 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-teal-50 group-hover:bg-teal-100 rounded-lg flex items-center justify-center mb-4 text-teal-700 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Who Benefits</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              CampusFix serves every member of the campus community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                role: 'Students',
                icon: '🎓',
                color: 'from-teal-500 to-teal-700',
                benefits: ['Submit and track your issues easily', 'Get notified of status changes', 'Upvote problems affecting you', 'View resolution history and notes'],
              },
              {
                role: 'Faculty & Staff',
                icon: '👩‍🏫',
                color: 'from-sky-500 to-sky-700',
                benefits: ['Report infrastructure problems quickly', 'Track maintenance progress', 'Support high-priority issues', 'Help maintain a better campus'],
              },
              {
                role: 'Administrators',
                icon: '⚙️',
                color: 'from-purple-500 to-purple-700',
                benefits: ['Centralized issue management dashboard', 'Assign teams and track progress', 'Full audit trail of all actions', 'Analytics for informed decisions'],
              },
              {
                role: 'Campus Leadership',
                icon: '🏛️',
                color: 'from-amber-500 to-amber-700',
                benefits: ['Maintenance trend analytics', 'Resolution time performance', 'Resource allocation insights', 'Campus-wide maintenance overview'],
              },
            ].map((benefit) => (
              <div key={benefit.role} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`bg-gradient-to-r ${benefit.color} p-5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{benefit.icon}</span>
                    <h3 className="text-xl font-bold text-white">{benefit.role}</h3>
                  </div>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {benefit.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-sm text-gray-600">
                        <CheckCircle size={15} className="text-teal-600 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-teal-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-5xl mb-6">🏫</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Make Your Campus Better,<br />One Issue at a Time.
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
            Join your campus community in building a better, well-maintained environment for everyone.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-900/40 px-10">
              Get Started — It&apos;s Free
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
