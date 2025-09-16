import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'

function NotFound() {
  const { reason } = useParams()
  const isInvitationNotFound = reason === 'invitation-not-found' || sessionStorage.getItem('404-reason') === 'invitation-not-found'
  
  useEffect(() => {
    // Set document title to indicate 404
    document.title = '404 - Page Not Found | Invites'
    
    // Clear the session storage flag
    return () => {
      sessionStorage.removeItem('404-reason')
    }
  }, [])

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      <div className="text-8xl mb-4">{isInvitationNotFound ? '🎉❓' : '404'}</div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">
        {isInvitationNotFound ? 'Invitation Not Found' : 'Page Not Found'}
      </h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        {isInvitationNotFound 
          ? "This invitation doesn't exist or may have been removed."
          : "The page you're looking for doesn't exist."}
      </p>
      <div className="flex gap-4 justify-center">
        <Link 
          to="/" 
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Go Home
        </Link>
        <Link 
          to="/create" 
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create {isInvitationNotFound ? 'Your Own' : 'Invitation'}
        </Link>
      </div>
    </div>
  )
}

export default NotFound