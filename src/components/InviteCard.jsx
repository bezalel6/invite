import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Toast from './Toast'
import './InviteCard.css'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

const createInitialFields = () => ({
  title: { value: 'You are Cordially Invited' },
  subtitle: { value: 'To attend' },
  event: { value: '', placeholder: '[Event Name]' },
  location: { value: '', label: 'Location:', placeholder: '[Venue/Address]' },
  date: { value: '', label: 'Date:', placeholder: '[Day, Month Date, Year]' },
  time: { value: '', label: 'Time:', placeholder: '[Start Time - End Time]' },
  footer: { value: '', placeholder: '[Additional Information]' }
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
        // Use path-based URL for better social media sharing
        const shareUrl = `${window.location.origin}/invite/${id}`
        await navigator.clipboard.writeText(shareUrl)
        setToast({ message: 'Link copied to clipboard!', type: 'success' })
        
        // Navigate using hash routing for SPA
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

  const renderEditableText = (fieldKey, className, part = 'value') => {
    const field = fields[fieldKey]
    
    if (isEditable) {
      return (
        <input
          type="text"
          className={`editable-${className}`}
          value={field[part]}
          placeholder={field.placeholder || field[part]}
          onChange={(e) => handleFieldChange(fieldKey, part, e.target.value)}
        />
      )
    }
    
    // For non-editable mode, don't show labels that are empty
    if (part === 'label' && !field[part]) return null
    
    return <span className={className}>{field[part]}</span>
  }

  const renderEditableHighlight = (fieldKey) => {
    const field = fields[fieldKey]
    
    if (isEditable) {
      return (
        <input
          type="text"
          className="highlight"
          value={field.value}
          placeholder={field.placeholder}
          onChange={(e) => handleFieldChange(fieldKey, 'value', e.target.value)}
        />
      )
    }
    return <span className="highlight">{field.value}</span>
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
      {id && fields.event.value && (
        <Helmet>
          <title>Invitation: {fields.event.value}</title>
          <meta property="og:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="og:description" content={`${fields.date.value} at ${fields.time.value} - ${fields.location.value}`} />
          <meta property="twitter:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="twitter:description" content={`${fields.date.value} at ${fields.time.value}`} />
        </Helmet>
      )}
      
      <div className="card">
        {isEditable ? (
          <h1 className="title">
            <input
              type="text"
              className="editable-title"
              value={fields.title.value}
              placeholder={fields.title.placeholder || 'You are Cordially Invited'}
              onChange={(e) => handleFieldChange('title', 'value', e.target.value)}
              style={{ display: 'block' }}
            />
          </h1>
        ) : (
          <h1 className="title">{fields.title.value}</h1>
        )}
        
        {isEditable ? (
          <p className="subtitle">
            <input
              type="text"
              className="editable-subtitle"
              value={fields.subtitle.value}
              placeholder={fields.subtitle.placeholder || 'To attend'}
              onChange={(e) => handleFieldChange('subtitle', 'value', e.target.value)}
              style={{ display: 'block' }}
            />
          </p>
        ) : (
          <p className="subtitle">{fields.subtitle.value}</p>
        )}
        
        <p className="event">
          {renderEditableHighlight('event')}
        </p>

        <div className="details">
          <span>
            {isEditable ? (
              <>
                <input
                  type="text"
                  className="editable-label"
                  value={fields.location.label}
                  onChange={(e) => handleFieldChange('location', 'label', e.target.value)}
                  style={{ width: 'auto', display: 'inline' }}
                />
                {' '}
                {renderEditableHighlight('location')}
              </>
            ) : (
              <>
                {fields.location.label} {renderEditableHighlight('location')}
              </>
            )}
          </span>
          
          <span>
            {isEditable ? (
              <>
                <input
                  type="text"
                  className="editable-label"
                  value={fields.date.label}
                  onChange={(e) => handleFieldChange('date', 'label', e.target.value)}
                  style={{ width: 'auto', display: 'inline' }}
                />
                {' '}
                {renderEditableHighlight('date')}
              </>
            ) : (
              <>
                {fields.date.label} {renderEditableHighlight('date')}
              </>
            )}
          </span>
          
          <span>
            {isEditable ? (
              <>
                <input
                  type="text"
                  className="editable-label"
                  value={fields.time.label}
                  onChange={(e) => handleFieldChange('time', 'label', e.target.value)}
                  style={{ width: 'auto', display: 'inline' }}
                />
                {' '}
                {renderEditableHighlight('time')}
              </>
            ) : (
              <>
                {fields.time.label} {renderEditableHighlight('time')}
              </>
            )}
          </span>
        </div>

        <p className="footer">
          {renderEditableHighlight('footer')}
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