import { useLocation, Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Header() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isViewingInvite = location.pathname.startsWith('/invite/')
  
  return (
    <header className="bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo_64x64.png" alt="Invitation Creator" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-neutral-900 dark:text-neutral-100">
                Invites
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Your enterprise-grade* invitation solution
                <span className="block text-[10px] text-neutral-400 dark:text-neutral-500">
                  *For exactly one rigid template
                </span>
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {isViewingInvite && (
              <Link
                to="/create"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
              >
                Create Your Own
              </Link>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl transition-all bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-yellow-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header