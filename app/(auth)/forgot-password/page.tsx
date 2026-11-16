'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wrench, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-fade-in">
      <div className="flex flex-col items-center mb-7">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <Wrench size={24} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Enter your email and we will send you a reset link
        </p>
      </div>

      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Recovery email sent to <strong>{email}</strong>. Check your inbox and follow the link to reset your password.
          </p>
          <Link href="/login">
            <Button className="w-full" variant="outline">
              <ArrowLeft size={16} />
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            required
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            leftIcon={<Mail size={16} />}
            autoComplete="email"
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send Reset Link
          </Button>
          <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mt-2">
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </form>
      )}
    </div>
  )
}
