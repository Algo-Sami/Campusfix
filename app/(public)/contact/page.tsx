'use client'

import { useState } from 'react'
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'

export default function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required'
    if (!form.subject.trim()) e.subject = 'Subject is required'
    if (!form.message.trim() || form.message.length < 20) e.message = 'Message must be at least 20 characters'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ full_name: '', email: '', subject: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-slate-900 to-teal-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-5">Contact Us</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Have questions or feedback? We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  For general questions about CampusFix, use the form. For urgent campus safety issues, contact campus security directly.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Mail size={16} className="text-teal-700" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium text-gray-900">support@campusfix.edu</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                    <MapPin size={16} className="text-teal-700" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Location</div>
                    <div className="text-sm font-medium text-gray-900">Campus Administration Building</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              {status === 'success' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">
                    Thank you for reaching out. We will get back to you as soon as possible.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-teal-700 text-sm font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      required
                      placeholder="Your name"
                      value={form.full_name}
                      onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                      error={errors.full_name}
                    />
                    <Input
                      label="Email"
                      type="email"
                      required
                      placeholder="you@university.edu"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      error={errors.email}
                    />
                  </div>
                  <Input
                    label="Subject"
                    required
                    placeholder="What is this about?"
                    value={form.subject}
                    onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                    error={errors.subject}
                  />
                  <Textarea
                    label="Message"
                    required
                    placeholder="Tell us more..."
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    error={errors.message}
                  />
                  {status === 'error' && (
                    <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                  )}
                  <Button type="submit" loading={status === 'loading'} className="w-full" size="lg">
                    <Send size={16} />
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
