'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { ISSUE_CATEGORIES, ISSUE_URGENCIES } from '@/lib/utils'

const BUILDINGS = [
  'Main Building', 'Science Block', 'Engineering Block', 'Library',
  'Student Center', 'Sports Complex', 'Cafeteria', 'Admin Block',
  'Hostel A', 'Hostel B', 'Lecture Hall Complex', 'Computer Lab',
]

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditIssuePage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    building: '',
    room_location: '',
    urgency: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    async function fetchIssue() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: err } = await supabase
        .from('issues')
        .select('*')
        .eq('id', id)
        .single()

      if (err || !data) {
        setError('Issue not found')
        setLoading(false)
        return
      }

      if (data.created_by !== user.id) {
        setError('You are not authorized to edit this issue.')
        setLoading(false)
        return
      }

      if (data.status !== 'Open') {
        setError('Only issues with status "Open" can be edited.')
        setLoading(false)
        return
      }

      setForm({
        title: data.title,
        description: data.description,
        category: data.category,
        building: data.building,
        room_location: data.room_location,
        urgency: data.urgency,
      })
      setLoading(false)
    }

    fetchIssue()
  }, [id, supabase, router])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim() || form.title.length < 5) e.title = 'Title must be at least 5 characters'
    if (!form.description.trim() || form.description.length < 20) e.description = 'Description must be at least 20 characters'
    if (!form.category) e.category = 'Select a category'
    if (!form.building) e.building = 'Select a building'
    if (!form.room_location.trim()) e.room_location = 'Enter location/room'
    if (!form.urgency) e.urgency = 'Select urgency'
    return e
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    setFieldErrors({})
    setSaving(true)

    const { error: updateErr } = await supabase
      .from('issues')
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as any,
        building: form.building,
        room_location: form.room_location.trim(),
        urgency: form.urgency as any,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'Open')

    setSaving(false)

    if (updateErr) {
      setError(updateErr.message)
    } else {
      router.push(`/issues/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border p-6 space-y-4">
          <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
          <div className="h-24 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Unable to Edit Issue</h2>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Link href={`/issues/${id}`}>
          <Button variant="outline">
            <ArrowLeft size={16} /> Back to Issue
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href={`/issues/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
        >
          <ArrowLeft size={15} /> Back to Issue Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Issue Report</h1>
        <p className="text-xs text-gray-500 mt-1">
          You can edit this issue because it is currently in Open status.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <Input
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
          error={fieldErrors.title}
        />

        <Textarea
          label="Description"
          required
          rows={5}
          value={form.description}
          onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
          error={fieldErrors.description}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            required
            options={ISSUE_CATEGORIES.map(c => ({ value: c, label: c }))}
            value={form.category}
            onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
            error={fieldErrors.category}
          />

          <Select
            label="Urgency"
            required
            options={ISSUE_URGENCIES.map(u => ({ value: u, label: u }))}
            value={form.urgency}
            onChange={(e) => setForm(p => ({ ...p, urgency: e.target.value }))}
            error={fieldErrors.urgency}
          />

          <Select
            label="Building"
            required
            options={BUILDINGS.map(b => ({ value: b, label: b }))}
            value={form.building}
            onChange={(e) => setForm(p => ({ ...p, building: e.target.value }))}
            error={fieldErrors.building}
          />

          <Input
            label="Room / Location"
            required
            value={form.room_location}
            onChange={(e) => setForm(p => ({ ...p, room_location: e.target.value }))}
            error={fieldErrors.room_location}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link href={`/issues/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
