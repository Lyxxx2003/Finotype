'use client'

import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            There was an issue verifying your email link. Only one verification is needed. 
          </p>
          <p className="text-sm text-gray-500">
             The link may have expired or been automatically visited by your email provider. 
             If you can sign in, your account is already verified.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/login"
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
