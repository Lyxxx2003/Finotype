'use client';

/* this is analysis card modal */

import { JobOption, LifeOption } from '@/types';

interface AnalysisModalProps {
  selectedJob?: JobOption | null;
  selectedTopicOption?: LifeOption | null;
  onConfirm: () => void;
  onCancel: () => void;
  t: any;
}

export function AnalysisModal({ selectedJob, selectedTopicOption, onConfirm, onCancel, t }: AnalysisModalProps) {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(42,38,34,0.5)' }}
      onClick={onCancel}
    >
      <div 
        className="card-morandi p-8 md:p-12 max-w-2xl w-full border-0 rounded-3xl overflow-hidden"
        style={{ boxShadow: '0 20px 60px rgba(14,165,233,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-6">
              {selectedJob ? '💼' : '🏠'}
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              {selectedJob ? selectedJob.title : selectedTopicOption?.title}
            </h3>
            {selectedJob && (
              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                {selectedJob.salaryLabel}
              </div>
            )}
            {selectedTopicOption && (
              <div className="text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                ${selectedTopicOption.cost.toLocaleString()}
                <span className="text-sm ml-2 font-normal" style={{ color: 'var(--color-text-secondary)' }}>
                  {selectedTopicOption.type === 'monthly' ? t('monthlyTag') : t('oneTimeTag')}
                </span>
              </div>
            )}
          </div>
          
          <div className="p-6 rounded-2xl" style={{ background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)' }}>
            <h4 className="font-bold text-lg mb-3" style={{ color: 'var(--color-accent)' }}>
              {t('aiAnalysis')}
            </h4>
            <p className="leading-relaxed text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              {selectedJob ? selectedJob.analysis : selectedTopicOption?.analysis}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 px-6 border-2 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{ 
                borderColor: 'var(--color-neutral-300)', 
                color: 'var(--color-text-secondary)',
                background: 'white'
              }}
            >
              {t('goBack')}
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 px-6 rounded-xl font-bold text-lg text-white transition-all hover:scale-105 shadow-lg"
              style={{ 
                background: 'var(--gradient-accent)',
                boxShadow: '0 4px 16px rgba(14,165,233,0.3)'
              }}
            >
              {t('confirmSelection')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
