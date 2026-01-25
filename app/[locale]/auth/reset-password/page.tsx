'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success' | 'warning' | 'info'>('error')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const supabase = createClient()
  const t = useTranslations('auth')

  const [hasValidSession, setHasValidSession] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage(t('invalidResetLink'))
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

    if (password.length < 6) {
      setMessage(t('passwordTooShort'))
      setMessageType('error')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage(t('passwordsDontMatch'))
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      setMessage(t('passwordUpdated'))
      setMessageType('success')
      setTimeout(() => {
        router.push(`/${locale}/login`)
      }, 2000)
    } catch (error: any) {
      setMessage(error.message || t('resetFailed'))
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
            {t('setNewPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('enterNewPassword')}
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
                {t('newPassword')}
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={!hasValidSession}
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 disabled:opacity-50"
                placeholder={t('newPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={!hasValidSession}
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3 disabled:opacity-50"
                placeholder={t('confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !hasValidSession}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? t('updating') : t('updatePassword')}
            </button>
          </div>
        </form>

        {!hasValidSession && (
          <div className="text-center">
            <Link
              href={`/${locale}/login`}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {t('backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
