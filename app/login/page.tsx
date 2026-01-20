'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [showResendVerification, setShowResendVerification] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        
        if (error) {
          // Check if user already exists
          if (error.message.toLowerCase().includes('already registered') || 
              error.message.toLowerCase().includes('already exists') ||
              error.message.toLowerCase().includes('user already registered')) {
            setMessage('Looks like you already have an account! Please try signing in instead.')
            setIsSignUp(false)
            setLoading(false)
            return
          }
          throw error
        }
        
        // Additional check: if user exists and is already confirmed (Supabase might not throw error)
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setMessage('Looks like you already have an account! Please try signing in instead.')
          setIsSignUp(false)
          setLoading(false)
          return
        }
        
        setMessage('Check your email for the confirmation link.')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // Check if email is verified
        if (data.user && !data.user.email_confirmed_at) {
          await supabase.auth.signOut()
          setMessage('Please verify your email before signing in. Check your inbox for the confirmation link.')
          setShowResendVerification(true)
          return
        }
        
        router.push('/pro/game')
      }
    } catch (error: any) {
      setMessage(error.message || 'Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Enter your email to resend verification link.')
      return
    }
    setResending(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { 
          emailRedirectTo: `${location.origin}/auth/callback` 
        },
      })
      if (error) throw error
      setMessage('Verification email resent! Check your inbox.')
    } catch (error: any) {
      setMessage(error.message || 'Failed to resend verification email.')
    } finally {
      setResending(false)
    }
  }

  const handleGoogleLogin = async () => {
      const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
              redirectTo: `${location.origin}/auth/callback`
          }
      })
      if (error) setMessage(error.message)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setMessage('Password reset link sent! Check your email.')
      setShowForgotPassword(false)
    } catch (error: any) {
      setMessage(error.message || 'Failed to send reset email.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        {showForgotPassword ? (
          // Forgot Password Form
          <>
            <div>
              <h2 className="text-center text-3xl font-extrabold text-gray-900">
                Reset Password
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Enter your email to receive a password reset link
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
              <div>
                <input
                  type="email"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                  placeholder="Email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-gray-500">
              <button
                onClick={() => {
                  setShowForgotPassword(false)
                  setResetEmail('')
                  setMessage('')
                }}
                className="font-semibold text-blue-600 hover:text-blue-500"
              >
                Back to Sign In
              </button>
            </p>
          </>
        ) : (
          // Original Login/Sign Up Form
          <>
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Create your Pro Account' : 'Sign in to Pro'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the financial simulation engine
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>

        {isSignUp && (
          <div className="space-y-3">
          <div className="text-center text-sm text-gray-600">
            Didn’t get the confirmation email?
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            {resending ? 'Resending…' : 'Resend Confirmation Email'}
          </button>
        </div>
        )}

        {!isSignUp && showResendVerification && (
          <div className="space-y-3">
            <div className="text-center text-sm text-gray-600">
              Need a new verification link?
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
            >
              {resending ? 'Resending…' : 'Resend Verification Email'}
            </button>
          </div>
        )}
        
        {!isSignUp && (
          <>
            <div className="text-center">
              <button
                onClick={() => {
                  setShowForgotPassword(true)
                  setShowResendVerification(false)
                  setMessage('')
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </button>
            </div>
                        <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
            </div>
            
            <button 
              onClick={handleGoogleLogin}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setShowResendVerification(false)
                setMessage('')
              }}
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              {isSignUp ? 'Sign in' : 'Start free trial'}
            </button>
        </p>
        
        {message && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-2 rounded">
                {message}
            </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
