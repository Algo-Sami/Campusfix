import type { Metadata } from 'next'
import { CheckCircle, Target, Heart, Lightbulb } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — CampusFix',
  description: 'Learn about CampusFix and our mission to improve campus maintenance management.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-teal-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">About CampusFix</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A transparent, organized platform built to transform how campus communities report and resolve maintenance issues.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm mb-4 uppercase tracking-wide">
                <Target size={16} />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5">Connecting Campus Communities</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                CampusFix was created to solve a persistent problem in higher education: campus maintenance requests getting lost in informal channels, duplicate reports piling up, and students and faculty left wondering if anyone has even seen their report.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our platform provides a single, organized place where campus members can report problems, discover existing issues, show community support through upvoting, and track every step toward resolution.
              </p>
              <p className="text-gray-600 leading-relaxed">
                For administrators, CampusFix replaces scattered paper logs and email threads with a structured, auditable workflow that makes it easy to prioritize, assign, and track maintenance work across the entire campus.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Heart className="text-rose-500" />, label: 'Community-Driven', desc: 'Built around the needs of real campus users' },
                { icon: <Lightbulb className="text-amber-500" />, label: 'Transparent', desc: 'Open status tracking for all campus issues' },
                { icon: <CheckCircle className="text-emerald-500" />, label: 'Accountable', desc: 'Full audit trail of every administrative action' },
                { icon: <Target className="text-teal-500" />, label: 'Efficient', desc: 'Reduces duplicate reports and speeds resolution' },
              ].map((val) => (
                <div key={val.label} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="mb-3">{val.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{val.label}</div>
                  <div className="text-xs text-gray-500">{val.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">The Problem We Solve</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                <span className="text-xl">❌</span> Before CampusFix
              </h3>
              <ul className="space-y-3">
                {[
                  'Reports lost in group chats and email threads',
                  'No single place to track open issues',
                  'Duplicate reports from multiple people',
                  'Reporters left with no status updates',
                  'No data on resolution performance',
                  'Administrators overwhelmed by unstructured requests',
                ].map((item) => (
                  <li key={item} className="text-sm text-red-800 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-teal-50 rounded-xl p-6 border border-teal-100">
              <h3 className="font-bold text-teal-900 mb-4 flex items-center gap-2">
                <span className="text-xl">✅</span> With CampusFix
              </h3>
              <ul className="space-y-3">
                {[
                  'All issues in one searchable, organized feed',
                  'Duplicate awareness before submitting',
                  'Real-time status tracking with timeline',
                  'Community upvoting surfaces important problems',
                  'Administrators get structured triage tools',
                  'Analytics reveal trends and performance data',
                ].map((item) => (
                  <li key={item} className="text-sm text-teal-800 flex items-start gap-2">
                    <CheckCircle size={14} className="text-teal-600 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-5">From Report to Resolution</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Every issue follows a transparent, auditable workflow from submission to closure.
          </p>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
            {[
              { status: 'Submitted', color: 'bg-blue-500', desc: 'User submits an issue with all required details. System assigns Open status and notifies the reporter.' },
              { status: 'Triaged', color: 'bg-amber-500', desc: 'Administrator reviews the issue, checks for duplicates, adjusts priority, and assigns to a maintenance team.' },
              { status: 'In Progress', color: 'bg-orange-500', desc: 'Work begins. The team provides official progress updates visible to the reporter and community.' },
              { status: 'Resolved', color: 'bg-emerald-500', desc: 'Administrator records resolution notes and marks the issue Resolved. Reporter is notified immediately.' },
              { status: 'Closed', color: 'bg-gray-500', desc: 'Issue confirmed resolved and closed. Full history preserved in the audit timeline.' },
            ].map((step, i) => (
              <div key={step.status} className="relative pl-20 pb-10 last:pb-0">
                <div className={`absolute left-5 top-1 w-6 h-6 ${step.color} rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {i + 1}
                </div>
                <div>
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${step.color} mb-2`}>
                    {step.status}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
