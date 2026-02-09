'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams, useSearchParams } from 'next/navigation';
// import { useTranslations } from 'next-intl';
// import { generateJobs, generateLifeOptions } from '@/lib/gemini'
// import { UserProfile, JobOption, LifeOption } from '@/types';
// import { createClient } from '@/lib/supabase/client';
// import { User } from '@supabase/supabase-js';
// import LoadingPage from '@/components/LoadingPage';
// import { JobCard } from '@/components/pro/game/JobCard';
// import { OptionCard } from '@/components/pro/game/TopicCard';
// import { ErrorModal } from '@/components/pro/game/ErrorModal';
// import { AnalysisModal } from '@/components/pro/game/AnalysisModal';
// import { ProfileForm } from '@/components/pro/game/ProfileForm';
// import { clearAnswers } from '@/lib/storage';

// /* TODO: Change game topics here */
// const TOPICS = [
//     { id: 'Housing', name: 'Housing' },
//     { id: 'Credit Cards', name: 'Credit Cards' },
//     { id: 'Investment', name: 'Investment' },
//     { id: 'Loans', name: 'Loans' }
// ];

// export default function GamePage() {
//     const router = useRouter();
//     const params = useParams();
//     const searchParams = useSearchParams();
//     const locale = params.locale as string;
//     const t = useTranslations('game');
//     const [user, setUser] = useState<User | null>(null);
//     const [step, setStep] = useState<'loading' | 'profile' | 'jobs' | 'topics' | 'simulation'>('loading');
//     const [previousStep, setPreviousStep] = useState<'jobs' | 'topics' | null>(null);
//     const [profile, setProfile] = useState<UserProfile>({ industry: '', familiarity: '', salary: '', paymentFreq: 'Monthly' });
//     const [jobs, setJobs] = useState<JobOption[]>([]);
//     const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);
//     const [confirmedJob, setConfirmedJob] = useState<JobOption | null>(null); // Actual confirmed selection

//     // Topic State
//     const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
//     const [topicOptions, setTopicOptions] = useState<LifeOption[]>([]);
//     const [topicDescription, setTopicDescription] = useState('');
//     const [choices, setChoices] = useState<Record<string, LifeOption>>({});
//     const [selectedTopicOption, setSelectedTopicOption] = useState<LifeOption | null>(null); // For immediate feedback
//     const [showAnalysisModal, setShowAnalysisModal] = useState(false);

//     const [loading, setLoading] = useState(false);
//     const [errorType, setErrorType] = useState<'NONE' | 'GENERATION_ERROR'>('NONE');
//     const [errorMessage, setErrorMessage] = useState('');
//     const [pendingJobs, setPendingJobs] = useState<JobOption[] | null>(null);
//     const [showModal, setShowModal] = useState<{ title: string, content: string } | null>(null);
//     const [isDemoMode, setIsDemoMode] = useState(false);

//     const supabase = createClient();

//     const generateJobsForProfile = async (currentProfile: UserProfile) => {
//         setLoading(true);
//         setJobs([]); // Clear old jobs immediately
//         const { jobs: newJobs, error } = await generateJobs(currentProfile, isDemoMode, locale);

//         if (error && newJobs) {
//             setPendingJobs(newJobs);
//             setErrorType('GENERATION_ERROR');
//             let msg = error;
//             if (error === 'FALLBACK_USED') msg = t('networkError');
//             if (error === 'REGION_BLOCKED') msg = t('regionBlocked');
//             if (error === 'RATE_LIMIT_EXCEEDED') msg = t('rateLimitError');
//             if (error === 'INVALID_API_KEY') msg = t('apiKeyError');
//             if (error === 'SAFETY_FILTER') msg = t('safetyFilterError');
//             setErrorMessage(msg);
//             setLoading(false);
//             return;
//         }

//         if (error && !newJobs) {
//             setErrorMessage("Failed to generate jobs completely. Please try again.");
//             setErrorType('GENERATION_ERROR');
//             setLoading(false);
//             return;
//         }

//         setJobs(newJobs || []);
//         setStep('jobs');
//         setLoading(false);
//     };

//     useEffect(() => {
//         const checkUser = async () => {
//             const { data: { user } } = await supabase.auth.getUser();

//             if (!user) {
//                 // Redirect to login if user is not authenticated
//                 router.push(`/${locale}/login`);
//                 return;
//             }

//             setUser(user);

//             const newGame = searchParams.get('newGame') === 'true';

//             /* For returning users, show latest results */
//             if (!newGame) {
//                 const { data: latestSim } = await supabase
//                     .from('simulations')
//                     .select('*')
//                     .eq('user_id', user.id)
//                     .not('gemini_analysis', 'is', null)
//                     .order('created_at', { ascending: false })
//                     .limit(1)
//                     .single();

//                 if (latestSim && latestSim.gemini_analysis) {
//                     router.push(`/${locale}/pro/results?id=${latestSim.id}`);
//                     return;
//                 }
//             }

//             const { data: profileData } = await supabase
//                 .from('profiles')
//                 .select('*')
//                 .eq('id', user.id)
//                 .single();

//             let profileLoaded = false;

//             if (profileData && profileData.industry && profileData.familiarity) {
//                 const loadedProfile = {
//                     industry: profileData.industry,
//                     familiarity: profileData.familiarity,
//                     salary: profileData.salary || '',
//                     paymentFreq: (profileData.payment_freq as any) || 'Monthly'
//                 };
//                 setProfile(loadedProfile);
//                 profileLoaded = true;
//                 // Auto-generate jobs (this will set step to 'jobs' when complete)
//                 await generateJobsForProfile(loadedProfile);
//             }

//             if (!profileLoaded) {
//                 setStep('profile');
//             }
//         };
//         checkUser();
//     }, []);

//     const handleProfileSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // If profile changed, reset the game
//         setSelectedJob(null);
//         setConfirmedJob(null);
//         setChoices({});
//         setSelectedTopicOption(null);
//         setCurrentTopicIndex(0);
//         setTopicOptions([]);
//         setTopicDescription('');

//         // Save new profile to DB
//         if (user) {
//             await supabase.from('profiles').upsert({
//                 id: user.id,
//                 industry: profile.industry,
//                 familiarity: profile.familiarity,
//                 salary: profile.salary,
//                 payment_freq: profile.paymentFreq
//             });
//         }

//         await generateJobsForProfile(profile);
//     };

//     const handleErrorChoices = (choice: 'retry' | 'demo' | 'qa') => {
//         if (choice === 'retry') {
//             setErrorType('NONE');
//             setErrorMessage('');
//             if (step === 'profile' || step === 'loading') {
//                 generateJobsForProfile(profile);
//             } else if (step === 'topics') {
//                 loadTopic(currentTopicIndex, choices);
//             } else {
//                 generateJobsForProfile(profile);
//             }
//         } else if (choice === 'qa') {
//             clearAnswers();
//             router.push(`/${locale}/standard/question/1`);
//         } else if (choice === 'demo') {
//             setIsDemoMode(true);
//             setErrorType('NONE');
//             if (step === 'jobs' || ((step === 'profile' || step === 'loading') && pendingJobs)) {
//                 if (pendingJobs) setJobs(pendingJobs);
//                 setStep('jobs');
//             }
//         }
//     };

//     // When user agree the analysis of the job
//     const handleJobSelect = async (job: JobOption) => {
//         setSelectedJob(job);
//         setShowAnalysisModal(true);
//     };

//     const confirmJobChoice = async () => {
//         if (!selectedJob) return;
//         setShowAnalysisModal(false);
//         setConfirmedJob(selectedJob);
//         setSelectedJob(null);

//         setStep('topics');
//         setCurrentTopicIndex(0);
//         setTopicDescription('');
//         setTopicOptions([]);
//         setLoading(true);

//         // start topics
//         await loadTopic(0);
//         setLoading(false);
//     };

//     const loadTopic = async (index: number, updatedChoices?: Record<string, LifeOption>) => {
//         const topic = TOPICS[index];
//         const jobForSalary = confirmedJob || selectedJob;
//         const currentChoices = updatedChoices || choices;

//         // Clear old data immediately
//         setTopicOptions([]);
//         setTopicDescription('');

//         const { options, description, error } = await generateLifeOptions(
//             topic.id,
//             {
//                 salary: jobForSalary?.salary,
//                 job: confirmedJob,
//                 previousChoices: currentChoices
//             },
//             isDemoMode,
//             locale
//         );

//         if (error && options) {
//             setTopicOptions(options);
//             setTopicDescription(description);
//             setCurrentTopicIndex(index);

//             setErrorType('GENERATION_ERROR');
//             let msg = error;
//             if (error === 'FALLBACK_USED') msg = t('networkError');
//             if (error === 'REGION_BLOCKED') msg = t('regionBlocked');
//             if (error === 'RATE_LIMIT_EXCEEDED') msg = t('rateLimitError');
//             if (error === 'INVALID_API_KEY') msg = t('apiKeyError');
//             if (error === 'SAFETY_FILTER') msg = t('safetyFilterError');
//             setErrorMessage(msg || error);
//             return;
//         }

//         if (error && !options) {
//             setErrorMessage("Failed to load options.");
//             setErrorType('GENERATION_ERROR');
//             return;
//         }
//         setTopicOptions(options || []);
//         setTopicDescription(description || '');
//         setCurrentTopicIndex(index);
//     };

//     const handleTopicChoice = async (option: LifeOption) => {
//         setSelectedTopicOption(option);
//         setShowAnalysisModal(true);
//     };

//     const confirmTopicChoice = async () => {
//         if (!selectedTopicOption) return;
//         setShowAnalysisModal(false);

//         const option = selectedTopicOption;
//         const topic = TOPICS[currentTopicIndex];
//         const newChoices = { ...choices, [topic.id]: option };
//         setChoices(newChoices);
//         setSelectedTopicOption(null);

//         if (currentTopicIndex < TOPICS.length - 1) {
//             const nextIndex = currentTopicIndex + 1;
//             setCurrentTopicIndex(nextIndex);
//             setTopicDescription('');
//             setTopicOptions([]);
//             setLoading(true);

//             // Load in background with updated choices
//             await loadTopic(nextIndex, newChoices);
//             setLoading(false);
//         } else {
//             // All topics done - run simulation now
//             setStep('simulation');
//             setLoading(true);

//             const { simulateYear } = await import('@/lib/gemini');

//             // Run the simulation
//             const simResult = await simulateYear(
//                 profile,
//                 confirmedJob!,
//                 newChoices,
//                 isDemoMode,
//                 locale
//             );

//             // Save to DB with gemini_analysis
//             let simulationId = null;
//             if (user) {
//                 const { data } = await supabase.from('simulations').insert({
//                     user_id: user.id,
//                     final_balance: simResult.finalBalance,
//                     game_history: {
//                         profile,
//                         job: confirmedJob,
//                         choices: newChoices,
//                         isDemo: isDemoMode
//                     },
//                     gemini_analysis: simResult
//                 }).select().single();

//                 simulationId = data?.id;
//             }

//             // Redirect to results page
//             router.push(`/${locale}/pro/results${simulationId ? `?id=${simulationId}` : ''}${isDemoMode ? '&demo=true' : ''}`);
//         }
//     };

//     if (step === 'loading' && errorType === 'NONE') {
//         return (
//             <LoadingPage />
//         );
//     }

//     return (
//         <div className="min-h-screen p-6 md:p-12 font-sans flex justify-center" style={{ background: 'var(--gradient-surface)', color: 'var(--color-text)' }}>
//             <div className="max-w-4xl w-full">
//                 <header className="mb-8 text-center md:text-left flex justify-between items-start">
//                     <div>
//                         <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>{t('title')}</h1>
//                         {isDemoMode && <span className="text-xs font-bold px-2 py-1 rounded-full border" style={{ background: 'rgba(14,165,233,0.1)', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>{t('demoMode')}</span>}
//                         <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>{t('subtitle')}</p>
//                     </div>
//                 </header>

//                 {errorType === 'GENERATION_ERROR' && (
//                     <ErrorModal
//                         errorMessage={errorMessage}
//                         onRetry={() => handleErrorChoices('retry')}
//                         onDemo={() => handleErrorChoices('demo')}
//                         onQA={() => handleErrorChoices('qa')}
//                         t={t}
//                     />
//                 )}

//                 {/* Profile Step */}
//                 {step === 'profile' && (
//                     <ProfileForm
//                         profile={profile}
//                         setProfile={setProfile}
//                         onSubmit={handleProfileSubmit}
//                         loading={loading}
//                         hasExistingJobs={jobs.length > 0}
//                         onEditProfile={() => {
//                             // Go back to previous step if we have existing jobs, otherwise stay in profile
//                             if (jobs.length > 0 && previousStep) {
//                                 setStep(previousStep);
//                                 setPreviousStep(null);
//                             }
//                         }}
//                         t={t}
//                     />
//                 )}

//                 {/* Jobs Step */}
//                 {step === 'jobs' && (
//                     <div className="space-y-6">
//                         <div className="flex justify-between items-center">
//                             <h2 className="text-xl font-bold text-neutral-900">{t('selectJob')}</h2>
//                             <button
//                                 onClick={() => {
//                                     setPreviousStep('jobs');
//                                     setStep('profile');
//                                 }}
//                                 className="text-sm text-primary hover:text-primary font-medium cursor-pointer"
//                             >
//                                 {t('editProfile')}
//                             </button>
//                         </div>
//                         {jobs.length > 0 ? (
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 {jobs.map(job => (
//                                     <JobCard
//                                         key={job.id}
//                                         job={job}
//                                         onSelect={handleJobSelect}
//                                         selected={selectedJob?.id === job.id}
//                                         disabled={selectedJob !== null && selectedJob.id !== job.id}
//                                         t={t}
//                                     />
//                                 ))}
//                             </div>
//                         ) : null}
//                     </div>
//                 )}

//                 {/* Topics Step */}
//                 {step === 'topics' && (
//                     <div className="space-y-6 animate-fadeIn">
//                         <div className="flex justify-between items-center mb-4">
//                             <div className="flex items-center gap-4">
//                                 <h2 className="text-2xl font-bold text-neutral-900">{t(TOPICS[currentTopicIndex].name)}</h2>
//                                 <button
//                                     onClick={() => {
//                                         setPreviousStep('topics');
//                                         setStep('profile');
//                                     }}
//                                     className="text-xs px-3 py-1 rounded-full border transition cursor-pointer"
//                                     style={{
//                                         background: 'var(--color-neutral-100)',
//                                         color: 'var(--color-text-secondary)',
//                                         borderColor: 'var(--color-neutral-200)'
//                                     }}
//                                 >
//                                     {t('editProfile')}
//                                 </button>
//                             </div>
//                             <div className="flex items-center gap-2">
//                                 <div className="h-2 w-24 rounded-full overflow-hidden" style={{ background: 'var(--color-neutral-200)' }}>
//                                     <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((currentTopicIndex + 1) / TOPICS.length) * 100}%` }}></div>
//                                 </div>
//                                 <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{currentTopicIndex + 1} / {TOPICS.length}</span>
//                             </div>
//                         </div>

//                         {loading ? (
//                             <div className="py-32 text-center flex flex-col items-center">
//                                 <div className="mb-8 relative">
//                                     <div className="h-20 w-20 rounded-full animate-spin border-4 border-t-transparent" style={{ borderColor: 'var(--color-primary)' }}></div>
//                                     <div className="absolute inset-0 flex items-center justify-center text-3xl">
//                                         {currentTopicIndex === 0 ? '🏠' : currentTopicIndex === 1 ? '💳' : currentTopicIndex === 2 ? '📈' : '💰'}
//                                     </div>
//                                 </div>
//                                 <h3 className="text-2xl font-bold text-neutral-900 mb-3">
//                                     {t(TOPICS[currentTopicIndex].name)}
//                                 </h3>
//                                 <p className="text-lg mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
//                                     {currentTopicIndex === 0 ? t('housingLoadingDesc') :
//                                         currentTopicIndex === 1 ? t('creditLoadingDesc') :
//                                             currentTopicIndex === 2 ? t('investmentLoadingDesc') :
//                                                 t('loansLoadingDesc')}
//                                 </p>
//                                 <div className="flex items-center gap-3 px-6 py-3 rounded-full animate-pulse" style={{ background: 'rgba(14,165,233,0.1)' }}>
//                                     <div className="h-2 w-2 rounded-full animate-ping" style={{ background: 'var(--color-accent)' }}></div>
//                                     <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
//                                         {currentTopicIndex === 0 ? t('housingLoadingStatus') :
//                                             currentTopicIndex === 1 ? t('creditLoadingStatus') :
//                                                 currentTopicIndex === 2 ? t('investmentLoadingStatus') :
//                                                     t('loansLoadingStatus')}
//                                     </span>
//                                 </div>
//                             </div>
//                         ) : topicDescription ? (
//                             <>
//                                 <p className="p-6 rounded-2xl border leading-relaxed mb-6" style={{ background: 'rgba(14,165,233,0.08)', borderColor: 'var(--color-accent)', color: 'var(--color-neutral-700)', boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
//                                     {topicDescription}
//                                 </p>
//                             </>
//                         ) : null}

//                         {!loading && topicOptions.length > 0 && (
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 {topicOptions.map(option => (
//                                     <OptionCard
//                                         key={option.id}
//                                         option={option}
//                                         onSelect={handleTopicChoice}
//                                         selected={selectedTopicOption?.id === option.id}
//                                         disabled={selectedTopicOption !== null && selectedTopicOption.id !== option.id}
//                                         t={t}
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}

//                 {/* Simulation loading */}
//                 {step === 'simulation' && (
//                     <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 card-professional rounded-3xl p-12">
//                         <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
//                         <div className="text-center space-y-2">
//                             <p className="text-2xl font-bold text-neutral-900">{t('simulatingYear')}</p>
//                             <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>{t('simulatingYearSubtext')}</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Modal */}
//                 {showModal && (
//                     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" style={{ background: 'rgba(42,38,34,0.4)' }} onClick={() => setShowModal(null)}>
//                         <div className="card-professional p-8 max-w-md w-full" style={{ boxShadow: '0 20px 40px rgba(42,38,34,0.2)' }} onClick={e => e.stopPropagation()}>
//                             <h3 className="text-xl font-bold text-neutral-900 mb-3">{showModal.title}</h3>
//                             <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{showModal.content}</p>
//                             <button
//                                 onClick={() => setShowModal(null)}
//                                 className="btn-professional-primary w-full"
//                             >
//                                 {t('gotIt')}
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {/* Analysis Modal */}
//             {showAnalysisModal && (selectedJob || selectedTopicOption) && (
//                 <AnalysisModal
//                     selectedJob={selectedJob}
//                     selectedTopicOption={selectedTopicOption}
//                     onConfirm={() => {
//                         if (selectedJob) {
//                             confirmJobChoice();
//                         } else if (selectedTopicOption) {
//                             confirmTopicChoice();
//                         }
//                     }}
//                     onCancel={() => {
//                         setShowAnalysisModal(false);
//                         setSelectedJob(null);
//                         setSelectedTopicOption(null);
//                     }}
//                     t={t}
//                 />
//             )}
//         </div>
//     );
// }
