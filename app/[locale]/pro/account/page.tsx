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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <Link 
          href={`/${locale}/pro/game`}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg transition-colors"
        >
          ← {t('backToGame')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('email')}
          </label>
          <div className="text-gray-900 bg-gray-50 px-4 py-2 rounded-md">
            {user?.email}
          </div>
        </div>

        {/* Display Name */}
        <form onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('displayName')}
            </label>
            <input
              type="text"
              maxLength={50}
              className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('displayNameNote')}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>

        {message && (
          <div className={`text-sm p-3 rounded-md ${
            messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            messageType === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">{t('dangerZone')}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {t('deleteWarning')}
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          {t('deleteAccount')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">{t('confirmDelete')}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {t('deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl text-gray-700 font-bold transition-colors disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button 
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl text-white font-bold transition-colors shadow-lg disabled:opacity-50"
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
