'use client';

/* this is edit profile confirmation modal */

interface EditProfileConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
  t: any;
}

export function EditProfileConfirm({ onConfirm, onCancel, t }: EditProfileConfirmProps) {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(42,38,34,0.5)' }}
      onClick={onCancel}
    >
      <div 
        className="card-professional p-8 max-w-md w-full border"
        style={{ borderColor: 'var(--color-accent)', boxShadow: '0 20px 40px rgba(14,165,233,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-4xl mb-4 text-center" style={{ color: 'var(--color-accent)' }}>⚠️</div>
        <h3 className="text-xl font-bold text-center text-neutral-900 mb-2">{t('editProfileTitle')}</h3>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>{t('editProfileMessage')}</p>
        
        <div className="space-y-3">
          <button 
            onClick={onConfirm} 
            className="btn-professional-accent w-full"
          >
            {t('editProfile')}
          </button>
          <button 
            onClick={onCancel} 
            className="w-full py-3 px-4 border-2 rounded-xl font-medium transition"
            style={{ borderColor: 'var(--color-neutral-300)', color: 'var(--color-text-secondary)' }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
