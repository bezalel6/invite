import { Link } from 'react-router-dom'

function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 rounded-2xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
        Privacy Policy
      </h1>
      
      <div className="space-y-6 text-gray-600 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            The Shortest Privacy Policy You'll Ever Read
          </h2>
          <p className="leading-relaxed">
            We take your privacy as seriously as we take our template flexibility (which is to say, 
            rigidly and with exactly one approach).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            What We Collect
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>The invitation data you create (stored in Firebase)</li>
            <li>Absolutely nothing else</li>
            <li>No, really, that's it</li>
            <li>We don't even have analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            How We Use Your Data
          </h2>
          <p className="leading-relaxed">
            Your invitation data is stored in Firebase with a hash-based ID. Anyone with the link 
            can view it. That's the whole system. It's like a public bulletin board, but digital 
            and specifically for invitations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Cookies
          </h2>
          <p className="leading-relaxed">
            We store your theme preference (light/dark) in localStorage. That's not even a cookie. 
            We're so privacy-focused, we don't even cookie properly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Third-Party Services
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Firebase (Google) - for storing invitations</li>
            <li>Vercel - for hosting</li>
            <li>That's it. No tracking pixels, no ad networks, no data brokers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Your Rights
          </h2>
          <p className="leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Create invitations</li>
            <li>Share invitations</li>
            <li>View invitations</li>
            <li>Marvel at our single, immutable template</li>
            <li>Leave and never come back (we won't even notice)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Data Deletion
          </h2>
          <p className="leading-relaxed">
            Want your invitation deleted? Too bad. Just kidding – but seriously, we don't have a 
            delete button. If you really need something removed, open an issue on GitHub and we'll 
            consider adding this feature in our next major update (scheduled for: never).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Contact
          </h2>
          <p className="leading-relaxed">
            Questions? Concerns? Suggestions for our one template? Find us on{' '}
            <a 
              href="https://github.com/bezalel6/invite" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline transition-colors text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              GitHub
            </a>
            . We respond to issues faster than we add features (which is never, so manage your expectations).
          </p>
        </section>

        <section className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: Probably when we created this site. Will update: Probably never.
          </p>
          <Link 
            to="/" 
            className="inline-block mt-4 underline transition-colors text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            ← Back to creating invitations with our one perfect template
          </Link>
        </section>
      </div>
    </div>
  )
}

export default PrivacyPolicy