import { useState } from 'react';
import { Edit2, Loader2 } from 'lucide-react';

export default function ResetTrainerButton({ qualId, username,  onResetSuccess }) {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    
    try {
      const response = await fetch('/api/update_qualified_trainer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Qual_Id: qualId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'ready to edit');
        window.location.reload();
        if (onResetSuccess) {
          onResetSuccess(qualId);
        }
      } else {
        alert(data.error || 'Failed to edit record');
      }
    } catch (error) {
      console.error(' error:', error);
      alert('An error occurred while resetting the record');
    } finally {
      setIsResetting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isResetting}
        className="inline-flex items-center gap-1 px-1 py-1 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:text-orange-400 disabled:cursor-not-allowed rounded transition-colors"
      title="Click here to edit"
      >
        {isResetting ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Edit2 className="w-3 h-3" />
        )}
      </button>

      {showConfirm && (
        <div className="fixed inset-0  flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-sky-400">
            <h3 className="text-lg font-semibold  mb-2">
              Confirm Edit
            </h3>
            <p className=" mb-6">
              Are you sure you want to edit <strong>{username}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isResetting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
              No
              </button>
              <button
                onClick={handleReset}
                disabled={isResetting}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 rounded-md transition-colors inline-flex items-center gap-2"
              >
                {isResetting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isResetting ? 'loading...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}