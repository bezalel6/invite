import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useInvitation } from '../hooks/useInvitation'
import InvitationDisplay from './InvitationDisplay'
import EditingSidebar from './EditingSidebar'
import InvitationSkeleton from './InvitationSkeleton'
import Toast from './Toast'

function InvitationEditor() {
  const {
    fields,
    loading,
    sharing,
    isEditable,
    notFound,
    error,
    toast,
    setToast,
    updateField,
    toggleFieldVisibility,
    handleShare
  } = useInvitation()

  // For invitation not found, redirect to 404 page
  useEffect(() => {
    if (notFound) {
      // Set a flag in sessionStorage to show invitation-specific 404 message
      sessionStorage.setItem('404-reason', 'invitation-not-found')
    }
  }, [notFound])

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <InvitationSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-gray-700">{error}</p>
      </div>
    )
  }

  if (notFound) {
    // Navigate to 404 route which will render the NotFound component
    return <Navigate to="/404/invitation-not-found" replace />
  }

  const content = (
    <InvitationDisplay
      fields={fields}
      isEditable={isEditable}
      onFieldUpdate={updateField}
    />
  )

  if (!isEditable) {
    // View mode - just show the invitation
    return (
      <>
        <div className="w-full max-w-lg mx-auto">
          {content}
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    )
  }

  // Edit mode - show invitation with sidebar
  return (
    <>
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-center order-2 lg:order-1">
          {content}
        </div>
        <div className="flex items-start justify-center lg:justify-start order-1 lg:order-2">
          <div className="w-full max-w-sm lg:max-w-none lg:sticky lg:top-8">
            <EditingSidebar
              fields={fields}
              onToggleField={toggleFieldVisibility}
              onShare={handleShare}
              sharing={sharing}
            />
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

export default InvitationEditor