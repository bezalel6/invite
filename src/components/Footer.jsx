import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="py-6 px-4 bg-white/50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs transition-colors text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Privacy Policy
            </Link>
            
            <span className="text-neutral-400 dark:text-neutral-600">•</span>
            
            <a 
              href="https://github.com/bezalel6/invite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs transition-colors text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              aria-label="View on GitHub"
            >
              GitHub
            </a>
          </nav>
          
          <div className="text-xs text-neutral-400 dark:text-neutral-500">
            © 2024 Invites. Crafted with minimal flexibility.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer