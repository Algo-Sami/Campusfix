'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Wrench, Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters'
    return e
  }

  async function handleLogin(e: React.FormEvent) {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (error) {
        setServerError(error.message || 'Invalid email or password.')
        setLoading(false)
        return
      }

      if (data.user) {
        // Fetch role from trusted DB
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push(redirect.startsWith('/admin') ? '/dashboard' : redirect)
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    /* Glassmorphism card — inspired by reference design */
    <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Wrench size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1 text-center">Sign in to your CampusFix account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Your password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            error={errors.password}
            leftIcon={<Lock size={16} />}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-teal-700 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign In
          <ArrowRight size={16} />
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-teal-700 font-semibold hover:underline">
          Create one
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 mt-5">
        <Link href="/" className="hover:text-gray-600 transition-colors">
          ← Back to CampusFix
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl h-96 animate-pulse" />}>
      <LoginForm />
    </Suspense>
  )
}
