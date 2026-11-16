'use client'

import Link from 'next/link'
import { Wrench, Mail, MapPin } from 'lucide-react'

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-white mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Wrench size={16} className="text-white" />
              </div>
              <span className="text-lg tracking-tight">
                Campus<span className="text-teal-400">Fix</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Smart Campus Issue & Maintenance Portal. Report problems, track progress, and help improve your campus together.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigate</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About' },
                { href: '/features', label: 'Features' },
                { href: '/faqs', label: 'FAQs' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/login', label: 'Sign In' },
                { href: '/signup', label: 'Create Account' },
                { href: '/forgot-password', label: 'Forgot Password' },
                { href: '/dashboard', label: 'My Dashboard' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} />
                <span>support@campusfix.edu</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} />
                <span>Campus Administration Building</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; 2026 CampusFix. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">
            Built for a better campus experience.
          </p>
        </div>
      </div>
    </footer>
  )
}
