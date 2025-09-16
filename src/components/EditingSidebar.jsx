import { useState } from 'react'

function EditingSidebar({ fields, onToggleField, onShare, sharing }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const editableFields = fields.filter(f => f.type === 'detail' && !f.locked)
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl">
      <div className="p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full lg:hidden"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Invitation Fields
          </h3>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 hidden lg:block">
          Invitation Fields
        </h3>
        
        <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 mt-4 lg:mt-0">
            Toggle fields to show or hide them in your invitation
          </p>
          
          <div className="space-y-2">
            {editableFields.map(field => (
              <button
                key={field.id}
                onClick={() => onToggleField(field.id)}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                  field.visible
                    ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{field.label.replace(':', '')}</span>
                <span className="text-xs opacity-75">
                  {field.visible ? 'Visible' : 'Hidden'}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button 
              className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={onShare} 
              disabled={sharing}
            >
              {sharing ? 'Creating invitation...' : 'Generate Share Link'}
            </button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              Your invitation will be saved and a shareable link will be copied to your clipboard
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditingSidebar