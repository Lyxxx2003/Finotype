'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { generateJobs, generateLifeOptions, UserProfile, JobOption, LifeOption, SimulationResult } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const TOPICS = [
  { id: 'Housing', name: 'Housing' },
  { id: 'Credit Cards', name: 'Credit Cards' },
  { id: 'Investment', name: 'Investment' },
  { id: 'Loans', name: 'Loans' }
];

function JobCard({ job, onSelect, selected, disabled, t }: { job: JobOption, onSelect: (j: JobOption) => void, selected: boolean, disabled?: boolean, t: any }) {
    const [showModal, setShowModal] = useState<{title: string, content: string} | null>(null);

    const handleModal = (e: React.MouseEvent, title: string, content: string) => {
        e.stopPropagation();
        setShowModal({title, content});
    };

    return (
        <>
            <div 
                className={`h-96 w-full group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                onClick={() => {
                    if (!disabled && !selected) onSelect(job);
                }}
            >
                <div className="card-morandi h-full">
                     <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">{job.title}</h3>
                     <div className="text-2xl text-primary font-bold mb-4">{job.salaryLabel}</div>
                     <div className="space-y-3 text-sm flex-grow" style={{ color: 'var(--color-text-secondary)' }}>
                             <p className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--color-neutral-100)' }}>
                                 <span className="font-medium">{t('location')}</span> 
                                 <span>{job.location}</span>
                             </p>
                             <p 
                                 className="flex justify-between items-center border-b pb-2 cursor-help hover:bg-opacity-50 p-1 -mx-1 rounded transition-colors"
                                 style={{ borderColor: 'var(--color-neutral-100)' }}
                                 onClick={(e) => handleModal(e, t('compensation'), t('compensationTooltip'))}
                             >
                                 <span className="font-medium underline decoration-dotted" style={{ color: 'var(--color-accent)' }}>{t('compensation')}</span>
                                 <span className="text-right truncate max-w-[50%]">{job.bonus}</span>
                             </p>
                             <p 
                                 className="flex justify-between items-center cursor-help hover:bg-opacity-50 p-1 -mx-1 rounded transition-colors"
                                 onClick={(e) => handleModal(e, t('health'), t('healthTooltip'))}
                             >
                                 <span className="font-medium underline decoration-dotted" style={{ color: 'var(--color-accent)' }}>{t('health')}</span>
                                 <span className="text-right truncate max-w-[50%]">{job.healthInsurance}</span>
                             </p>
                         </div>
                         <div className="mt-4 text-center text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-primary-light)' }}>
                             {t('tapToSelect')}
                         </div>
                    </div>
            </div>
            
            {showModal && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn"
                    style={{ background: 'rgba(42,38,34,0.4)' }}
                    onClick={(e) => {
                         e.stopPropagation();
                         setShowModal(null);
                    }}
                 >
                    <div className="card-morandi p-8 max-w-md w-full" style={{ boxShadow: '0 20px 40px rgba(42,38,34,0.2)' }} onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-neutral-900 mb-3">{showModal.title}</h3>
                        <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{showModal.content}</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModal(null);
                            }}
                            className="btn-morandi-primary w-full"
                        >
                            {t('gotIt')}
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

function OptionCard({ option, onSelect, selected, disabled, t }: { option: LifeOption, onSelect: (o: LifeOption) => void, selected: boolean, disabled?: boolean, t: any }) {
    return (
        <div 
            className={`h-80 w-full group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            onClick={() => {
                if (!disabled && !selected) {
                    onSelect(option);
                }
            }}
        >
            <div className="option-card">
                <div className="flex justify-between items-start mb-3 w-full">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{option.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${option.type === 'monthly' ? 'tag-monthly' : 'tag-onetime'}`}>
                        {option.type === 'monthly' ? t('monthlyTag') : t('oneTimeTag')}
                    </span>
                </div>
                <p className="text-gray-500 text-sm mb-6 flex-grow">{option.description}</p>
                <div className="text-xl text-blue-600 font-bold border-t border-gray-50 pt-4 w-full">
                    ${option.cost.toLocaleString()}
                </div>
                <div className="mt-4 text-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('tapToSelect')}
                </div>
            </div>
        </div>
    )
}

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
          if (step === 'profile' || step === 'loading') { // Actually it could be 'loading' or previous step
              generateJobsForProfile(profile);
          } else if (step === 'topics') {
              loadTopic(currentTopicIndex);
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
    
    // Start topics
    setLoading(true);
    await loadTopic(0);
    setStep('topics');
    setLoading(false);
  };

  const loadTopic = async (index: number) => {
    const topic = TOPICS[index];
    const jobForSalary = confirmedJob || selectedJob;
    const { options, description, error } = await generateLifeOptions(topic.id, { salary: jobForSalary?.salary }, isDemoMode, locale);
    
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
        setLoading(true);
        await loadTopic(currentTopicIndex + 1);
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

  if (step === 'loading' && errorType === 'NONE') return <div className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('loading')}</div>;

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
                <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4" style={{ background: 'rgba(42,38,34,0.5)' }}>
                    <div className="card-morandi p-8 max-w-md w-full border" style={{ borderColor: 'var(--color-terracotta)', boxShadow: '0 20px 40px rgba(196,148,139,0.2)' }}>
                        <div className="text-4xl mb-4 text-center" style={{ color: 'var(--color-terracotta)' }}>⚠️</div>
                        <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">{t('aiGenerationIssue')}</h3>
                        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{errorMessage || t('aiGenerationMessage')}</p>
                        
                        <div className="space-y-3">
                             <button onClick={() => handleErrorChoices('retry')} className="w-full py-3 px-4 rounded-xl font-bold transition" style={{ background: 'var(--color-neutral-100)', color: 'var(--color-text)' }}>
                                {t('retryConnection')}
                            </button>
                            <button onClick={() => handleErrorChoices('demo')} className="btn-morandi-accent w-full">
                                {t('continueDemo')}
                            </button>
                            <button onClick={() => handleErrorChoices('qa')} className="w-full py-3 px-4 border-2 rounded-xl font-medium transition" style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text-secondary)' }}>
                                {t('switchToQA')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Step */}
            {step === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="card-morandi p-8 space-y-6">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 border-b pb-2" style={{ borderColor: 'var(--color-neutral-200)' }}>{t('setupProfile')}</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-neutral-900">{t('industry')} <span style={{ color: 'var(--color-terracotta)' }}>{t('required')}</span></label>
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
                            <label className="block mb-2 text-sm font-medium text-neutral-900">{t('familiarity')} <span style={{ color: 'var(--color-terracotta)' }}>{t('required')}</span></label>
                            <select 
                                required
                                value={profile.familiarity}
                                onChange={e => setProfile({...profile, familiarity: e.target.value})}
                                className="w-full border-2 p-3 rounded-xl outline-none transition"
                                style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
                            >
                                <option value="">{t('selectLevel')}</option>
                                <option value="Beginner">{t('beginnerLevel')}</option>
                                <option value="Intermediate">{t('intermediateLevel')}</option>
                                <option value="Advanced">{t('advancedLevel')}</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-neutral-900">{t('salary')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3" style={{ color: 'var(--color-text-muted)' }}>$</span>
                                    <input 
                                        type="text"
                                        value={profile.salary}
                                        onChange={e => setProfile({...profile, salary: e.target.value})}
                                        className="w-full pl-8 border-2 p-3 rounded-xl outline-none transition"
                                        style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
                                        placeholder={t('salaryPlaceholder')}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-neutral-900">{t('paymentFreq')}</label>
                                <select 
                                    value={profile.paymentFreq}
                                    onChange={e => setProfile({...profile, paymentFreq: e.target.value})}
                                    className="w-full border-2 p-3 rounded-xl outline-none transition"
                                    style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text)' }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-neutral-300)'}
                                >
                                    <option value="Monthly">{t('payMonthly')}</option>
                                    <option value="Semi-Month">{t('paySemiMonth')}</option>
                                    <option value="Hourly">{t('payHourly')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {jobs.length > 0 && (
                            <button
                                type="button" 
                                onClick={() => setStep('jobs')}
                                className="btn-morandi-secondary px-6 py-4"
                            >
                                {t('cancel')}
                            </button>
                        )}
                        <button 
                            disabled={loading}
                            type="submit" 
                            className="btn-morandi-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('generatingOptions') : (jobs.length > 0 ? t('updateRestart') : t('start'))}
                        </button>
                    </div>
                </form>
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
                    
                    <p className="p-6 rounded-2xl border leading-relaxed" style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'var(--color-accent)', color: 'var(--color-neutral-700)', boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
                        {topicDescription}
                    </p>

                    {loading ? (
                        <div className="py-24 text-center animate-pulse flex flex-col items-center" style={{ color: 'var(--color-text-muted)' }}>
                            <div className="h-8 w-8 rounded-full animate-ping mb-4" style={{ background: 'var(--color-primary-light)' }}></div>
                            {t('reflectingDecision')}
                        </div>
                    ) : (
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
                <div className="flex flex-col items-center justify-center h-96 card-morandi">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mb-6" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
                    <p className="text-xl font-bold text-neutral-900">{t('simulatingYear')}</p>
                    <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>{t('simulatingYearSubtext')}</p>
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
          <div 
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(42,38,34,0.5)' }}
            onClick={() => setShowEditProfileConfirm(false)}
          >
            <div 
              className="card-morandi p-8 max-w-md w-full border"
              style={{ borderColor: 'var(--color-accent)', boxShadow: '0 20px 40px rgba(14,165,233,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-4 text-center" style={{ color: 'var(--color-accent)' }}>⚠️</div>
              <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">{t('editProfileTitle')}</h3>
              <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{t('editProfileMessage')}</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setShowEditProfileConfirm(false);
                    setStep('profile');
                  }} 
                  className="btn-morandi-accent w-full"
                >
                  {t('editProfile')}
                </button>
                <button 
                  onClick={() => setShowEditProfileConfirm(false)} 
                  className="w-full py-3 px-4 border-2 rounded-xl font-medium transition"
                  style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text-secondary)' }}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Analysis Modal */}
        {showAnalysisModal && (selectedJob || selectedTopicOption) && (
          <div 
            className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            style={{ background: 'rgba(42,38,34,0.5)' }}
            onClick={() => {
              setShowAnalysisModal(false);
              setSelectedJob(null);
              setSelectedTopicOption(null);
            }}
          >
            <div 
              className="card-morandi p-8 md:p-12 max-w-2xl w-full border-0 rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(14,165,233,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-block px-4 py-2 rounded-full text-sm font-bold mb-4" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                    {selectedJob ? '💼 ' + t('careerOutlook') : '💡 ' + t('choiceAnalyzed')}
                  </div>
                  <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                    {selectedJob ? selectedJob.title : selectedTopicOption?.title}
                  </h2>
                  {selectedJob && (
                    <div className="flex justify-center gap-3 text-sm mb-6">
                      <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                        💰 {selectedJob.salaryLabel}
                      </div>
                      <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                        📍 {selectedJob.location}
                      </div>
                    </div>
                  )}
                  {selectedTopicOption && (
                    <div className="flex justify-center gap-3 text-sm mb-6">
                      <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                        💰 ${selectedTopicOption.cost.toLocaleString()}
                      </div>
                      <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)' }}>
                        {selectedTopicOption.type === 'monthly' ? '📅 Monthly' : '🔸 One-time'}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-6 rounded-2xl" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    {selectedJob ? selectedJob.analysis : selectedTopicOption?.analysis}
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setShowAnalysisModal(false);
                      setSelectedJob(null);
                      setSelectedTopicOption(null);
                    }}
                    className="flex-1 py-4 px-6 rounded-xl font-bold transition-all hover:scale-105"
                    style={{ background: 'var(--color-neutral-100)', color: 'var(--color-text)' }}
                  >
                    ← {t('reselect')}
                  </button>
                  <button 
                    onClick={() => {
                      if (selectedJob) {
                        confirmJobChoice();
                      } else if (selectedTopicOption) {
                        confirmTopicChoice();
                      }
                    }}
                    className="flex-1 btn-morandi-primary py-4 px-6 flex items-center justify-center gap-2"
                  >
                    {t('continue')}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
