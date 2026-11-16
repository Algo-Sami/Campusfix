'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.password || form.password.length < 8) errs.password = 'At least 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setServerError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)

    if (error) {
      setServerError(error.message)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center mb-7">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <Wrench size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">New password</h1>
        <p className="text-sm text-gray-500 mt-1 text-center">Choose a strong new password</p>
      </div>

      {done ? (
        <div className="text-center">
          <CheckCircle size={40} className="text-emerald-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Password updated successfully. Redirecting to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              error={errors.password}
              leftIcon={<Lock size={16} />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Repeat your password"
            value={form.confirm}
            onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
            error={errors.confirm}
            leftIcon={<Lock size={16} />}
          />
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Update Password
          </Button>
        </form>
      )}
    </div>
  )
}
