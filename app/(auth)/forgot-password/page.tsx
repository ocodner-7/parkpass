'use client'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="bg-surface-secondary border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-content-primary">ParkPass</h1>
          <p className="text-sm text-content-muted mt-1">Reset your password</p>
        </div>

        {submitted ? (
          <div className="text-center">
            <p className="text-sm text-content-primary font-medium mb-2">Check your email</p>
            <p className="text-sm text-content-muted">
              {`We've sent a password reset link to`}<span className="text-content-primary">{email}</span>
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-accent hover:underline cursor-pointer"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-content-muted">
              {`Enter your email address and we'll send you a link to reset your password.`}
            </p>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
              />
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={isLoading || !email}
              className="w-full py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>

            <p className="text-xs text-content-muted text-center">
              <Link href="/login" className="text-accent hover:underline cursor-pointer">
                Back to sign in
              </Link>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}