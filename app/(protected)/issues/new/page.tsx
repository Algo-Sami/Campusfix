'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, AlertTriangle, ThumbsUp, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { StatusBadge, UrgencyBadge } from '@/components/ui/Badge'
import { ISSUE_CATEGORIES, ISSUE_URGENCIES, getCategoryIcon } from '@/lib/utils'
import type { Issue } from '@/types/database'

type Step = 'search' | 'form'

const BUILDINGS = [
  'Main Building', 'Science Block', 'Engineering Block', 'Library',
  'Student Center', 'Sports Complex', 'Cafeteria', 'Admin Block',
  'Hostel A', 'Hostel B', 'Lecture Hall Complex', 'Computer Lab',
]

export default function NewIssuePage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({ building: '', category: '' })
  const [similarIssues, setSimilarIssues] = useState<Issue[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    building: '',
    room_location: '',
    urgency: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitLoading, setSubmitLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  async function handleSearch() {
    if (!searchQuery.trim() && !searchFilters.building && !searchFilters.category) {
      setSimilarIssues([])
      return
    }
    setSearchLoading(true)
    let query = supabase.from('issues').select('*').in('status', ['Open', 'In Progress']).limit(5)
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    if (searchFilters.building) query = query.eq('building', searchFilters.building)
    if (searchFilters.category) query = query.eq('category', searchFilters.category)

    const { data } = await query
    setSimilarIssues((data as Issue[]) ?? [])
    setSearchLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(handleSearch, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, searchFilters])

  async function handleUpvote(issueId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('issue_upvotes').insert({ issue_id: issueId, user_id: user.id }).then()
    router.push(`/issues/${issueId}`)
  }

  function validateForm() {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters'
    if (!form.description.trim() || form.description.length < 20) e.description = 'Description must be at least 20 characters'
    if (!form.category) e.category = 'Please select a category'
    if (!form.building) e.building = 'Please select a building'
    if (!form.room_location.trim()) e.room_location = 'Please enter a room or location'
    if (!form.urgency) e.urgency = 'Please select urgency level'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setServerError('')
    setSubmitLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category as any,
          building: form.building,
          room_location: form.room_location.trim(),
          urgency: form.urgency as any,
          created_by: user.id,
          status: 'Open',
        })
        .select()
        .single()

      if (error) {
        setServerError(error.message)
        setSubmitLoading(false)
        return
      }

      router.push(`/issues/${data.id}`)
    } catch {
      setServerError('Failed to submit issue. Please try again.')
      setSubmitLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/issues" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} />
          Back to Issues
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Report a Campus Issue</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Help us improve campus by reporting maintenance problems.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {(['search', 'form'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
              step === s ? 'bg-teal-700 text-white' :
              (s === 'search' && step === 'form') ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-medium ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>
              {s === 'search' ? 'Find Similar' : 'Report Issue'}
            </span>
            {i < 1 && <div className="w-10 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* STEP 1: Search */}
      {step === 'search' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Search Existing Issues</h2>
            <p className="text-sm text-gray-500">
              Before reporting, check if someone else already reported this problem. You can upvote it instead.
            </p>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Describe the issue (e.g., 'broken projector Lab 203')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={searchFilters.building}
                onChange={(e) => setSearchFilters((p) => ({ ...p, building: e.target.value }))}
                className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
              >
                <option value="">All Buildings</option>
                {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select
                value={searchFilters.category}
                onChange={(e) => setSearchFilters((p) => ({ ...p, category: e.target.value }))}
                className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700"
              >
                <option value="">All Categories</option>
                {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Search results */}
          {searchLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Searching...
            </div>
          )}

          {similarIssues.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle size={15} />
                <span className="text-sm font-medium">Similar issues found — please check before submitting!</span>
              </div>
              <div className="space-y-3">
                {similarIssues.map((issue) => (
                  <div key={issue.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{getCategoryIcon(issue.category)} {issue.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{issue.building} · {issue.room_location}</div>
                      </div>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/issues/${issue.id}`}>
                        <Button size="sm" variant="outline">View Issue</Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => handleUpvote(issue.id)} className="text-teal-700">
                        <ThumbsUp size={14} />
                        Upvote This
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similarIssues.length === 0 && (searchQuery || searchFilters.building || searchFilters.category) && !searchLoading && (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              No similar issues found. Your issue appears to be unique — please proceed to submit.
            </div>
          )}

          <Button onClick={() => setStep('form')} className="w-full" size="lg">
            Continue to Report Form
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* STEP 2: Form */}
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">Issue Details</h2>
            <p className="text-sm text-gray-500">Fill in all required fields about the campus problem.</p>
          </div>

          <Input
            label="Issue Title"
            required
            placeholder="Short, clear description (e.g., 'Broken AC in Room 302')"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            error={errors.title}
            maxLength={200}
          />

          <Textarea
            label="Detailed Description"
            required
            placeholder="Describe the problem in detail — when it started, impact on students, any relevant context..."
            rows={5}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            error={errors.description}
            maxLength={2000}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select
              label="Category"
              required
              placeholder="Select category"
              options={ISSUE_CATEGORIES.map((c) => ({ value: c, label: `${getCategoryIcon(c)} ${c}` }))}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              error={errors.category}
            />

            <Select
              label="Urgency Level"
              required
              placeholder="Select urgency"
              options={ISSUE_URGENCIES.map((u) => ({ value: u, label: u }))}
              value={form.urgency}
              onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value }))}
              error={errors.urgency}
            />

            <Select
              label="Building"
              required
              placeholder="Select building"
              options={BUILDINGS.map((b) => ({ value: b, label: b }))}
              value={form.building}
              onChange={(e) => setForm((p) => ({ ...p, building: e.target.value }))}
              error={errors.building}
            />

            <Input
              label="Room / Location"
              required
              placeholder="e.g., Room 203, 2nd Floor Corridor"
              value={form.room_location}
              onChange={(e) => setForm((p) => ({ ...p, room_location: e.target.value }))}
              error={errors.room_location}
              maxLength={200}
            />
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep('search')}>
              <ArrowLeft size={16} />
              Back
            </Button>
            <Button type="submit" loading={submitLoading} className="flex-1" size="lg">
              Submit Issue Report
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
