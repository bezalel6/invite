import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InviteCard from './components/InviteCard'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InviteCard />} />
        <Route path="/invite/:id" element={<InviteCard />} />
      </Routes>
    </Router>
  )
}

export default App