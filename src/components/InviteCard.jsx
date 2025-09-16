import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Toast from './Toast'
import './InviteCard.css'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

function InviteCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [toast, setToast] = useState(null)
  const [fields, setFields] = useState({
    event: '',
    location: '',
    date: '',
    time: '',
    footer: ''
  })
  const [isEditable, setIsEditable] = useState(!id)

  useEffect(() => {
    if (id) {
      fetchInvite(id)
    }
  }, [id])

  const fetchInvite = async (inviteId) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/invites/${inviteId}.json`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setFields(data)
        } else {
          setToast({ message: 'Invitation not found', type: 'error' })
        }
      }
    } catch (error) {
      setToast({ message: 'Failed to load invitation', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Simple hash function for deduplication
  const hashInvite = (data) => {
    const str = `${data.event}|${data.location}|${data.date}|${data.time}|${data.footer}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substr(0, 9)
  }

  const handleShare = async () => {
    // Generate deterministic ID based on content
    const id = hashInvite(fields)
    
    try {
      // Check if this exact invite already exists
      const checkResponse = await fetch(`${FIREBASE_URL}/invites/${id}.json`)
      if (checkResponse.ok) {
        const existingData = await checkResponse.json()
        if (existingData) {
          // Reuse existing invitation
          const shareUrl = `${window.location.origin}/#/invite/${id}`
          navigator.clipboard.writeText(shareUrl)
          setToast({ message: 'Link copied! (Using existing invitation)', type: 'success' })
          setIsEditable(false)
          setTimeout(() => navigate(`/invite/${id}`), 2000)
          return
        }
      }
      
      // Create new invitation if it doesn't exist
      const response = await fetch(`${FIREBASE_URL}/invites/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          createdAt: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        const shareUrl = `${window.location.origin}/#/invite/${id}`
        navigator.clipboard.writeText(shareUrl)
        setToast({ message: 'Link copied to clipboard!', type: 'success' })
        
        // Show the URL in a modal or input field
        setIsEditable(false)
        setTimeout(() => navigate(`/invite/${id}`), 2000)
      }
    } catch (error) {
      setToast({ message: 'Failed to create invitation', type: 'error' })
    }
  }

  const handleFieldChange = (field, value) => {
    setFields(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="card">
        <h1 className="title">You are Cordially Invited</h1>
        <p className="subtitle">To attend</p>
        <div className="skeleton skeleton-event"></div>
        <div className="details">
          <div className="skeleton skeleton-location"></div>
          <div className="skeleton skeleton-date"></div>
          <div className="skeleton skeleton-time"></div>
        </div>
        <div className="skeleton skeleton-footer"></div>
      </div>
    )
  }

  return (
    <>
      {id && fields.event && (
        <Helmet>
          <title>Invitation: {fields.event}</title>
          <meta property="og:title" content={`Invitation: ${fields.event}`} />
          <meta property="og:description" content={`${fields.date} at ${fields.time} - ${fields.location}`} />
          <meta property="twitter:title" content={`Invitation: ${fields.event}`} />
          <meta property="twitter:description" content={`${fields.date} at ${fields.time}`} />
        </Helmet>
      )}
      
      <div className="card">
        <h1 className="title">You are Cordially Invited</h1>
        <p className="subtitle">To attend</p>
        
        <p className="event">
          {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.event}
              onChange={(e) => handleFieldChange('event', e.target.value)}
              placeholder="[Event Name]"
            />
          ) : (
            <span className="highlight">{fields.event}</span>
          )}
        </p>

        <div className="details">
          <span>Location: {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="[Venue/Address]"
            />
          ) : (
            <span className="highlight">{fields.location}</span>
          )}</span>
          
          <span>Date: {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              placeholder="[Day, Month Date, Year]"
            />
          ) : (
            <span className="highlight">{fields.date}</span>
          )}</span>
          
          <span>Time: {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.time}
              onChange={(e) => handleFieldChange('time', e.target.value)}
              placeholder="[Start Time - End Time]"
            />
          ) : (
            <span className="highlight">{fields.time}</span>
          )}</span>
        </div>

        <p className="footer">
          {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.footer}
              onChange={(e) => handleFieldChange('footer', e.target.value)}
              placeholder="[Additional Information]"
            />
          ) : (
            <span className="highlight">{fields.footer}</span>
          )}
        </p>
      </div>

      {isEditable && !id && (
        <button className="share-btn" onClick={handleShare}>
          Generate Share Link
        </button>
      )}

      {!isEditable && id && (
        <a href="/" className="create-btn">
          Create Your Own Invitation
        </a>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

export default InviteCard