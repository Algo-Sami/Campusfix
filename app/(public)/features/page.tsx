import type { Metadata } from 'next'
import { Wrench, Search, Users, Bell, BarChart3, Shield, Clock, FileText, GitBranch, Settings, Star, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Features — CampusFix',
  description: 'Explore all the features that make CampusFix the smart choice for campus issue management.',
}

const features = [
  {
    icon: <Wrench size={28} />,
    title: 'Smart Issue Reporting',
    desc: 'Submit campus issues with structured forms including category, building, room location, urgency level, and detailed description. Guided validation ensures complete, actionable reports.',
    color: 'bg-teal-100 text-teal-700',
  },
  {
    icon: <Search size={28} />,
    title: 'Campus Issue Feed',
    desc: 'Browse all reported campus issues in a searchable, filterable feed. Find issues by category, building, urgency, or status. Sort by newest, most upvoted, or recently updated.',
    color: 'bg-sky-100 text-sky-700',
  },
  {
    icon: <FileText size={28} />,
    title: 'Issue Search & Filters',
    desc: 'Powerful search across issue titles and descriptions, combined with filters for category, building, urgency, and status. Find exactly what you are looking for in seconds.',
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    icon: <Users size={28} />,
    title: 'Community Upvoting',
    desc: 'Support issues that affect you by upvoting them. Each user gets exactly one vote per issue, enforced at the database level. Upvote counts help administrators prioritize.',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: <GitBranch size={28} />,
    title: 'Duplicate Awareness',
    desc: 'Before submitting, search existing reports to avoid duplicates. If a similar issue exists, you can upvote it instead. Administrators can formally link duplicate reports to canonical issues.',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: <Clock size={28} />,
    title: 'Issue Timeline',
    desc: 'Every issue has a full chronological timeline showing creation, status changes, assignments, official updates, and resolution notes. Complete traceability from open to closed.',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    icon: <Star size={28} />,
    title: 'Status Tracking',
    desc: 'Issues move through a structured workflow: Open → In Progress → Resolved → Closed. Every transition is validated, recorded, and visible to relevant parties.',
    color: 'bg-rose-100 text-rose-700',
  },
  {
    icon: <Zap size={28} />,
    title: 'Administrator Triage',
    desc: 'Administrators get a full triage interface: review new reports, check duplicates, request clarification, adjust priority, assign teams, add official updates, and manage resolutions.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: <Shield size={28} />,
    title: 'Maintenance Assignment',
    desc: 'Assign issues to specific maintenance teams or individual staff members. Track who is responsible and ensure accountability throughout the resolution process.',
    color: 'bg-cyan-100 text-cyan-700',
  },
  {
    icon: <Bell size={28} />,
    title: 'Notifications',
    desc: 'Get in-app notifications for status changes, official updates, and resolutions on your issues. Full notification center with read/unread tracking and direct links to issues.',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: <BarChart3 size={28} />,
    title: 'Analytics Dashboard',
    desc: 'Administrators access operational analytics with charts for issues by category, building, and urgency. Track submission trends, resolution times, and overall performance.',
    color: 'bg-lime-100 text-lime-700',
  },
  {
    icon: <Settings size={28} />,
    title: 'Role-Based Access',
    desc: 'Three-tier role system: Students/Faculty report and track issues; Administrators manage and resolve; all permissions enforced at the PostgreSQL database layer with Row Level Security.',
    color: 'bg-slate-100 text-slate-700',
  },
]

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-teal-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">Platform Features</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything needed to report, track, and resolve campus maintenance issues — built for real university workflows.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-teal-200 transition-all group">
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-5">Built on Solid Technology</h2>
          <p className="text-gray-500 mb-10 max-w-2xl mx-auto">
            CampusFix is built with modern, production-grade technology that prioritizes security, performance, and reliability.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Next.js 16', desc: 'App Router + Server Actions' },
              { label: 'Supabase', desc: 'PostgreSQL + Auth + RLS' },
              { label: 'TypeScript', desc: 'Full type safety' },
              { label: 'Vercel', desc: 'Global edge deployment' },
            ].map((tech) => (
              <div key={tech.label} className="bg-white rounded-xl p-5 border border-teal-100 shadow-sm">
                <div className="font-bold text-gray-900 mb-1">{tech.label}</div>
                <div className="text-xs text-gray-500">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
