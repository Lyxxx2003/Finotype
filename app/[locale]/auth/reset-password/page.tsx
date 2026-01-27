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
      console.error('Reset password error:', error)
      setMessage(t('resetFailed'))
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-primary">
      <div className="card-morandi w-full max-w-md space-y-8 p-10">
        <div>
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 icon-container-accent">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gradient-morandi">
            {t('setNewPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            {t('enterNewPassword')}
          </p>
        </div>

        {message && (
          <div className={`rounded-2xl ${
            messageType === 'success' ? 'alert-success' :
            messageType === 'warning' ? 'alert-warning' :
            messageType === 'info' ? 'alert-info' :
            'alert-error'
          }`}>
            <div className="text-sm font-medium">{message}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="label-morandi">
                {t('newPassword')}
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={!hasValidSession}
                className="input-morandi disabled:opacity-50"
                placeholder={t('newPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="label-morandi">
                {t('confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={!hasValidSession}
                className="input-morandi disabled:opacity-50"
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
              className="btn-morandi-primary w-full disabled:opacity-50"
            >
              {loading ? t('updating') : t('updatePassword')}
            </button>
          </div>
        </form>

        {!hasValidSession && (
          <div className="text-center">
            <Link
              href={`/${locale}/login`}
              className="link-button text-sm"
            >
              {t('backToLogin')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
