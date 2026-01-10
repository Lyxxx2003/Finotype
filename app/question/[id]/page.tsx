'use client';

import { questions } from '@/lib/data';
import { saveAnswer, getAnswers } from '@/lib/storage';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Parse ID safely
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const questionId = parseInt(idParam || '1', 10);
  
  const question = questions.find(q => q.id === questionId);

  // Load existing answer if any
  useEffect(() => {
    const answers = getAnswers();
    if (answers[questionId]) {
      setSelectedOption(answers[questionId]);
    } else {
      setSelectedOption(null);
    }
  }, [questionId]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Question not found.</p>
        <button onClick={() => router.push('/')} className="mt-4 text-blue-600 underline">Go Home</button>
      </div>
    );
  }

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    saveAnswer(questionId, value);
    
    // Small delay for better UX
    setTimeout(() => {
      if (questionId < questions.length) {
        router.push(`/question/${questionId + 1}`);
      } else {
        router.push('/results');
      }
    }, 300);
  };

  const currentStep = questionId;
  const totalSteps = questions.length;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-xl mt-10">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Question {currentStep} of {totalSteps}</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-8">
            {question.text}
          </h2>

          <div className="flex flex-col gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 
                  ${selectedOption === option.value 
                    ? 'border-blue-600 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-between">
           {questionId > 1 && (
             <button 
               onClick={() => router.push(`/question/${questionId - 1}`)}
               className="text-gray-500 hover:text-gray-900 font-medium"
             >
               ← Back
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
