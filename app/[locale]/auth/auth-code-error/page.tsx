'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AuthErrorPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-morandi">
      <div className="card-morandi w-full max-w-md space-y-8 p-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'linear-gradient(135deg, rgba(196,148,139,0.2) 0%, rgba(196,148,139,0.1) 100%)' }}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-terracotta)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold" style={{ background: 'linear-gradient(135deg, #4A6FA5 0%, #C4948B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {t('authError')}
        </h2>
        <div className="space-y-4">
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {t('authErrorMessage')}
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {t('authErrorDetail')}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href={`/${locale}/login`}
            className="btn-morandi-primary flex w-full justify-center"
          >
            {t('signInButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}
