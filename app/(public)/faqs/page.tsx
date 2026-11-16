'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'What is CampusFix?',
    a: 'CampusFix is a smart campus issue and maintenance portal that allows students, faculty, and staff to report campus problems, track their progress, and support issues that affect them. Administrators use it to manage, prioritize, and resolve maintenance requests.',
  },
  {
    q: 'Who can use CampusFix?',
    a: 'CampusFix is available to authenticated campus members — students, faculty, and staff. All users must register with a valid campus email account. Administrator access is provisioned separately by the campus IT team.',
  },
  {
    q: 'How do I report a campus issue?',
    a: 'Sign in to your account, then click "Report an Issue." You will first be prompted to search for existing issues to avoid duplicates. If your issue is new, fill in the title, description, category, building, location, and urgency level, then submit.',
  },
  {
    q: 'Can I report an issue anonymously?',
    a: 'No. All issue submissions require an authenticated account so that administrators can contact reporters for clarification and so the system can send you notifications about your issue. Your name is not publicly displayed to other students on issue cards.',
  },
  {
    q: 'What if someone else already reported my issue?',
    a: "Great — that's exactly what the duplicate awareness feature is for. Before submitting, search existing reports. If you find your issue already reported, upvote it instead of creating a duplicate. This helps administrators see how many people are affected.",
  },
  {
    q: 'What does upvoting do?',
    a: 'Upvoting signals to administrators that multiple campus members are affected by an issue. Each user can upvote each issue once. Upvote counts help administrators prioritize — a broken Wi-Fi point with 40 upvotes gets attention faster than one with 2.',
  },
  {
    q: 'How can I track my issue?',
    a: 'Open "My Issues" from the dashboard to see all your reported issues and their current status. You can also open any issue to see its full timeline. You will receive in-app notifications when the status changes or when an official update is posted.',
  },
  {
    q: 'What do the different issue statuses mean?',
    a: 'Open: Submitted and awaiting review. In Progress: Assigned to a team and work has started. Resolved: Work is complete — you may be asked to confirm the fix. Closed: Confirmed resolved and archived. Rejected: Issue cannot be acted on; a reason is provided.',
  },
  {
    q: 'Who manages reported issues?',
    a: 'Campus administrators manage all reported issues through the administration dashboard. They review new reports, assign maintenance teams, provide official updates, and change issue status through each step of the resolution workflow.',
  },
  {
    q: 'Can I edit or delete my issue?',
    a: 'Yes, but only while the issue status is Open. Once an administrator has started working on an issue (In Progress or beyond), edits and deletions are locked to preserve the record. You can still view your issue and receive updates.',
  },
  {
    q: 'How will I know when my issue is resolved?',
    a: "You will receive an in-app notification when an administrator marks your issue as Resolved. The notification includes a link to the issue detail page where you can read the resolution notes and confirm whether the problem has been fixed.",
  },
  {
    q: 'What happens if an issue is rejected?',
    a: "If an administrator cannot act on your report, they will mark it as Rejected and provide a reason. You will be notified and can read the rejection reason on the issue detail page. You are welcome to contact campus support if you believe the issue warrants further attention.",
  },
  {
    q: 'Is CampusFix available to faculty and staff?',
    a: 'Yes. Faculty and staff can register and use CampusFix with the same reporting permissions as students. The platform is designed for all campus members who experience maintenance issues.',
  },
  {
    q: 'How can I contact support?',
    a: 'Use the Contact page to send a message to the campus support team. For urgent safety issues, please contact campus security directly rather than using the web portal.',
  },
]

function FAQItem({ faq, isOpen, onClick }: { faq: { q: string; a: string }; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.q}</span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </button>
      <div className={cn('overflow-hidden transition-all duration-300', isOpen ? 'max-h-96' : 'max-h-0')}>
        <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {faq.a}
        </div>
      </div>
    </div>
  )
}

export default function FAQsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-teal-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">Frequently Asked Questions</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Everything you need to know about using CampusFix.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>

          <div className="mt-14 bg-teal-50 rounded-2xl p-8 text-center border border-teal-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Our support team is happy to help. Send us a message and we will get back to you.
            </p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
