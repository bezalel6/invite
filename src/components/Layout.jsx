import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout