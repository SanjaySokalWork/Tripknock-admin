'use client';

import { Warning } from '@mui/icons-material';

export default function AlertDialog({ 
  open, 
  onConfirm, 
  onCancel, 
  title, 
  message, 
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  disabled = false 
}) {
  if (!open) return null;

  const getButtonClasses = () => {
    switch (confirmVariant) {
      case 'error':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 text-white hover:bg-yellow-700';
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <Warning className="w-6 h-6" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        
        <p className="text-secondary-600 mb-6">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-secondary-700 hover:bg-secondary-50 rounded-lg transition-colors"
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors ${getButtonClasses()} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={disabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
