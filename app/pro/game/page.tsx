'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateJobs, generateLifeOptions, UserProfile, JobOption, LifeOption, SimulationResult } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const TOPICS = [
  { id: 'Housing', name: 'Housing' },
  { id: 'Credit Cards', name: 'Credit Cards' },
  { id: 'Investment', name: 'Investment' },
  { id: 'Loans', name: 'Loans' }
];

function JobFlipCard({ job, onSelect, selected }: { job: JobOption, onSelect: (j: JobOption) => void, selected: boolean }) {
    const [flipped, setFlipped] = useState(false);
    const [showModal, setShowModal] = useState<{title: string, content: string} | null>(null);

    useEffect(() => {
        if (selected) setFlipped(true);
    }, [selected]);

    const handleModal = (e: React.MouseEvent, title: string, content: string) => {
        e.stopPropagation();
        setShowModal({title, content});
    };

    return (
        <>
            <div 
                className="h-96 w-full cursor-pointer [perspective:1000px] group"
                onClick={() => {
                    if (!selected) onSelect(job);
                }}
            >
                <div className={`relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    {/* Front */}
                    <div className="absolute inset-0 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all [backface-visibility:hidden] flex flex-col">
                         <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                         <div className="text-2xl text-blue-600 font-bold mb-4">{job.salaryLabel}</div>
                         <div className="space-y-3 text-sm text-gray-600 flex-grow">
                             <p className="flex justify-between items-center border-b border-gray-50 pb-2">
                                 <span className="font-medium">Location</span> 
                                 <span>{job.location}</span>
                             </p>
                             <p 
                                 className="flex justify-between items-center border-b border-gray-50 pb-2 cursor-help hover:bg-gray-50 p-1 -mx-1 rounded"
                                 onClick={(e) => handleModal(e, "Compensation", "Bonuses: Often performance based. RSUs: Restricted Stock Units, vest over time. Options: Right to buy stock at set price.")}
                             >
                                 <span className="font-medium text-blue-600 underline decoration-dotted">Compensation</span>
                                 <span className="text-right truncate max-w-[50%]">{job.bonus}</span>
                             </p>
                             <p 
                                 className="flex justify-between items-center cursor-help hover:bg-gray-50 p-1 -mx-1 rounded"
                                 onClick={(e) => handleModal(e, "Health Insurance", "PPO: Higher premium but more doctor choice. HMO: Lower premium but restricted network. HDHP: Lower premium, high deductible (good with HSA).")}
                             >
                                 <span className="font-medium text-blue-600 underline decoration-dotted">Health</span>
                                 <span className="text-right truncate max-w-[50%]">{job.healthInsurance}</span>
                             </p>
                         </div>
                         <div className="mt-4 text-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                             Tap to Select
                         </div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 bg-indigo-600 rounded-2xl border border-indigo-500 p-6 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <div className="mb-4 bg-white/20 p-3 rounded-full">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Career Outlook</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6">{job.analysis || "Stable choice with good growth."}</p>
                    </div>
                </div>
            </div>
            
            {showModal && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn" // Increased z-index
                    onClick={(e) => {
                         e.stopPropagation();
                         setShowModal(null);
                    }}
                 >
                    <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all scale-100 border border-gray-100" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{showModal.title}</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">{showModal.content}</p>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModal(null);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-bold transition-colors shadow-lg"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

function FlipCard({ option, onSelect, selected }: { option: LifeOption, onSelect: (o: LifeOption) => void, selected: boolean }) {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        if (selected) setFlipped(true);
    }, [selected]);

    return (
        <div 
            className="h-80 w-full cursor-pointer [perspective:1000px] group"
            onClick={() => {
                if (!selected) {
                    onSelect(option);
                }
            }}
        >
             <div className={`relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Front */}
                <div className="absolute inset-0 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all [backface-visibility:hidden] flex flex-col">
                    <div className="flex justify-between items-start mb-3 w-full">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{option.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2 ${option.type === 'monthly' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {option.type === 'monthly' ? '/mo' : 'one-time'}
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6 flex-grow">{option.description}</p>
                    <div className="text-xl text-blue-600 font-bold border-t border-gray-50 pt-4 w-full">
                        ${option.cost.toLocaleString()}
                    </div>
                    <div className="mt-4 text-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Tap to Select
                    </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 bg-blue-600 rounded-2xl border border-blue-500 p-6 flex flex-col items-center justify-center text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                     <div className="mb-4 bg-white/20 p-3 rounded-full">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <h3 className="text-white font-bold text-lg mb-2">Choice Analyzed</h3>
                     <p className="text-blue-100 text-sm leading-relaxed mb-6">{option.analysis || "Good choice!"}</p>
                </div>
             </div>
        </div>
    )
}

export default function GamePage() {
  const router = useRouter();
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

  
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'NONE' | 'GENERATION_ERROR'>('NONE');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingJobs, setPendingJobs] = useState<JobOption[] | null>(null);
  const [showModal, setShowModal] = useState<{title: string, content: string} | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabase = createClient();

  const generateJobsForProfile = async (currentProfile: UserProfile) => {
    setLoading(true);
    const { jobs: newJobs, error } = await generateJobs(currentProfile);
    
    if (error && newJobs) { 
        setPendingJobs(newJobs);
        setErrorType('GENERATION_ERROR');
        let msg = error;
        if (error === 'FALLBACK_USED') msg = 'Network error or limit reached.';
        if (error === 'REGION_BLOCKED') msg = 'AI unavailable in your region. Please use Demo Mode.';
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
      setUser(user);
      
      let profileLoaded = false;
      if (user) {
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
      }
      
      if (!profileLoaded) {
        setStep('profile');
      }
    };
    checkUser();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          router.push('/standard/question/1');
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
    // Just select for feedback first
    setSelectedJob(job);
  };

  const confirmJobChoice = async () => {
    if (!selectedJob) return;
    setConfirmedJob(selectedJob); // Actually store it if needed, but mainly we move step
    
    // Start topics
    setLoading(true);
    await loadTopic(0);
    setStep('topics');
    setLoading(false);
  };

  const loadTopic = async (index: number) => {
    const topic = TOPICS[index];
    const { options, description, error } = await generateLifeOptions(topic.id, { salary: selectedJob?.salary }, isDemoMode);
    
    if (error && options) {
        setTopicOptions(options);
        setTopicDescription(description); // Fallback usually has description
        setCurrentTopicIndex(index);

        setErrorType('GENERATION_ERROR');
        let msg = error;
        if (error === 'FALLBACK_USED') msg = 'Network error or limit reached.';
        if (error === 'REGION_BLOCKED') msg = 'AI unavailable in your region. Please use Demo Mode.';
        setErrorMessage(msg);
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
  };

  const confirmTopicChoice = async () => {
    if (!selectedTopicOption) return;
    const option = selectedTopicOption;
    const topic = TOPICS[currentTopicIndex];
    const newChoices = { ...choices, [topic.id]: option };
    setChoices(newChoices);
    setSelectedTopicOption(null); // Reset for next screen

    if (currentTopicIndex < TOPICS.length - 1) {
        setLoading(true);
        await loadTopic(currentTopicIndex + 1);
        setLoading(false);
    } else {
        // Run Simulation - Logic moved to /pro/analysis
        setStep('simulation');
        
        // Save to DB
        if (user) {
            const { data, error: dbError } = await supabase.from('simulations').insert({
                user_id: user.id,
                final_balance: 0, // Will be updated in analysis page
                game_history: {
                    profile,
                    job: selectedJob,
                    choices: newChoices,
                    isDemo: isDemoMode
                },
                gemini_analysis: null // Will be generated in analysis page
            }).select();
            
            if (data && data[0]) {
                // Redirect to the dedicated analysis page
                router.push(`/pro/analysis?id=${data[0].id}${isDemoMode ? '&demo=true' : ''}`);
                return;
            }
             if (dbError) {
                console.error("DB Error", dbError);
                setErrorMessage("Failed to save progress. Please try again.");
                setErrorType('GENERATION_ERROR');
                return;
            }
        }
        
        // Fallback if no user: Save to local storage and redirect
        const history = {
            profile,
            job: selectedJob,
            choices: newChoices,
            isDemo: isDemoMode
        };
        localStorage.setItem('gameHistory', JSON.stringify(history));
        localStorage.removeItem('finalNetWorth');

        router.push(`/pro/analysis${isDemoMode ? '?demo=true' : ''}`);
    }
  };

  if (step === 'loading' && errorType === 'NONE') return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12 font-sans flex justify-center">
        <div className="max-w-4xl w-full">
            <header className="mb-8 text-center md:text-left flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-blue-600 mb-2">Finotype Pro Simulation</h1>
                    {isDemoMode && step !== 'result' && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full border border-orange-200">DEMO MODE</span>}
                    {step !== 'result' && <p className="text-gray-500 mt-1">Design your financial life, one choice at a time.</p>}
                </div>
            </header>
            
            {errorType === 'GENERATION_ERROR' && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100">
                        <div className="text-red-500 text-4xl mb-4 text-center">⚠️</div>
                        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">AI Generation Issue</h3>
                        <p className="text-center text-gray-500 mb-6">{errorMessage || "We encountered an issue creating your personalized scenario."}</p>
                        
                        <div className="space-y-3">
                             <button onClick={() => handleErrorChoices('retry')} className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-bold transition">
                                Retry Connection
                            </button>
                            <button onClick={() => handleErrorChoices('demo')} className="w-full py-3 px-4 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl font-bold transition">
                                Continue in Demo Mode
                            </button>
                            <button onClick={() => handleErrorChoices('qa')} className="w-full py-3 px-4 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-medium transition">
                                Switch to Simple Q/A Test
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Step */}
            {step === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">User Profile</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Your Ideal Industry <span className="text-red-500">*</span></label>
                            <input 
                                required
                                type="text" 
                                value={profile.industry}
                                onChange={e => setProfile({...profile, industry: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="e.g. Tech, Healthcare, Arts..."
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Financial Familiarity <span className="text-red-500">*</span></label>
                            <select 
                                required
                                value={profile.familiarity}
                                onChange={e => setProfile({...profile, familiarity: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            >
                                <option value="">Select level...</option>
                                <option value="Beginner">Beginner (What is a 401k?)</option>
                                <option value="Intermediate">Intermediate (I budget sometimes)</option>
                                <option value="Advanced">Advanced (I have a diverse portfolio)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Intended Salary (Annual)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">$</span>
                                    <input 
                                        type="text"
                                        value={profile.salary}
                                        onChange={e => setProfile({...profile, salary: e.target.value})}
                                        className="w-full pl-8 bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="e.g. 75000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Pay Frequency</label>
                                <select 
                                    value={profile.paymentFreq}
                                    onChange={e => setProfile({...profile, paymentFreq: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Semi-Month">Semi-Month</option>
                                    <option value="Hourly">Hourly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {jobs.length > 0 && (
                            <button
                                type="button" 
                                onClick={() => setStep('jobs')}
                                className="px-6 py-4 rounded-full font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button 
                            disabled={loading}
                            type="submit" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating Options...' : 'Update & Restart'}
                        </button>
                    </div>
                </form>
            )}

            {/* Jobs Step */}
            {step === 'jobs' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Select Your Career Path</h2>
                        <button 
                            onClick={() => setStep('profile')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Edit Profile
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <JobFlipCard
                                key={job.id} 
                                job={job}
                                onSelect={handleJobSelect} 
                                selected={selectedJob?.id === job.id}
                            />
                        ))}
                    </div>

                    {/* Confimation Button */}
                    {selectedJob && (
                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
                            <button 
                                onClick={confirmJobChoice}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-indigo-700 transition flex items-center gap-2"
                            >
                                Confirm Career
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Topics Step */}
            {step === 'topics' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">{TOPICS[currentTopicIndex].name}</h2>
                            <button 
                                onClick={() => {
                                    if (confirm("Changing profile will restart the simulation. Continue?")) {
                                        setStep('profile');
                                    }
                                }}
                                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-200 transition"
                            >
                                Edit Profile
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentTopicIndex + 1) / TOPICS.length) * 100}%` }}></div>
                             </div>
                             <span className="text-sm text-gray-500 font-medium">{currentTopicIndex + 1} / {TOPICS.length}</span>
                        </div>
                    </div>
                    
                    <p className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800 leading-relaxed shadow-sm">
                        {topicDescription}
                    </p>

                    {loading ? (
                        <div className="py-24 text-center text-gray-400 animate-pulse flex flex-col items-center">
                            <div className="h-8 w-8 bg-blue-100 rounded-full animate-ping mb-4"></div>
                            Consulting the oracle...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {topicOptions.map(option => (
                                <FlipCard 
                                    key={option.id} 
                                    option={option} 
                                    onSelect={handleTopicChoice}
                                    selected={selectedTopicOption?.id === option.id}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Next Button for when card is flipped */}
                    {selectedTopicOption && (
                        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce">
                            <button 
                                onClick={confirmTopicChoice}
                                className="bg-gray-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-black transition flex items-center gap-2"
                            >
                                Continue to Next Step
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Simulation loading */}
            {step === 'simulation' && (
                <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
                    <p className="text-xl font-bold text-gray-900">Simulating your financial year...</p>
                    <p className="text-gray-500 mt-2">Checking stock markets... Calculating interest... Paying bills...</p>
                </div>
            )}

            {/* Result Step */}
            {step === 'result' && result && (
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4">One Year Later...</h2>
                            <p className="text-blue-100 text-lg">Your Financial Persona</p>
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
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Final Cash Balance</p>
                                <p className="text-3xl md:text-4xl font-bold text-gray-900">${result.finalBalance.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-gray-500 uppercase text-xs font-bold tracking-wider mb-2">Net Worth</p>
                                <p className="text-3xl md:text-4xl font-bold text-blue-600">${result.netWorth.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <span>📅</span> Your Year in Review
                            </h3>
                            <p className="text-blue-800 leading-relaxed text-lg">{result.narrative}</p>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span>💡</span> Professional Tips for You
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

                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t border-gray-100">
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-full font-bold transition-all"
                            >
                                Play Again
                            </button>
                            <button 
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: 'My Finotype Result',
                                            text: `I finished the year as "${result.finotype}" with a net worth of $${result.netWorth.toLocaleString()}! #Finotype`,
                                            url: window.location.href
                                        });
                                    } else {
                                        alert("Check out my Finotype: " + result.finotype);
                                    }
                                }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                Share Result
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn" onClick={() => setShowModal(null)}>
                    <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all scale-100 border border-gray-100" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{showModal.title}</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">{showModal.content}</p>
                        <button 
                            onClick={() => setShowModal(null)}
                            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-bold transition-colors shadow-lg"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
