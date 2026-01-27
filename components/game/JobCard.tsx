'use client';

import { useState } from 'react';
import { JobOption } from '@/types';

interface JobCardProps {
  job: JobOption;
  onSelect: (job: JobOption) => void;
  selected: boolean;
  disabled?: boolean;
  t: any;
}

export function JobCard({ job, onSelect, selected, disabled, t }: JobCardProps) {
  const [showTooltip, setShowTooltip] = useState<{title: string, content: string} | null>(null);
  const [showDetail, setShowDetail] = useState<{title: string, content: string} | null>(null);

  return (
    <>
      <div 
        className={`h-96 w-full group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        onClick={() => {
          if (!disabled && !selected) onSelect(job);
        }}
      >
        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all h-full flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
          <div className="text-2xl text-blue-600 font-bold mb-4">{job.salaryLabel}</div>
          <div className="space-y-3 text-sm text-gray-600 flex-grow">
            <p className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="font-medium">{t('monthlySalary')}</span> 
              <span>${(job.salary / 12).toLocaleString()}</span>
            </p>
            <div className="flex justify-between items-center gap-2 border-b border-gray-50 pb-2">
              <span className="font-medium text-blue-600 flex items-center gap-1.5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip({
                      title: t('compensation'),
                      content: t('compensationTooltip')
                    });
                  }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    const compensationDetails = `${t('bonus')}: ${job.bonus}`;
                    setShowDetail({
                      title: t('compensation'),
                      content: compensationDetails
                    });
                  }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                {t('compensation')}
              </span>
              <span className="text-right truncate max-w-[35%] text-xs">{job.bonus}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-blue-600 flex items-center gap-1.5">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTooltip({
                      title: t('healthTitle'),
                      content: t('healthTooltip')
                    });
                  }}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail({
                      title: t('healthTitle'),
                      content: job.healthInsurance
                    });
                  }}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                {t('health')}
              </span>
              <span className="text-right truncate max-w-[45%] text-xs">{job.healthInsurance}</span>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {t('tapToSelect')}
          </div>
        </div>
      </div>
      
      {showTooltip && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn"
          style={{ background: 'rgba(42,38,34,0.4)' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(null);
          }}
        >
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{showTooltip.title}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{showTooltip.content}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-bold transition-colors"
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      )}
      
      {showDetail && (
        <div 
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn"
          style={{ background: 'rgba(42,38,34,0.4)' }}
          onClick={(e) => {
            e.stopPropagation();
            setShowDetail(null);
          }}
        >
          <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{showDetail.title}</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">{showDetail.content}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowDetail(null);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-bold transition-colors"
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
