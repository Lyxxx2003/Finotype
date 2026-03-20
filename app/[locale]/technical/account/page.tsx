'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import RadarChart from '@/components/RadarChart';
import { MODULES, SKILLS, type Scores } from '@/lib/technical/data';
import { getLessonProgress, type LessonProgress } from '@/lib/technical/lessons';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
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
  const tTech = useTranslations('technicalQuestion');
  const supabase = createClient();

  const localizedSkills = useMemo(() => {
    try {
      const rawSkills = tTech.raw('skills');
      return Array.isArray(rawSkills) && rawSkills.length > 0
        ? (rawSkills as typeof SKILLS)
        : SKILLS;
    } catch {
      return SKILLS;
    }
  }, [tTech]);

  useEffect(() => {
    const load = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

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

        const progress = await getLessonProgress(locale);
        if (progress) {
          setLessonProgress(progress);
        }
      } catch (error) {
        console.error('Error loading account:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [locale, router, supabase]);

  const totalModules = useMemo(() => MODULES.length, []);

  const completedModules = lessonProgress?.modules_completed?.length ?? 0;
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const learningCurve = useMemo(() => {
    const raw = lessonProgress?.learning_curve;
    if (!Array.isArray(raw)) return [] as number[];

    return raw
      .map((item) => {
        if (typeof item === 'number') return Math.round(item);
        if (item && typeof item === 'object' && 'totalScore' in item) {
          const score = (item as { totalScore?: unknown }).totalScore;
          return typeof score === 'number' ? Math.round(score) : null;
        }
        return null;
      })
      .filter((item): item is number => typeof item === 'number');
  }, [lessonProgress?.learning_curve]);
  const latestFinishedScores = (lessonProgress?.latest_finished_scores ?? null) as Scores | null;

  const curveSamples = useMemo(() => learningCurve.slice(-12), [learningCurve]);

  const chart = useMemo(() => {
    const width = 640;
    const height = 280;
    const padLeft = 40;
    const padRight = 16;
    const padTop = 16;
    const padBottom = 36;

    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const toX = (idx: number, total: number) => {
      if (total <= 1) return padLeft + plotWidth / 2;
      return padLeft + (idx / (total - 1)) * plotWidth;
    };

    const toY = (score: number) => padTop + (1 - Math.max(0, Math.min(100, score)) / 100) * plotHeight;

    const points = curveSamples.map((score, idx) => ({
      x: toX(idx, curveSamples.length),
      y: toY(score),
      score,
      trial: idx + 1,
    }));

    const path = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const yTicks = [0, 25, 50, 75, 100].map((v) => ({ value: v, y: toY(v) }));

    return { width, height, padLeft, padRight, padTop, padBottom, plotWidth, plotHeight, points, path, yTicks };
  }, [curveSamples]);

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
      const response = await fetch(`/${locale}/api/delete-account`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('deleteError'));
      }

      setMessageType('success');
      setMessage(t('deleteSuccess'));
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--gradient-surface)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold" style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {t('title')}
          </h1>
          <Link href={`/${locale}/technical/question`} className="btn-professional-outline text-sm">
            ← {t('backToGame')}
          </Link>
        </div>

        <div className="card-professional p-8 space-y-6">
          <div>
            <label className="label-professional">{t('email')}</label>
            <div className="display-box">{user?.email}</div>
          </div>

          <form onSubmit={handleSave}>
            <div>
              <label className="label-professional">{t('displayName')}</label>
              <input
                type="text"
                maxLength={50}
                className="input-professional"
                placeholder={t('displayNamePlaceholder')}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('displayNameNote')}
              </p>
            </div>

            <button type="submit" disabled={saving} className="mt-4 btn-professional-primary disabled:opacity-50">
              {saving ? t('saving') : t('save')}
            </button>
          </form>

          {message && (
            <div
              className={
                messageType === 'success'
                  ? 'alert-success'
                  : messageType === 'error'
                    ? 'alert-error'
                    : messageType === 'warning'
                      ? 'alert-warning'
                      : 'alert-info'
              }
            >
              {message}
            </div>
          )}
        </div>

        <div className="card-professional p-8 space-y-6 mt-8">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              {t('learningProgress')}
            </h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {t('overallProgress')}
                </span>
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {completedModules}/{totalModules}
                </span>
              </div>
              <div className="w-full h-3 rounded-full" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: 'var(--color-primary)',
                  }}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('progressStatus')}</div>
                <div className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                  {lessonProgress?.is_finished ? t('finished') : t('inProgress')}
                </div>
              </div>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t('totalScore')}</div>
                <div className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {lessonProgress?.total_score ?? 0}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {t('latestFinishedRadar')}
              </h3>
              <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                {latestFinishedScores ? (
                  <div className="max-w-[460px] mx-auto">
                    <RadarChart scores={latestFinishedScores} categories={localizedSkills} />
                  </div>
                ) : (
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {t('noResultsYet')}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {t('learningCurveTitle')}
              </h3>
              <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-background)' }}>
                {learningCurve.length === 0 ? (
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('noResultsYet')}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full overflow-x-auto">
                      <svg
                        viewBox={`0 0 ${chart.width} ${chart.height}`}
                        className="w-full min-w-[560px]"
                        role="img"
                        aria-label={t('learningCurveTitle')}
                      >
                        <rect x={0} y={0} width={chart.width} height={chart.height} fill="transparent" />

                        {chart.yTicks.map((tick) => (
                          <g key={tick.value}>
                            <line
                              x1={chart.padLeft}
                              y1={tick.y}
                              x2={chart.width - chart.padRight}
                              y2={tick.y}
                              stroke="var(--color-neutral-300)"
                              strokeWidth="1"
                            />
                            <text
                              x={chart.padLeft - 8}
                              y={tick.y + 4}
                              textAnchor="end"
                              fontSize="11"
                              fill="var(--color-text-muted)"
                            >
                              {tick.value}
                            </text>
                          </g>
                        ))}

                        <line
                          x1={chart.padLeft}
                          y1={chart.padTop + chart.plotHeight}
                          x2={chart.width - chart.padRight}
                          y2={chart.padTop + chart.plotHeight}
                          stroke="var(--color-text-muted)"
                          strokeWidth="1.5"
                        />

                        {chart.points.length > 1 && (
                          <path d={chart.path} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
                        )}

                        {chart.points.map((point) => (
                          <g key={point.trial}>
                            <circle cx={point.x} cy={point.y} r="4" fill="var(--color-primary)" />
                            <text
                              x={point.x}
                              y={chart.padTop + chart.plotHeight + 18}
                              textAnchor="middle"
                              fontSize="11"
                              fill="var(--color-text-muted)"
                            >
                              {point.trial}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>

                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {curveSamples.length > 0
                        ? t('averageScoreWithValue', { score: curveSamples[curveSamples.length - 1] })
                        : t('noResultsYet')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        <div className="card-danger mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-error)' }}>
            {t('dangerZone')}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {t('deleteWarning')}
          </p>
          <button onClick={() => setShowDeleteConfirm(true)} className="btn-professional-danger text-sm">
            {t('deleteAccount')}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(196,148,139,0.2) 0%, rgba(196,148,139,0.1) 100%)' }}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-terracotta)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-center" style={{ color: 'var(--color-text)' }}>
              {t('confirmDelete')}
            </h3>
            <p className="mb-8 leading-relaxed text-center" style={{ color: 'var(--color-text-secondary)' }}>
              {t('deleteWarning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="btn-professional-secondary flex-1 py-3 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="btn-professional-danger flex-1 py-3 disabled:opacity-50"
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
