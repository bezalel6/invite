import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Toast from './Toast'
import './InviteCard.css'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

// Initial state for a new, empty invitation form
const createInitialFields = () => ({
  event: { value: '', label: 'Event Name' },
  location: { value: '', label: 'Location' },
  date: { value: '', label: 'Date' },
  time: { value: '', label: 'Time' },
  footer: { value: '', label: 'Additional Information' }
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
      // Reset state for the creation form
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
          // Backward compatibility for old string-based data
          if (typeof data.event === 'string') {
            const migratedFields = {
              event: { value: data.event || '', label: 'Event Name' },
              location: { value: data.location || '', label: 'Location' },
              date: { value: data.date || '', label: 'Date' },
              time: { value: data.time || '', label: 'Time' },
              footer: { value: data.footer || '', label: 'Additional Information' }
            }
            setFields(migratedFields)
          } else {
            setFields(data)
          }
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

  // Simple hash function for deduplication
  const hashInvite = (data) => {
    const str = Object.values(data)
      .map(field => `${field.label}|${field.value}`)
      .join('|')
      
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substr(0, 9)
  }

  const handleShare = async () => {
    setSharing(true)
    const id = hashInvite(fields)
    
    try {
      const checkResponse = await fetch(`${FIREBASE_URL}/invites/${id}.json`)
      if (checkResponse.ok && await checkResponse.json()) {
        // Reuse existing invitation
        navigate(`/invite/${id}`)
        return
      }
      
      // Create new invitation
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
        await navigator.clipboard.writeText(shareUrl)
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
      {id && fields.event?.value && (
        <Helmet>
          <title>Invitation: {fields.event.value}</title>
          <meta property="og:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="og:description" content={`${fields.date.value} at ${fields.time.value} - ${fields.location.value}`} />
          <meta property="twitter:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="twitter:description" content={`${fields.date.value} at ${fields.time.value}`} />
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
              value={fields.event.value}
              onChange={(e) => handleFieldChange('event', 'value', e.target.value)}
              placeholder={fields.event.label}
            />
          ) : (
            <span className="highlight">{fields.event.value}</span>
          )}
        </p>

        <div className="details">
          <span>
            {isEditable ? (
              <input type="text" className="highlight label-input" value={fields.location.label} onChange={(e) => handleFieldChange('location', 'label', e.target.value)} />
            ) : (
              <>{fields.location.label}: </>
            )}
            {isEditable ? (
              <input type="text" className="highlight" value={fields.location.value} onChange={(e) => handleFieldChange('location', 'value', e.target.value)} placeholder="[Venue/Address]" />
            ) : (
              <span className="highlight">{fields.location.value}</span>
            )}
          </span>
          
          <span>
            {isEditable ? (
              <input type="text" className="highlight label-input" value={fields.date.label} onChange={(e) => handleFieldChange('date', 'label', e.target.value)} />
            ) : (
              <>{fields.date.label}: </>
            )}
            {isEditable ? (
              <input type="text" className="highlight" value={fields.date.value} onChange={(e) => handleFieldChange('date', 'value', e.target.value)} placeholder="[Day, Month Date, Year]" />
            ) : (
              <span className="highlight">{fields.date.value}</span>
            )}
          </span>
          
          <span>
            {isEditable ? (
              <input type="text" className="highlight label-input" value={fields.time.label} onChange={(e) => handleFieldChange('time', 'label', e.target.value)} />
            ) : (
              <>{fields.time.label}: </>
            )}
            {isEditable ? (
              <input type="text" className="highlight" value={fields.time.value} onChange={(e) => handleFieldChange('time', 'value', e.target.value)} placeholder="[Start Time - End Time]" />
            ) : (
              <span className="highlight">{fields.time.value}</span>
            )}
          </span>
        </div>

        <p className="footer">
          {isEditable ? (
            <input
              type="text"
              className="highlight"
              value={fields.footer.value}
              onChange={(e) => handleFieldChange('footer', 'value', e.target.value)}
              placeholder={fields.footer.label}
            />
          ) : (
            <span className="highlight">{fields.footer.value}</span>
          )}
        </p>
      </div>

      {isEditable && !id && (
        <button className="share-btn" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Creating invitation...' : 'Generate Share Link'}
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
