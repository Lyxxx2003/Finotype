'use client';

import { UserProfile } from '@/types';

interface ProfileFormProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  hasExistingJobs: boolean;
  onEditProfile: () => void;
  t: any;
}

export function ProfileForm({ profile, setProfile, onSubmit, loading, hasExistingJobs, onEditProfile, t }: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="card-professional p-8 space-y-6">
      <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b pb-2" style={{ borderColor: 'var(--color-neutral-200)' }}>{t('setupProfile')}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2 text-neutral-900">{t('industry')}</label>
          <input 
            required
            type="text" 
            value={profile.industry}
            onChange={e => setProfile({...profile, industry: e.target.value})}
            className="w-full border-2 p-3 rounded-xl outline-none transition"
            style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
            placeholder={t('industryPlaceholder')}
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-neutral-900">{t('familiarity')}</label>
          <select
            required
            value={profile.familiarity}
            onChange={e => setProfile({...profile, familiarity: e.target.value})}
            className="w-full border-2 p-3 rounded-xl outline-none transition"
            style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
          >
            <option value="">{t('selectFamiliarity')}</option>
            <option value="Beginner">{t('beginnerLevel')}</option>
            <option value="Intermediate">{t('intermediateLevel')}</option>
            <option value="Advanced">{t('advancedLevel')}</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2 text-neutral-900">{t('salary')}</label>
            <input 
              type="number" 
              value={profile.salary}
              onChange={e => setProfile({...profile, salary: e.target.value})}
              className="w-full border-2 p-3 rounded-xl outline-none transition"
              style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
              placeholder={t('salaryPlaceholder')}
            />
          </div>
          <div>
            <label className="block font-medium mb-2 text-neutral-900">{t('paymentFreq')}</label>
            <select
              value={profile.paymentFreq}
              onChange={e => setProfile({...profile, paymentFreq: e.target.value as any})}
              className="w-full border-2 p-3 rounded-xl outline-none transition"
              style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
            >
              <option value="Monthly">{t('monthly')}</option>
              <option value="Biweekly">{t('biweekly')}</option>
              <option value="Weekly">{t('weekly')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        {hasExistingJobs && (
          <button 
            type="button"
            onClick={onEditProfile}
            className="flex-1 py-3 px-4 border-2 rounded-xl font-medium transition"
            style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text-secondary)' }}
          >
            {t('cancel')}
          </button>
        )}
        <button 
          disabled={loading}
          type="submit" 
          className="btn-professional-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('generating') : (hasExistingJobs ? t('regenerateJobs') : t('generateJobs'))}
        </button>
      </div>
    </form>
  );
}
