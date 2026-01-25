'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success' | 'warning' | 'info'>('error')
  const router = useRouter()
  const supabase = createClient()

  const [hasValidSession, setHasValidSession] = useState(true)

  useEffect(() => {
    // Check if user has a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage('Invalid or expired reset link. Please request a new one.')
        setMessageType('error')
        setHasValidSession(false)
      }
    })
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('info')

    // Validation
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      setMessage('Password updated successfully! Redirecting to login...')
      setMessageType('success')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      setMessage(error.message || 'Failed to reset password. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Set New Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${
            messageType === 'success' ? 'text-green-800 bg-green-50' :
            messageType === 'warning' ? 'text-yellow-800 bg-yellow-50' :
            messageType === 'info' ? 'text-blue-800 bg-blue-50' :
            'text-red-800 bg-red-50'
          }`}>
            <div className="text-sm">{message}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setMessage('')
                }}
                disabled={loading || !hasValidSession}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setMessage('')
                }}
                disabled={loading || !hasValidSession}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !hasValidSession}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500">
          <button
            onClick={() => router.push('/login')}
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
