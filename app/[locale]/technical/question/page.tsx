'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import RadarChart from '@/components/RadarChart';
import { ResultsButtons } from '@/components/ResultsButtons';
import {
  downloadElementAsImage,
  nativeShareElement,
  copyShareLink,
  shareToX,
  shareToFacebook,
} from '@/components/ShareUtil';
import { MODULES, SKILLS, GLOSSARY } from '@/lib/technical/data';
import { Module } from '@/types';
import {
  flattenQuestions,
  computeScoresFromAnswers,
  benchmarkLabel,
} from '@/lib/technical/logic';
import {
  getLessonProgress,
  saveLessonProgress,
  getCompletedModules,
  areAllModulesComplete,
  getFirstUnfinishedModuleId,
} from '@/lib/technical/lessons';

function renderTextWithTooltips(
  text: string,
  onTermClick: (term: string) => void
) {
  const parts = text.split(/(\[\[[^[\]]+\]\])/g);

  return parts.map((part, idx) => {
    const match = part.match(/^\[\[([^[\]]+)\]\]$/);
    if (match) {
      const term = match[1];
      return (
        <button
          key={`${term}-${idx}`}
          type="button"
          onClick={() => onTermClick(term)}
          className="underline decoration-dotted underline-offset-4 font-medium"
          style={{ color: 'var(--color-primary)' }}
        >
          {term}
        </button>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function TechnicalQuestionPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('technicalQuestion');
  const tAnalysis = useTranslations('analysis');
  const radarShareRef = useRef<HTMLDivElement | null>(null);

  const localizedModules = useMemo(() => {
    try {
      const rawModules = t.raw('modules');
      // Use translated modules only when the full module set is present.
      return Array.isArray(rawModules) && rawModules.length >= MODULES.length
        ? (rawModules as Module[])
        : MODULES;
    } catch {
      return MODULES;
    }
  }, [t]);

  const localizedSkills = useMemo(() => {
    try {
      const rawSkills = t.raw('skills');
      return Array.isArray(rawSkills) && rawSkills.length > 0
        ? (rawSkills as typeof SKILLS)
        : SKILLS;
    } catch {
      return SKILLS;
    }
  }, [t]);

  const localizedGlossary = useMemo(() => {
    try {
      const rawGlossary = t.raw('glossary');
      if (rawGlossary && typeof rawGlossary === 'object') {
        return rawGlossary as Record<string, string>;
      }
      return GLOSSARY;
    } catch {
      return GLOSSARY;
    }
  }, [t]);

  const allQuestions = useMemo(() => flattenQuestions(localizedModules), [localizedModules]);
  const totalQuestions = allQuestions.length;

  const [user, setUser] = useState<any>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [glossaryTerm, setGlossaryTerm] = useState<string | null>(null);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [loadedAsFinished, setLoadedAsFinished] = useState(false);

  const toRevealed = (input: Record<string, string>) =>
    Object.keys(input).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/${locale}/login`);
        return;
      }
      setUser(user);

      try {
        const progress = await getLessonProgress(locale);
        if (progress) {
          setAnswers(progress.answers ?? {});
          setRevealed(toRevealed(progress.answers ?? {}));

          if (progress.is_finished) {
            setLoadedAsFinished(true);
            setActiveModuleId('results');
          } else {
            setLoadedAsFinished(false);
            const nextModuleId = getFirstUnfinishedModuleId(localizedModules, progress.answers ?? {});
            if (nextModuleId) {
              setActiveModuleId(nextModuleId);
            } else {
              setActiveModuleId(localizedModules[0]?.id ?? MODULES[0].id);
            }
          }
        } else {
          setActiveModuleId(localizedModules[0]?.id ?? MODULES[0].id);
        }
      } finally {
        setHasLoadedProgress(true);
      }
    };

    checkUser();
  }, [locale, router, supabase, localizedModules]);

  const scores = useMemo(() => computeScoresFromAnswers(answers, localizedModules), [answers, localizedModules]);

  useEffect(() => {
    if (!user || !hasLoadedProgress) return;

    const timer = setTimeout(async () => {
      try {
        const modulesCompleted = getCompletedModules(localizedModules, answers);
        const isFinished = areAllModulesComplete(localizedModules, answers);

        await saveLessonProgress(locale, {
          answers,
          scores,
          modulesCompleted,
          isFinished,
        });
      } catch (error) {
        console.error('Failed to auto-save lesson progress:', error);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [answers, hasLoadedProgress, locale, localizedModules, scores, user]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // use 'auto' if you want no animation
    });
  }, [activeModuleId]);

  const answeredQuestions = Object.keys(revealed).length;
  const allAnswered = answeredQuestions === totalQuestions;

  const activeModule = localizedModules.find(m => m.id === activeModuleId) ?? localizedModules[0];

  const currentModuleIndex = localizedModules.findIndex(
    m => m.id === activeModuleId
  );

  const nextModule = localizedModules[currentModuleIndex + 1];

  const goToNextModule = () => {
    if (nextModule) {
      setActiveModuleId(nextModule.id);
    }
  };

  if (!hasLoadedProgress || !activeModuleId) {
    return (
      <div className="technical-question-page min-h-screen p-6 py-8">
        <div className="technical-question-shell max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
          <p style={{ color: 'var(--color-text-muted)' }}>{t('ui.loadingProgress')}</p>
        </div>
      </div>
    );
  }

  const moduleStats = (module: Module) => {
    const questions = module.lessonBlocks.flatMap(b => b.questions);
    const revealedCount = questions.filter(q => revealed[q.id]).length;
    return {
      revealedCount,
      total: questions.length,
      complete: revealedCount === questions.length
    };
  };

  const setAnswer = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
    setRevealed(prev => ({ ...prev, [questionId]: true }));
  };

  const getShareMeta = () => ({
    filename: `financial-literacy-radar-${Date.now()}.png`,
    shareTitle: t('ui.radarTitle'),
    shareText: t('ui.shareText'),
    shareUrl: typeof window !== 'undefined' ? window.location.href : '',
  });

    const handleResetProgress = async () => {
      setAnswers({});
      setRevealed({});
      setLoadedAsFinished(false);
      setActiveModuleId(localizedModules[0]?.id ?? MODULES[0].id);

      if (user) {
        const clearedScores = computeScoresFromAnswers({}, localizedModules);
        await saveLessonProgress(locale, {
          answers: {},
          scores: clearedScores,
          modulesCompleted: [],
          isFinished: false,
        });
      }
    };
  const handleShare = async () => {
    if (!radarShareRef.current) return;

    const meta = getShareMeta();
    await nativeShareElement(radarShareRef.current, {
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const handleDownload = async () => {
    if (!radarShareRef.current) return;

    const meta = getShareMeta();
    await downloadElementAsImage(radarShareRef.current, meta.filename);
  };

  const handleShareLink = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    await copyShareLink(shareUrl);
  };

  const handleShareX = () => {
    const meta = getShareMeta();
    shareToX({
      gradientColors: ['#2563eb', '#1e40af'],
      circleColor1: 'rgba(255, 255, 255, 0.05)',
      circleColor2: 'rgba(255, 255, 255, 0.08)',
      mascot: '📊',
      title: t('ui.radarTitle'),
      subtitle: t('ui.newGradEdition'),
      brandText: t('ui.shareBrandText'),
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const handleShareFacebook = () => {
    const meta = getShareMeta();
    shareToFacebook({
      gradientColors: ['#2563eb', '#1e40af'],
      circleColor1: 'rgba(255, 255, 255, 0.05)',
      circleColor2: 'rgba(255, 255, 255, 0.08)',
      mascot: '📊',
      title: t('ui.radarTitle'),
      subtitle: t('ui.newGradEdition'),
      brandText: t('ui.shareBrandText'),
      filename: meta.filename,
      shareTitle: meta.shareTitle,
      shareText: meta.shareText,
      shareUrl: meta.shareUrl,
    });
  };

  const tocItems = [
    ...localizedModules.map(m => ({
      id: m.id,
      title: m.title,
      unlocked: true
    })),
    {
      id: 'results',
      title: t('ui.resultsTitle'),
      unlocked: allAnswered
    }
  ];

  return (
    <div className="technical-question-page min-h-screen p-6 py-8">
      <div className="technical-question-shell max-w-7xl mx-auto p-6 md:p-8 lg:p-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
            {t('ui.courseTitle')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            {t('ui.courseDescription')}
          </p>
          <p className="text-sm mt-3" style={{ color: 'var(--color-text-muted)' }}>
            {t('ui.usDisclaimer')}
          </p>
        </div>

        <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-8 items-start">
          <aside
            className="technical-question-sidecard rounded-2xl shadow-lg p-5 lg:sticky lg:top-6"
            style={{
              backgroundColor: 'var(--technical-side-bg, var(--color-surface))',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              {t('ui.courseModules')}
            </h2>

            <div className="space-y-2">
              {tocItems.map(item => {
                const isActive = activeModuleId === item.id;
                const module = localizedModules.find(m => m.id === item.id);
                const completion = module ? moduleStats(module) : null;

                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.unlocked}
                    onClick={() => item.unlocked && setActiveModuleId(item.id)}
                    className="w-full text-left px-4 py-3 rounded-xl border transition"
                    style={{
                      backgroundColor: isActive ? 'var(--color-background)' : 'transparent',
                      borderColor: isActive ? 'var(--color-primary)' : 'var(--color-neutral-300)',
                      color: item.unlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
                      opacity: item.unlocked ? 1 : 0.55,
                      cursor: item.unlocked ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <div className="font-semibold">{item.title}</div>
                    {module && (
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {t('ui.questionsCompleted', { completed: completion?.revealedCount ?? 0, total: completion?.total ?? 0 })}
                      </div>
                    )}
                    {item.id === 'results' && !item.unlocked && (
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {t('ui.finishToUnlock')}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              className="mt-6 p-4 rounded-xl"
              style={{ backgroundColor: 'var(--color-background)' }}
            >
              <div className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {t('ui.overallProgress')}
              </div>
              <div className="w-full h-2 rounded-lg mb-2" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                <div
                  className="h-2 rounded-lg"
                  style={{
                    width: `${Math.round((answeredQuestions / totalQuestions) * 100)}%`,
                    backgroundColor: 'var(--color-primary)'
                  }}
                />
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('ui.questionsCompleted', { completed: answeredQuestions, total: totalQuestions })}
              </div>
            </div>
          </aside>

          <main
            className="technical-question-maincard rounded-2xl shadow-lg p-8 min-h-[700px]"
            style={{
              backgroundColor: 'var(--technical-main-bg, var(--color-surface))',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            {activeModuleId !== 'results' ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {activeModule.title}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {activeModule.shortDescription}
                  </p>
                </div>

                <section className="space-y-10">
                  {activeModule.lessonBlocks.map((block, blockIndex) => (
                    <div key={block.id} className="space-y-5">
                      <div>
                        <h3 className="text-2xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                          {block.heading}
                        </h3>

                        <div className="space-y-3">
                          {block.paragraphs.map((paragraph, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-xl leading-7"
                              style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
                            >
                              {renderTextWithTooltips(paragraph, setGlossaryTerm)}
                            </div>
                          ))}
                        </div>

                        {block.bullets && (
                          <div
                            className="mt-4 p-4 rounded-xl"
                            style={{ backgroundColor: 'var(--color-background)' }}
                          >
                            <div className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                              {t('ui.keyIdeas')}
                            </div>
                            <ul className="space-y-2 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                              {block.bullets.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="space-y-5">
                        <h4 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                          {t('ui.quickCheck')}
                        </h4>

                        {block.questions.map((q, idx) => {
                          const chosen = answers[q.id];
                          const isRevealed = !!revealed[q.id];

                          return (
                            <div
                              key={q.id}
                              className="p-5 rounded-xl border"
                              style={{
                                borderColor: 'var(--color-neutral-300)',
                                backgroundColor: 'var(--color-background)'
                              }}
                            >
                              <div className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                {block.heading} · {t('ui.questionLabel', { number: idx + 1 })}
                              </div>

                              {q.context && (
                                <div
                                  className="mb-3 p-3 rounded-lg"
                                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
                                >
                                  {q.context}
                                </div>
                              )}

                              <div className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                                {q.prompt}
                              </div>

                              <div className="grid gap-3">
                                {q.choices.map(choice => {
                                  const selected = chosen === choice.id;
                                  const correct = choice.id === q.correctChoiceId;

                                  let borderColor = 'var(--color-neutral-300)';
                                  let bgColor = 'transparent';
                                  let textColor = 'var(--color-text)';

                                  if (!isRevealed) {
                                    if (selected) {
                                      borderColor = 'var(--color-primary)';
                                      bgColor = 'var(--color-surface)';
                                    }
                                  } else {
                                    if (correct) {
                                      borderColor = '#22c55e';
                                      bgColor = '#dcfce7';
                                      textColor = '#166534';
                                    } else if (selected && !correct) {
                                      borderColor = '#ef4444';
                                      bgColor = '#fee2e2';
                                      textColor = '#7f1d1d';
                                    }
                                  }

                                  return (
                                    <button
                                      key={choice.id}
                                      type="button"
                                      disabled={isRevealed}
                                      onClick={() => setAnswer(q.id, choice.id)}
                                      className="w-full text-left p-4 rounded-xl border transition"
                                      style={{
                                        borderColor,
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        cursor: isRevealed ? 'default' : 'pointer'
                                      }}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold"
                                          style={{
                                            backgroundColor: !isRevealed
                                              ? (selected ? 'var(--color-primary)' : 'var(--color-neutral-200)')
                                              : correct
                                                ? '#22c55e'
                                                : selected && !correct
                                                  ? '#ef4444'
                                                  : 'var(--color-neutral-200)',
                                            color: !isRevealed
                                              ? (selected ? 'white' : 'var(--color-text)')
                                              : (correct || (selected && !correct) ? 'white' : 'var(--color-text)'),
                                            flexShrink: 0
                                          }}
                                        >
                                          {choice.id}
                                        </div>
                                        <div>{choice.text}</div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {isRevealed && (
                                <div
                                  className="mt-4 p-4 rounded-xl border"
                                  style={{
                                    borderColor: answers[q.id] === q.correctChoiceId ? '#22c55e' : '#ef4444',
                                    backgroundColor: answers[q.id] === q.correctChoiceId ? '#f0fdf4' : '#fef2f2'
                                  }}
                                >
                                  <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                                    {answers[q.id] === q.correctChoiceId ? t('ui.correct') : t('ui.notQuite')}
                                  </div>
                                  <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('ui.correctAnswer')} <span className="font-semibold">{q.correctChoiceId}</span>
                                  </div>
                                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {q.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {blockIndex < activeModule.lessonBlocks.length - 1 && (
                        <div className="border-t pt-2" style={{ borderColor: 'var(--color-neutral-200)' }} />
                      )}
                    </div>
                  ))}

                  {/* Takeaway */}
                  <section
                    className="p-5 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                      {t('ui.briefTakeaways')}
                    </h3>
                    <ul className="space-y-2 pl-5 list-disc" style={{ color: 'var(--color-text-secondary)' }}>
                      {activeModule.takeaway.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </section>

                <div className="mt-10 flex justify-between items-center">
                  <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {t('ui.completeEveryModule')}
                  </div>

                  <div className="flex gap-3">
                    {nextModule && (
                      <button
                        type="button"
                        onClick={goToNextModule}
                        className="px-5 py-3 rounded-xl font-semibold border"
                        style={{
                          borderColor: 'var(--color-neutral-300)',
                          color: 'var(--color-text)'
                        }}
                      >
                        Next
                      </button>
                    )}

                    {allAnswered && (
                      <button
                        type="button"
                        onClick={() => setActiveModuleId('results')}
                        className="px-5 py-3 rounded-xl font-semibold"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white'
                        }}
                      >
                        {t('ui.viewResults')}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                    {t('ui.resultsTitle')}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {t('ui.resultsDescription')}
                  </p>
                </div>

                <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-8 items-start">
                  <div
                    className="p-6 rounded-xl"
                    style={{ backgroundColor: 'var(--color-background)' }}
                  >
                    <div className="flex justify-center">
                      <div
                        ref={radarShareRef}
                        className="inline-block"
                        style={{
                          backgroundColor: '#ffffff',
                          padding: '24px',
                          borderRadius: '20px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                        }}
                      >
                        <div
                          className="mb-4 text-center"
                          style={{ color: '#111827' }}
                        >
                          <div className="text-2xl font-bold">{t('ui.radarTitle')}</div>
                          <div className="text-sm" style={{ color: '#6b7280' }}>
                            {t('ui.newGradEdition')}
                          </div>
                        </div>

                        <RadarChart scores={scores} categories={localizedSkills} />

                        <div
                          className="mt-4 text-center text-sm"
                          style={{ color: '#6b7280' }}
                        >
                          {t('ui.averageScore')}{' '}
                          <span className="font-semibold" style={{ color: '#111827' }}>
                            {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <ResultsButtons
                        locale={locale}
                        onShare={handleShare}
                        onDownload={handleDownload}
                        onShareLink={handleShareLink}
                        onShareX={handleShareX}
                        onShareFacebook={handleShareFacebook}
                        t={tAnalysis}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      className="p-5 rounded-xl"
                      style={{ backgroundColor: 'var(--color-background)' }}
                    >
                      <div className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                        {t('ui.averageScore')}
                      </div>
                      <div className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
                        {Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 6)}
                      </div>
                    </div>

                    {localizedSkills.map(skill => {
                      const benchmark = benchmarkLabel(scores[skill.key]);
                      return (
                        <div
                          key={skill.key}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: 'var(--color-background)' }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                                {skill.label}
                              </div>
                              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                {skill.description}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                {scores[skill.key]}
                              </div>
                              <div className="text-xs font-semibold" style={{ color: benchmark.tone }}>
                                {t(`ui.benchmark.${benchmark.key}`)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 w-full h-2 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-200)' }}>
                            <div
                              className="h-2 rounded-lg"
                              style={{
                                width: `${scores[skill.key]}%`,
                                backgroundColor: 'var(--color-primary)'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleResetProgress}
                      className="w-full px-5 py-3 rounded-xl font-semibold border"
                      style={{
                        borderColor: 'var(--color-neutral-300)',
                        color: 'var(--color-text)'
                      }}
                    >
                      {loadedAsFinished ? t('ui.startAgain') : t('ui.retakeCourse')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {glossaryTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={() => setGlossaryTerm(null)}
          />
          <div
            className="relative max-w-md w-full rounded-2xl shadow-2xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderWidth: '1px',
              borderColor: 'var(--color-neutral-200)'
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  {glossaryTerm}
                </h3>
                <p className="mt-3 leading-7" style={{ color: 'var(--color-text-secondary)' }}>
                  {localizedGlossary[glossaryTerm] ?? GLOSSARY[glossaryTerm] ?? t('ui.definitionNotFound')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGlossaryTerm(null)}
                className="px-3 py-1 rounded-lg border"
                style={{
                  borderColor: 'var(--color-neutral-300)',
                  color: 'var(--color-text)'
                }}
              >
                {t('ui.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}