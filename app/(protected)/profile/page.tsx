'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Shield, Building, Calendar, CheckCircle2, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types/database'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setFullName(data.full_name || '')
        setDepartment(data.department || '')
      }
      setLoading(false)
    }

    fetchProfile()
  }, [supabase, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError('')
    setSuccess(false)

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters')
      setSaving(false)
      return
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        department: department.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    setSaving(false)

    if (updateErr) {
      setError(updateErr.message)
    } else {
      setSuccess(true)
      setProfile(prev => prev ? { ...prev, full_name: fullName.trim(), department: department.trim() || null } : null)
      setTimeout(() => setSuccess(false), 4000)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border p-6 space-y-4">
          <div className="h-8 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1 text-sm">
          View your campus details and update your display information.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Role badge banner */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{profile.full_name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Mail size={12} /> {profile.email}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-3 py-1 rounded-full">
            {profile.role}
          </span>
        </div>

        {/* Read-only account properties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gray-400" />
            <span>Role: <strong className="text-gray-800 capitalize">{profile.role}</strong> (Cannot be self-assigned)</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span>Joined: <strong className="text-gray-800">{formatDate(profile.created_at)}</strong></span>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User size={16} />}
          />

          <Input
            label="Department / Program"
            placeholder="e.g. Electrical Engineering, Computer Science"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            leftIcon={<Building size={16} />}
          />

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Profile updated successfully.
            </p>
          )}

          <div className="flex items-center justify-between pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut size={14} /> Sign Out
            </Button>

            <Button type="submit" loading={saving} size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
