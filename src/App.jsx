import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InviteCard from './components/InviteCard'
import Header from './components/Header'
import './App.css'

function App() {
  return (
    <Router>
      <Header />
      <div style={{ paddingTop: '60px' }}>
        <Routes>
          <Route path="/" element={<InviteCard />} />
          <Route path="/invite/:id" element={<InviteCard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App