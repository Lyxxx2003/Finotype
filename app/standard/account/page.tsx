'use client';

import { useEffect, useState } from 'react';
import { getDisplayName, saveDisplayName, clearAnswers, clearDisplayName } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPage() {
  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const name = getDisplayName() || '';
    setDisplayName(name);
    setOriginalName(name);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    saveDisplayName(displayName.trim());
    setOriginalName(displayName.trim());
    setMessage('Display name saved successfully!');
    
    setTimeout(() => {
      setMessage('');
      setSaving(false);
    }, 2000);
  };

  const handleClearData = () => {
    clearAnswers();
    clearDisplayName();
    setShowDeleteConfirm(false);
    router.push('/');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <Link 
          href="/"
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Display Name */}
        <form onSubmit={handleSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
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
              This name will be used in your results
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || displayName.trim() === originalName}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {message && (
          <div className="text-sm p-3 rounded-md bg-green-50 text-green-700">
            {message}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-red-200">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Clear All Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          This will clear your display name and all test answers. You'll need to start over.
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
        >
          Clear All Data
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
            <h3 className="text-xl font-bold text-gray-900 mb-3">Clear All Data?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              This will delete your display name and all your test results. You'll be redirected to the home page.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl text-gray-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearData}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl text-white font-bold transition-colors shadow-lg"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
