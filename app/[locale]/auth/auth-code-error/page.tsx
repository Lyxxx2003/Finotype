'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function AuthErrorPage() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {t('authError')}
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('authErrorMessage')}
          </p>
          <p className="text-sm text-gray-500">
            {t('authErrorDetail')}
          </p>
        </div>
        <div className="mt-8">
          <Link
            href={`/${locale}/login`}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 shadow-sm"
          >
            {t('signInButton')}
          </Link>
        </div>
      </div>
    </div>
  )
}
