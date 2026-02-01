'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success' | 'warning' | 'info'>('error')
  const [resending, setResending] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const locale = params.locale as string
  const t = useTranslations('login')
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('info') // Default

    // Client-side validation
    if (password.length < 6) {
      setMessageType('error')
      setMessage(t('passwordTooShort'))
      setLoading(false)
      return
    }

    if (isSignUp && !displayName.trim()) {
      setMessageType('error')
      setMessage('Please enter a display name')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/${locale}/auth/callback`,
            data: {
              display_name: displayName.trim(),
            }
          }
        })

        if (error) {
          // Check if user already exists
          if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already exists') ||
            error.message.toLowerCase().includes('user already registered')) {
            setMessageType('warning')
            setMessage(t('accountExists'))
            setLoading(false)
            return
          }
          throw error
        }

        // TODO: maybe allow users to be able to use both email and google
        // Check if user already exists (no error but no session created)
        // This happens when email enumeration protection is enabled
        // if (data?.user && !data.session && data.user.identities?.length === 0) {
        //   setMessageType('warning')
        //   setMessage(t('accountExists'))
        //   setLoading(false)
        //   return
        // }

        // Profile will be created in the callback after email confirmation
        // Supabase automatically sends a confirmation email
        setMessageType('success')
        setMessage(t('checkEmail'))
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          // Check if error is due to unconfirmed email
          if (error.message.toLowerCase().includes('email not confirmed')) {
            setMessageType('warning')
            setMessage(t('verifyEmail'))
            setShowResendVerification(true)
            setLoading(false)
            return
          }
          throw error
        }

        // Successfully signed in - let them in
        // verified_email is set to TRUE in the callback after they click confirmation email
        router.push(`/${locale}/pro/game`)
      }
    } catch (error: any) {
      setMessageType('error')
      // Translate common Supabase error messages
      const errorMsg = error.message || t('authError')
      if (errorMsg.toLowerCase().includes('password') && errorMsg.toLowerCase().includes('6')) {
        setMessage(t('passwordTooShort'))
      } else if (errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('email')) {
        setMessage(t('invalidEmail'))
      } else if (errorMsg.toLowerCase().includes('invalid login credentials')) {
        setMessage(t('authError'))
      } else {
        setMessage(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setMessage(t('enterEmail'))
      setMessageType('error')
      return
    }
    setResending(true)
    setMessage('')
    setMessageType('info')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${location.origin}/${locale}/auth/callback`
        },
      })
      if (error) throw error
      setMessageType('success')
      setMessage(t('verificationSent'))
    } catch (error: any) {
      setMessageType('error')
      setMessage(error.message || t('resending'))
    } finally {
      setResending(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/${locale}/auth/callback`
      }
    })
    if (error) {
      setMessageType('error')
      setMessage(error.message)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('info')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setMessageType('success')
      setMessage(t('resetLinkSent'))
      setShowForgotPassword(false)
    } catch (error: any) {
      setMessageType('error')
      const errorMsg = error.message || t('authError')
      if (errorMsg.toLowerCase().includes('invalid') && errorMsg.toLowerCase().includes('email')) {
        setMessage(t('invalidEmail'))
      } else {
        setMessage(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4" style={{ background: 'var(--gradient-surface)' }}>
        <div className="card-professional w-full max-w-md space-y-8 backdrop-blur-md p-10">
          {showForgotPassword ? (
            // Forgot Password Form with professional styling
            <>
              <div>
                <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 icon-container-accent">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gradient-professional">
                  {t('resetPassword')}
                </h2>
                <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('sendResetLink')}
                </p>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <input
                    type="email"
                    required
                    className="input-professional"
                    placeholder={t('email')}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-professional-accent w-full disabled:opacity-50"
                  >
                    {loading ? t('resending') : t('sendResetLink')}
                  </button>
                </div>
              </form>

              <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetEmail('')
                    setMessage('')
                  }}
                  className="link-button"
                >
                  {t('backToSignIn')}
                </button>
              </p>
            </>
          ) : (
            // Original Login/Sign Up Form with professional styling
            <>
              <div>
                <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-professional-blue icon-container-blue">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gradient-professional">
                  {isSignUp ? t('signUpTitle') : t('title')}
                </h2>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                <div className="space-y-4 rounded-xl">
                  <div>
                    <input
                      type="email"
                      required
                      className="input-professional"
                      placeholder={t('email')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {isSignUp && (
                    <div>
                      <input
                        type="text"
                        required
                        className="input-professional"
                        placeholder={t('displayName')}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="password"
                      required
                      className="input-professional"
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-professional-primary w-full disabled:opacity-50"
                  >
                    {loading ? t('loading') : isSignUp ? t('signUp') : t('signIn')}
                  </button>
                </div>
              </form>

              {message && (
                <div className={`${messageType === 'success' ? 'alert-success' :
                    messageType === 'warning' ? 'alert-warning' :
                      messageType === 'info' ? 'alert-info' :
                        'alert-error'
                  }`}>
                  {message === t('accountExists') ? (
                    <>
                      {t('accountExists').split('[')[0]}
                      <button
                        onClick={() => {
                          setIsSignUp(false)
                          setShowForgotPassword(true)
                          setResetEmail(email)
                          setMessage('')
                        }}
                        className="font-semibold underline hover:no-underline"
                      >
                        {t('resetPassword').toLowerCase()}
                      </button>
                      {' '}{t('accountExists').split(']')[1].split('[')[0]}
                      <button
                        onClick={handleGoogleLogin}
                        className="font-semibold underline hover:no-underline"
                      >
                        Google
                      </button>
                      {t('accountExists').split('[Google]')[1]}
                    </>
                  ) : (
                    message
                  )}
                </div>
              )}

              {isSignUp && (
                <div className="space-y-3">
                  {/* <div className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('verifyEmail')}
                  </div> */}
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="btn-professional-secondary w-full disabled:opacity-50"
                  >
                    {resending ? t('resending') : t('resendVerification')}
                  </button>
                </div>
              )}

              {!isSignUp && showResendVerification && (
                <div className="space-y-3">
                  <div className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {t('enterEmail')}
                  </div>
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="btn-professional-secondary w-full disabled:opacity-50"
                  >
                    {resending ? t('resending') : t('resendVerification')}
                  </button>
                </div>
              )}

              {!isSignUp && (
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowForgotPassword(true)
                      setShowResendVerification(false)
                      setMessage('')
                    }}
                    className="link-button text-sm"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
              )}

              {!isSignUp && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--color-neutral-300)' }}></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>{t('signInWith', { provider: '' }).replace('', '')}</span></div>
                  </div>

                  <button
                    onClick={handleGoogleLogin}
                    className="btn-professional-secondary w-full flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Google
                  </button>
                </>
              )}

              <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {isSignUp ? t('switchToSignIn') : t('switchToSignUp')}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setShowResendVerification(false)
                    setMessage('')
                  }}
                  className="link-button"
                >
                  {isSignUp ? t('signIn') : t('signUp')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
