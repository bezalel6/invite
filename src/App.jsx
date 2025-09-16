import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InviteCard from './components/InviteCard'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-8">
        <Header />
        <div className="pt-16 w-full">
          <Routes>
            <Route path="/" element={<InviteCard />} />
            <Route path="/invite/:id" element={<InviteCard />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App