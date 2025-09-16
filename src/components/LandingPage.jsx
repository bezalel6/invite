import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
        Invites
      </h1>
      
      <p className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 mb-12">
        Create and share beautiful invitations in seconds.
      </p>
      
      <Link
        to="/create"
        className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      >
        Create an Invitation
      </Link>
    </div>
  )
}

export default LandingPage