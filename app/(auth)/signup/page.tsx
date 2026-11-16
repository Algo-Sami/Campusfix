'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Wrench, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = 'Full name is required (min 2 chars)'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setServerError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const siteOrigin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'https://campusfix-gules.vercel.app')
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${siteOrigin}/auth/callback`,
          data: {
            full_name: form.full_name.trim(),
            department: form.department.trim() || null,
          },
        },
      })

      if (error) {
        setServerError(error.message || 'Failed to create account.')
        setLoading(false)
        return
      }

      if (data.user && !data.session) {
        // Email confirmation required
        setSuccess(true)
        setLoading(false)
      } else if (data.session) {
        // Auto-confirmed
        router.push('/dashboard')
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-fade-in text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email!</h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account and sign in.
        </p>
        <Link href="/login">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center mb-7">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <Wrench size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="text-sm text-gray-500 mt-1">Join your campus community on CampusFix</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <Input
          label="Full Name"
          required
          placeholder="Your full name"
          value={form.full_name}
          onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
          error={errors.full_name}
          leftIcon={<User size={16} />}
          autoComplete="name"
        />

        <Input
          label="Email"
          type="email"
          required
          placeholder="you@university.edu"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={errors.email}
          leftIcon={<Mail size={16} />}
          autoComplete="email"
        />

        <Input
          label="Department (optional)"
          placeholder="e.g. Computer Science"
          value={form.department}
          onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            error={errors.password}
            leftIcon={<Lock size={16} />}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          required
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={(e) => setForm((p) => ({ ...p, confirm_password: e.target.value }))}
          error={errors.confirm_password}
          leftIcon={<Lock size={16} />}
          autoComplete="new-password"
        />

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create Account
          <ArrowRight size={16} />
        </Button>

        <p className="text-xs text-center text-gray-400">
          By creating an account you agree to our terms of use. Your role will be set to Student — administrator access is provisioned separately.
        </p>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link href="/login" className="text-teal-700 font-semibold hover:underline">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-4">
        <Link href="/" className="hover:text-gray-600 transition-colors">← Back to CampusFix</Link>
      </p>
    </div>
  )
}
