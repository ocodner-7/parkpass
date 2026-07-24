'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isValid = password.length >= 6 && password === confirmPassword

  const handleSubmit = async () => {
    if (!isValid) return
    setError('')
    setIsLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center">
      <div className="bg-surface-secondary border border-border-default rounded-2xl shadow-sm w-full max-w-sm p-8">

        <div className="mb-8">
          <h1 className="text-xl font-semibold text-content-primary">ParkPass</h1>
          <p className="text-sm text-content-muted mt-1">Choose a new password</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1.5">
              New password <span className="text-content-muted">(min. 6 characters)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-content-secondary mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full px-3 py-2.5 text-sm bg-surface-elevated border border-border-default rounded-lg outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-content-primary placeholder:text-content-muted"
            />
          </div>

          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-danger">{`Passwords don't match`}</p>
          )}

          {error && <p className="text-xs text-danger">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !isValid}
            className="w-full py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? 'Updating...' : 'Update password'}
          </button>
        </div>

      </div>
    </div>
  )
}