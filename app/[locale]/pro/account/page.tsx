'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | 'warning' | 'info'>('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('account');
  const supabase = createClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageType('info');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', user.id);

      if (error) throw error;
      setMessageType('success');
      setMessage(t('saved'));
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || t('savedError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setMessage('');
    setMessageType('info');
    try {
      // Call API route to delete account
      const response = await fetch('/api/delete-account', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('deleteError'));
      }
      
      setMessageType('success');
      setMessage(t('deleteSuccess'));
      
      // Sign out and redirect
      await supabase.auth.signOut();
      router.push('/');
    } catch (error: any) {
      setMessageType('error');
      setMessage(error.message || t('deleteError'));
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-morandi">
        <div className="text-morandi-dark" style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 bg-gradient-morandi" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gradient-morandi">{t('title')}</h1>
        <Link 
          href={`/${locale}/pro/game`}
          className="btn-morandi-outline text-sm"
        >
          ← {t('backToGame')}
        </Link>
      </div>

      <div className="card-morandi p-8 space-y-6">
        {/* Email */}
        <div>
          <label className="label-morandi">
            {t('email')}
          </label>
          <div className="display-box">
            {user?.email}
          </div>
        </div>

        {/* Display Name */}
        <form onSubmit={handleSave}>
          <div>
            <label className="label-morandi">
              {t('displayName')}
            </label>
            <input
              type="text"
              maxLength={50}
              className="input-morandi"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {t('displayNameNote')}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 btn-morandi-primary disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>

        {message && (
          <div className={`${
            messageType === 'success' ? 'alert-success' :
            messageType === 'error' ? 'alert-error' :
            messageType === 'warning' ? 'alert-warning' :
            'alert-info'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card-danger mt-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-terracotta)' }}>{t('dangerZone')}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {t('deleteWarning')}
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-morandi-danger text-sm"
        >
          {t('deleteAccount')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(196,148,139,0.2) 0%, rgba(196,148,139,0.1) 100%)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-terracotta)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center" style={{ color: 'var(--color-text)' }}>{t('confirmDelete')}</h3>
            <p className="mb-8 leading-relaxed text-center" style={{ color: 'var(--color-text-secondary)' }}>
              {t('deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn-morandi-secondary flex-1 py-3 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn-morandi-danger flex-1 py-3 disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('confirmButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
