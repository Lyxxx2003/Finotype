'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { generateJobs, generateLifeOptions } from '@/lib/gemini'
import {UserProfile, JobOption, LifeOption, SimulationResult } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { JobCard } from '@/components/game/JobCard';
import { OptionCard } from '@/components/game/OptionCard';
import { ErrorModal } from '@/components/game/ErrorModal';
import { AnalysisModal } from '@/components/game/AnalysisModal';
import { LoadingState } from '@/components/game/LoadingState';
import { ProfileForm } from '@/components/game/ProfileForm';
import { EditProfileConfirm } from '@/components/game/EditProfileConfirm';

const TOPICS = [
  { id: 'Housing', name: 'Housing' },
  { id: 'Credit Cards', name: 'Credit Cards' },
  { id: 'Investment', name: 'Investment' },
  { id: 'Loans', name: 'Loans' }
];

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('game');
  const tCommon = useTranslations('common');
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState<'loading' | 'profile' | 'jobs' | 'topics' | 'simulation' | 'result'>('loading');
  const [profile, setProfile] = useState<UserProfile>({ industry: '', familiarity: '', salary: '', paymentFreq: 'Monthly' });
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
  const [confirmedJob, setConfirmedJob] = useState<JobOption | null>(null); // Actual confirmed selection
  
  // Topic State
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [topicOptions, setTopicOptions] = useState<LifeOption[]>([]);
  const [topicDescription, setTopicDescription] = useState('');
  const [choices, setChoices] = useState<Record<string, LifeOption>>({});
  const [selectedTopicOption, setSelectedTopicOption] = useState<LifeOption | null>(null); // For immediate feedback
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'NONE' | 'GENERATION_ERROR'>('NONE');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingJobs, setPendingJobs] = useState<JobOption[] | null>(null);
  const [showModal, setShowModal] = useState<{title: string, content: string} | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showEditProfileConfirm, setShowEditProfileConfirm] = useState(false);

  const supabase = createClient();

  const generateJobsForProfile = async (currentProfile: UserProfile) => {
    setLoading(true);
    setJobs([]); // Clear old jobs immediately
    const { jobs: newJobs, error } = await generateJobs(currentProfile, isDemoMode, locale);
    
    if (error && newJobs) { 
        setPendingJobs(newJobs);
        setErrorType('GENERATION_ERROR');
        let msg = error;
        if (error === 'FALLBACK_USED') msg = t('networkError');
        if (error === 'REGION_BLOCKED') msg = t('regionBlocked');
        if (error === 'RATE_LIMIT_EXCEEDED') msg = t('rateLimitError');
        if (error === 'INVALID_API_KEY') msg = t('apiKeyError');
        if (error === 'SAFETY_FILTER') msg = t('safetyFilterError');
        setErrorMessage(msg);
        setLoading(false);
        return;
    }

    if (error && !newJobs) {
      setErrorMessage("Failed to generate jobs completely. Please try again.");
      setErrorType('GENERATION_ERROR');
      setLoading(false);
      return;
    }

    setJobs(newJobs || []);
    setStep('jobs');
    setLoading(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if user is not authenticated
        router.push(`/${locale}/login`);
        return;
      }
      
      setUser(user);
      
      let profileLoaded = false;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileData && profileData.industry && profileData.familiarity) {
         const loadedProfile = {
             industry: profileData.industry,
             familiarity: profileData.familiarity,
             salary: profileData.salary || '',
             paymentFreq: (profileData.payment_freq as any) || 'Monthly'
         };
         setProfile(loadedProfile);
         profileLoaded = true;
         // Auto-generate jobs
         generateJobsForProfile(loadedProfile);
      }
      
      if (!profileLoaded) {
        setStep('profile');
      }
    };
    checkUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear all previous game state
    setSelectedJob(null);
    setConfirmedJob(null);
    setChoices({});
    setSelectedTopicOption(null);
    setCurrentTopicIndex(0);
    setTopicOptions([]);
    setTopicDescription('');
    setResult(null);
    
    // Clear localStorage
    localStorage.removeItem('gameHistory');
    localStorage.removeItem('finalNetWorth');
    
    // Save to DB
    if (user) {
        await supabase.from('profiles').upsert({
            id: user.id,
            industry: profile.industry,
            familiarity: profile.familiarity,
            salary: profile.salary,
            payment_freq: profile.paymentFreq
        });
    }

    await generateJobsForProfile(profile);
  };

  const handleErrorChoices = (choice: 'retry' | 'demo' | 'qa') => {
      if (choice === 'retry') {
          setErrorType('NONE');
          setErrorMessage('');
          if (step === 'profile' || step === 'loading') {
              generateJobsForProfile(profile);
          } else if (step === 'topics') {
              loadTopic(currentTopicIndex, choices);
          } else if (step === 'simulation') {
              // This is handled in analysis page, but if it was here:
              // router.push('/pro/analysis?id=...'); 
          } else {
             // Fallback for jobs step error
             generateJobsForProfile(profile);
          }
      } else if (choice === 'qa') {
          router.push(`/${locale}/standard/question/1`);
      } else if (choice === 'demo') {
          setIsDemoMode(true);
          setErrorType('NONE');
          if (step === 'jobs' || ((step === 'profile' || step === 'loading') && pendingJobs)) {
              if (pendingJobs) setJobs(pendingJobs);
              setStep('jobs');
          }
          // If in topics, just closing error is enough as we loaded fallback options into state
      }
  };

  const handleJobSelect = async (job: JobOption) => {
    setSelectedJob(job);
    setShowAnalysisModal(true);
  };

  const confirmJobChoice = async () => {
    if (!selectedJob) return;
    setShowAnalysisModal(false);
    setConfirmedJob(selectedJob);
    setSelectedJob(null);
    
    // Jump to topics immediately with loading state
    setStep('topics');
    setCurrentTopicIndex(0);
    setTopicDescription('');
    setTopicOptions([]);
    setLoading(true);
    
    // Load first topic in background
    await loadTopic(0);
    setLoading(false);
  };

  const loadTopic = async (index: number, updatedChoices?: Record<string, LifeOption>) => {
    const topic = TOPICS[index];
    const jobForSalary = confirmedJob || selectedJob;
    const currentChoices = updatedChoices || choices;
    
    // Clear old data immediately
    setTopicOptions([]);
    setTopicDescription('');
    
    const { options, description, error } = await generateLifeOptions(
      topic.id, 
      { 
        salary: jobForSalary?.salary,
        job: confirmedJob,
        previousChoices: currentChoices
      }, 
      isDemoMode, 
      locale
    );
    
    if (error && options) {
        setTopicOptions(options);
        setTopicDescription(description);
        setCurrentTopicIndex(index);

        setErrorType('GENERATION_ERROR');
        let msg = error;
        if (error === 'FALLBACK_USED') msg = t('networkError');
        if (error === 'REGION_BLOCKED') msg = t('regionBlocked');
        if (error === 'RATE_LIMIT_EXCEEDED') msg = t('rateLimitError');
        if (error === 'INVALID_API_KEY') msg = t('apiKeyError');
        if (error === 'SAFETY_FILTER') msg = t('safetyFilterError');
        setErrorMessage(msg || error);
        return;
    }

    if (error && !options) {
        setErrorMessage("Failed to load options.");
        setErrorType('GENERATION_ERROR');
        return;
    }
    setTopicOptions(options || []);
    setTopicDescription(description || '');
    setCurrentTopicIndex(index);
  };

  const handleTopicChoice = async (option: LifeOption) => {
      setSelectedTopicOption(option);
      setShowAnalysisModal(true);
  };

  const confirmTopicChoice = async () => {
    if (!selectedTopicOption) return;
    setShowAnalysisModal(false);
    
    const option = selectedTopicOption;
    const topic = TOPICS[currentTopicIndex];
    const newChoices = { ...choices, [topic.id]: option };
    setChoices(newChoices);
    setSelectedTopicOption(null);

    if (currentTopicIndex < TOPICS.length - 1) {
        // Jump to next topic immediately
        const nextIndex = currentTopicIndex + 1;
        setCurrentTopicIndex(nextIndex);
        setTopicDescription('');
        setTopicOptions([]);
        setLoading(true);
        
        // Load in background with updated choices
        await loadTopic(nextIndex, newChoices);
        setLoading(false);
    } else {
        // All topics done - save and go to results
        setStep('simulation');
        
        if (user) {
            const { data, error: dbError } = await supabase.from('simulations').insert({
                user_id: user.id,
                final_balance: 0,
                game_history: {
                    profile,
                    job: confirmedJob,
                    choices: newChoices,
                    isDemo: isDemoMode
                },
                gemini_analysis: null
            }).select();
            
            if (data && data[0]) {
                router.push(`/${locale}/pro/results?id=${data[0].id}${isDemoMode ? '&demo=true' : ''}`);
                return;
            }
        }
        
        localStorage.setItem('gameHistory', JSON.stringify({
            profile,
            job: confirmedJob,
            choices: newChoices,
            isDemo: isDemoMode
        }));
        router.push(`/${locale}/pro/results${isDemoMode ? '?demo=true' : ''}`);
    }
  };

  if (step === 'loading' && errorType === 'NONE') {
    return (
      <div className="min-h-screen bg-gradient-morandi flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
            <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
            <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
              {t('loading')}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-morandi text-gray-900 p-6 md:p-12 font-sans flex justify-center">
        <div className="max-w-4xl w-full">
            <header className="mb-8 text-center md:text-left flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2">{t('title')}</h1>
                    {isDemoMode && step !== 'result' && <span className="text-xs font-bold px-2 py-1 rounded-full border" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>{t('demoMode')}</span>}
                    {step !== 'result' && <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{t('subtitle')}</p>}
                </div>
            </header>
            
            {errorType === 'GENERATION_ERROR' && (
                <ErrorModal
                    errorMessage={errorMessage}
                    onRetry={() => handleErrorChoices('retry')}
                    onDemo={() => handleErrorChoices('demo')}
                    onQA={() => handleErrorChoices('qa')}
                    t={t}
                />
            )}

            {/* Profile Step */}
            {step === 'profile' && (
                <ProfileForm
                    profile={profile}
                    setProfile={setProfile}
                    onSubmit={handleProfileSubmit}
                    loading={loading}
                    hasExistingJobs={jobs.length > 0}
                    onEditProfile={() => setStep('jobs')}
                    t={t}
                />
            )}

            {/* Jobs Step */}
            {step === 'jobs' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-neutral-900">{t('selectJob')}</h2>
                        <button 
                            onClick={() => setShowEditProfileConfirm(true)}
                            className="text-sm text-primary hover:text-primary font-medium cursor-pointer"
                        >
                            {t('editProfile')}
                        </button>
                    </div>
                    {loading ? (
                        <div className="py-32 text-center flex flex-col items-center">
                            <div className="mb-8 relative">
                                <div className="h-20 w-20 rounded-full animate-spin border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                    💼
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                {t('selectJob')}
                            </h3>
                            <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                Your career path shapes your financial journey...
                            </p>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
                                <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
                                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                                    Searching for the perfect opportunities...
                                </span>
                            </div>
                        </div>
                    ) : jobs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {jobs.map(job => (
                                <JobCard
                                    key={job.id} 
                                    job={job}
                                    onSelect={handleJobSelect} 
                                    selected={selectedJob?.id === job.id}
                                    disabled={selectedJob !== null && selectedJob.id !== job.id}
                                    t={t}
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Topics Step */}
            {step === 'topics' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-neutral-900">{TOPICS[currentTopicIndex].name}</h2>
                            <button 
                                onClick={() => setShowEditProfileConfirm(true)}
                                className="text-xs px-3 py-1 rounded-full border transition cursor-pointer"
                                style={{ 
                                  background: 'var(--color-neutral-100)',
                                  color: 'var(--color-text-secondary)',
                                  borderColor: 'var(--color-neutral-200)'
                                }}
                            >
                                {t('editProfile')}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: 'var(--color-neutral-200)' }}>
                                 <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentTopicIndex + 1) / TOPICS.length) * 100}%` }}></div>
                             </div>
                             <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{currentTopicIndex + 1} / {TOPICS.length}</span>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="py-32 text-center flex flex-col items-center">
                            <div className="mb-8 relative">
                                <div className="h-20 w-20 rounded-full animate-spin border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)' }}></div>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                    {currentTopicIndex === 0 ? '🏠' : currentTopicIndex === 1 ? '💳' : currentTopicIndex === 2 ? '📈' : '💰'}
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
                                {TOPICS[currentTopicIndex].name}
                            </h3>
                            <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                {currentTopicIndex === 0 ? t('housingLoadingDesc') : 
                                 currentTopicIndex === 1 ? t('creditLoadingDesc') :
                                 currentTopicIndex === 2 ? t('investmentLoadingDesc') :
                                 t('loansLoadingDesc')}
                            </p>
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
                                <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
                                <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                                    {currentTopicIndex === 0 ? t('housingLoadingStatus') : 
                                     currentTopicIndex === 1 ? t('creditLoadingStatus') :
                                     currentTopicIndex === 2 ? t('investmentLoadingStatus') :
                                     t('loansLoadingStatus')}
                                </span>
                            </div>
                        </div>
                    ) : topicDescription ? (
                        <>
                            <p className="p-6 rounded-2xl border leading-relaxed mb-6" style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'var(--color-accent)', color: 'var(--color-neutral-700)', boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
                                {topicDescription}
                            </p>
                        </>
                    ) : null}
                    
                    {!loading && topicOptions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topicOptions.map(option => (
                                <OptionCard 
                                    key={option.id} 
                                    option={option} 
                                    onSelect={handleTopicChoice}
                                    selected={selectedTopicOption?.id === option.id}
                                    disabled={selectedTopicOption !== null && selectedTopicOption.id !== option.id}
                                    t={t}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Simulation loading */}
            {step === 'simulation' && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 card-morandi rounded-3xl p-12">
                    <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                    <div className="text-center space-y-2">
                        <p className="text-2xl font-bold text-neutral-900">{t('simulatingYear')}</p>
                        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>{t('simulatingYearSubtext')}</p>
                    </div>
                </div>
            )}

            {/* Result Step */}
            {step === 'result' && result && (
                <div className="card-morandi rounded-3xl overflow-hidden">
                    <div className="bg-gradient-morandi-blue p-12 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4">{t('oneYearLater')}</h2>
                            <p className="text-blue-100 text-lg">{t('yourFinancialPersona')}</p>
                            <div className="text-3xl font-bold mt-2 bg-white/20 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
                                {result.finotype}
                            </div>
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                    </div>
                    
                    <div className="p-8 md:p-12 space-y-12">
                        <div className="grid grid-cols-2 gap-8 text-center">
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">{t('finalBalance')}</p>
                                <p className="text-3xl md:text-4xl font-bold text-gray-900">${result.finalBalance.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">{t('netWorth')}</p>
                                <p className="text-3xl md:text-4xl font-bold text-blue-600">${result.netWorth.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <span>📅</span> {t('yearInReview')}
                            </h3>
                            <p className="text-blue-800 leading-relaxed text-lg">{result.narrative}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>💡</span> {t('professionalTips')}
                            </h3>
                            <div className="space-y-4">
                                {result.tips.map((tip, i) => (
                                    <div key={i} className="flex items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="bg-green-100 text-green-700 h-6 w-6 rounded-full flex items-center justify-center mr-4 flex-shrink-0 text-xs font-bold">✓</div>
                                        <span className="text-gray-700">{tip}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t" style={{ borderColor: 'var(--color-neutral-200)' }}>
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn-morandi-secondary px-8 py-3"
                            >
                                {t('playAgain')}
                            </button>
                            <button 
                                onClick={() => router.push(`/${locale}/pro/analysis`)}
                                className="btn-morandi-primary px-8 py-3"
                            >
                                {t('viewAnalysis')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ background: 'rgba(42,38,34,0.4)' }} onClick={() => setShowModal(null)}>
                    <div className="card-morandi p-8 max-w-md w-full" style={{ boxShadow: '0 20px 40px rgba(42,38,34,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-neutral-900 mb-3">{showModal.title}</h3>
                        <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{showModal.content}</p>
                        <button 
                            onClick={() => setShowModal(null)}
                            className="btn-morandi-primary w-full"
                        >
                            {t('gotIt')}
                        </button>
                    </div>
                </div>
            )}
        </div>
        {/* Edit Profile Confirmation Popup */}
        {showEditProfileConfirm && (
          <EditProfileConfirm
            onConfirm={() => {
              setShowEditProfileConfirm(false);
              setSelectedJob(null);
              setConfirmedJob(null);
              setSelectedTopicOption(null);
              setCurrentTopicIndex(0);
              setTopicOptions([]);
              setTopicDescription('');
              setChoices({});
              setStep('profile');
            }}
            onCancel={() => setShowEditProfileConfirm(false)}
            t={t}
          />
        )}
        
        {/* Analysis Modal */}
        {showAnalysisModal && (selectedJob || selectedTopicOption) && (
          <AnalysisModal
            selectedJob={selectedJob}
            selectedTopicOption={selectedTopicOption}
            onConfirm={() => {
              if (selectedJob) {
                confirmJobChoice();
              } else if (selectedTopicOption) {
                confirmTopicChoice();
              }
            }}
            onCancel={() => {
              setShowAnalysisModal(false);
              setSelectedJob(null);
              setSelectedTopicOption(null);
            }}
            t={t}
          />
        )}
    </div>
  );
}
