import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import InvitationEditor from './components/InvitationEditor'
import PrivacyPolicy from './components/PrivacyPolicy'
import NotFound from './components/NotFound'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<InvitationEditor />} />
            <Route path="/invite/:id" element={<InvitationEditor />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/404/:reason?" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App