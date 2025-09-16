import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Toast from './Toast'
import './InviteCard.css'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

// A more flexible initial state for a new, empty invitation form
const createInitialFields = () => ({
  title: { value: 'You are Cordially Invited' },
  subtitle: { value: 'To attend' },
  event: { value: '', placeholder: 'Event Name' },
  location: { value: '', label: 'Location', placeholder: 'Venue/Address' },
  date: { value: '', label: 'Date', placeholder: 'Day, Month Date, Year' },
  time: { value: '', label: 'Time', placeholder: 'Start Time - End Time' },
  footer: { value: '', placeholder: 'Additional Information' }
})

function InviteCard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!id)
  const [sharing, setSharing] = useState(false)
  const [toast, setToast] = useState(null)
  const [fields, setFields] = useState(createInitialFields())
  const [isEditable, setIsEditable] = useState(!id)

  useEffect(() => {
    if (id) {
      setLoading(true)
      setIsEditable(false)
      fetchInvite(id)
    } else {
      setFields(createInitialFields())
      setIsEditable(true)
      setLoading(false)
    }
  }, [id])

  const fetchInvite = async (inviteId) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/invites/${inviteId}.json`)
      if (response.ok) {
        const data = await response.json()
        if (data) {
          // Merge fetched data with initial state to ensure all fields are present
          const initialState = createInitialFields()
          const mergedFields = { ...initialState }
          for (const key in data) {
            if (initialState[key]) {
              mergedFields[key] = { ...initialState[key], ...data[key] }
            }
          }
          setFields(mergedFields)
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

  const hashInvite = (data) => {
    const str = Object.values(data)
      .map(field => `${field.label || ''}|${field.value}`)
      .join('|')
      
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36).substr(0, 9)
  }

  const handleShare = async () => {
    setSharing(true)
    const id = hashInvite(fields)
    
    try {
      const response = await fetch(`${FIREBASE_URL}/invites/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, createdAt: new Date().toISOString() })
      })
      
      if (response.ok) {
        await navigator.clipboard.writeText(`${window.location.origin}/#/invite/${id}`)
        navigate(`/invite/${id}`)
      }
    } catch (error) {
      setToast({ message: 'Failed to create invitation', type: 'error' })
      setSharing(false)
    }
  }

  const handleFieldChange = (field, part, value) => {
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], [part]: value }
    }))
  }

  const renderEditable = (fieldKey, className, isLabel = false) => {
    const field = fields[fieldKey]
    const part = isLabel ? 'label' : 'value'
    
    if (isEditable) {
      return (
        <input
          type="text"
          className={className}
          value={field[part]}
          placeholder={field.placeholder || field.label}
          onChange={(e) => handleFieldChange(fieldKey, part, e.target.value)}
        />
      )
    }
    return <span className={className}>{field[part]}</span>
  }

  if (loading) {
    return <div className="card"><div className="skeleton skeleton-event" /></div>
  }

  return (
    <>
      <Helmet>
        <title>Invitation: {fields.event.value || 'Create New'}</title>
      </Helmet>
      
      <div className="card">
        {renderEditable('title', 'title')}
        {renderEditable('subtitle', 'subtitle')}
        
        <div className="event">
          {renderEditable('event', 'highlight')}
        </div>

        <div className="details">
          <div className="detail-row">
            {renderEditable('location', 'label', true)}
            {renderEditable('location', 'highlight')}
          </div>
          <div className="detail-row">
            {renderEditable('date', 'label', true)}
            {renderEditable('date', 'highlight')}
          </div>
          <div className="detail-row">
            {renderEditable('time', 'label', true)}
            {renderEditable('time', 'highlight')}
          </div>
        </div>

        <div className="footer">
          {renderEditable('footer', 'highlight')}
        </div>
      </div>

      {isEditable && !id && (
        <button className="share-btn" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Creating...' : 'Generate Share Link'}
        </button>
      )}

      {!isEditable && id && (
        <a href="/" className="create-btn">Create Your Own</a>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </>
  )
}

export default InviteCard