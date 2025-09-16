import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Toast from './Toast'
import { validateInvite, sanitizeInviteData } from '../utils/validation'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

const createInitialFields = () => ({
  title: { value: 'You are Cordially Invited' },
  subtitle: { value: 'To attend' },
  event: { value: '', placeholder: '[Event Name]' },
  from: { value: '', label: 'From:', placeholder: '[Your Name/Organization]' },
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
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      setLoading(true)
      setIsEditable(false)
      setNotFound(false)
      fetchInvite(id)
    } else {
      setFields(createInitialFields())
      setIsEditable(true)
      setLoading(false)
      setNotFound(false)
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
          setNotFound(true)
          setToast({ message: 'Invitation not found', type: 'error' })
        }
      } else {
        setNotFound(true)
        setToast({ message: 'Invitation not found', type: 'error' })
      }
    } catch {
      setNotFound(true)
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
    // Validate before sharing
    const validation = validateInvite(fields)
    if (!validation.success) {
      const firstError = validation.errors[0]
      setToast({ message: firstError.message, type: 'error' })
      return
    }

    // Check if event name is filled
    if (!fields.event.value.trim()) {
      setToast({ message: 'Please enter an event name', type: 'error' })
      return
    }

    setSharing(true)
    const id = hashInvite(fields)
    
    try {
      const sanitizedData = sanitizeInviteData({ ...fields, createdAt: new Date().toISOString() })
      const response = await fetch(`${FIREBASE_URL}/invites/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      })
      
      if (response.ok) {
        // Use path-based URL for sharing
        const shareUrl = `${window.location.origin}/invite/${id}`
        await navigator.clipboard.writeText(shareUrl)
        setToast({ message: 'Link copied to clipboard!', type: 'success' })
        
        // Navigate using path-based routing
        navigate(`/invite/${id}`)
      }
    } catch {
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


  const renderEditableHighlight = (fieldKey) => {
    const field = fields[fieldKey]
    
    if (isEditable) {
      return (
        <div className="relative inline-block min-w-[100px] sm:min-w-[120px] max-w-full group">
          <input
            type="text"
            className="bg-white border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 font-medium text-center w-full outline-none transition-all duration-200 hover:border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:shadow-sm placeholder:text-gray-400 text-sm sm:text-base"
            value={field.value}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(fieldKey, 'value', e.target.value)}
          />
          {/* Subtle edit indicator */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
      )
    }
    return (
      <span className="bg-gray-50 border border-gray-100 px-3 sm:px-4 py-2 rounded-lg font-medium inline-block min-w-[100px] sm:min-w-[120px] transition-all duration-200 text-sm sm:text-base">
        {field.value}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white p-6 sm:p-8 md:p-12 max-w-xl mx-4 sm:mx-auto my-6 sm:my-8 md:my-16 text-center rounded-2xl shadow-xl border border-gray-100 animate-slide-up">
        <h1 className="font-playfair text-3xl md:text-4xl font-semibold mb-4 text-gray-800">You are Cordially Invited</h1>
        <p className="text-gray-600 mb-10 font-light text-lg">To attend</p>
        <div className="h-9 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-shimmer mb-10 mx-auto w-52" style={{ backgroundSize: '200% 100%' }}></div>
        <div className="flex flex-col gap-4 mb-10">
          <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-shimmer mx-auto w-72" style={{ backgroundSize: '200% 100%' }}></div>
          <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-shimmer mx-auto w-48" style={{ backgroundSize: '200% 100%' }}></div>
          <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-shimmer mx-auto w-44" style={{ backgroundSize: '200% 100%' }}></div>
        </div>
        <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg animate-shimmer mx-auto w-60" style={{ backgroundSize: '200% 100%' }}></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="bg-white p-6 sm:p-8 md:p-12 max-w-xl mx-4 sm:mx-auto my-6 sm:my-8 md:my-16 text-center rounded-2xl shadow-xl border border-gray-100 animate-slide-up">
        <div className="text-6xl mb-6">🎉❓</div>
        <h1 className="font-playfair text-3xl md:text-4xl font-semibold mb-4 text-gray-800">Invitation Not Found</h1>
        <p className="text-gray-600 mb-10 text-lg">This invitation doesn't exist or may have been removed.</p>
        <a 
          href="/" 
          className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-4 focus:ring-green-500/30 focus:outline-none"
        >
          Create Your Own Invitation
        </a>
      </div>
    )
  }

  return (
    <>
      {id && fields.event.value && (
        <Helmet>
          <title>Invitation: {fields.event.value}</title>
          <meta property="og:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="og:description" content={`${fields.from.value ? `From ${fields.from.value} - ` : ''}${fields.date.value} at ${fields.time.value} - ${fields.location.value}`} />
          <meta property="twitter:title" content={`Invitation: ${fields.event.value}`} />
          <meta property="twitter:description" content={`${fields.from.value ? `From ${fields.from.value} - ` : ''}${fields.date.value} at ${fields.time.value}`} />
        </Helmet>
      )}
      
      <div className="bg-white p-6 sm:p-8 md:p-12 max-w-xl mx-4 sm:mx-auto my-6 sm:my-8 md:my-16 text-center rounded-2xl shadow-xl border border-gray-100 animate-slide-up">
        {isEditable ? (
          <div className="group relative mb-4">
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
              <input
                type="text"
                className="bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:bg-white focus:rounded-lg focus:px-3 focus:py-2 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-200 text-center w-full placeholder:text-gray-400 text-2xl sm:text-3xl md:text-4xl font-playfair font-semibold"
                value={fields.title.value}
                placeholder={fields.title.placeholder || 'You are Cordially Invited'}
                onChange={(e) => handleFieldChange('title', 'value', e.target.value)}
              />
            </h1>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        ) : (
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-gray-800">{fields.title.value}</h1>
        )}
        
        {isEditable ? (
          <div className="group relative mb-10">
            <p className="text-gray-600 font-light text-base sm:text-lg">
              <input
                type="text"
                className="bg-transparent border-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:bg-white focus:rounded-lg focus:px-3 focus:py-2 focus:ring-2 focus:ring-green-500/20 outline-none transition-all duration-200 text-center w-full placeholder:text-gray-400 text-base sm:text-lg font-light"
                value={fields.subtitle.value}
                placeholder={fields.subtitle.placeholder || 'To attend'}
                onChange={(e) => handleFieldChange('subtitle', 'value', e.target.value)}
              />
            </p>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        ) : (
          <p className="text-gray-600 mb-10 font-light text-base sm:text-lg">{fields.subtitle.value}</p>
        )}
        
        <div className="text-xl sm:text-2xl my-8 sm:my-10 text-gray-800 font-semibold">
          {renderEditableHighlight('event')}
        </div>

        <div className="flex flex-col gap-4 my-10">
          {/* From Field */}
          {(isEditable || fields.from.value) && (
            <div className="flex items-center justify-center gap-3 text-gray-700">
              {isEditable ? (
                <div className="group relative">
                  <input
                    type="text"
                    className="bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-all duration-200 text-right min-w-[4rem] px-2 py-1 placeholder:text-gray-400"
                    value={fields.from.label}
                    onChange={(e) => handleFieldChange('from', 'label', e.target.value)}
                    placeholder="From:"
                  />
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              ) : (
                <span className="text-gray-600 font-medium">{fields.from.label}</span>
              )}
              {renderEditableHighlight('from')}
            </div>
          )}
          
          {/* Location Field */}
          <div className="flex items-center justify-center gap-3 text-gray-700">
            {isEditable ? (
              <div className="group relative">
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-all duration-200 text-right min-w-[5rem] px-2 py-1 placeholder:text-gray-400"
                  value={fields.location.label}
                  onChange={(e) => handleFieldChange('location', 'label', e.target.value)}
                  placeholder="Location:"
                />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ) : (
              <span className="text-gray-600 font-medium">{fields.location.label}</span>
            )}
            {renderEditableHighlight('location')}
          </div>
          
          {/* Date Field */}
          <div className="flex items-center justify-center gap-3 text-gray-700">
            {isEditable ? (
              <div className="group relative">
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-all duration-200 text-right min-w-[3rem] px-2 py-1 placeholder:text-gray-400"
                  value={fields.date.label}
                  onChange={(e) => handleFieldChange('date', 'label', e.target.value)}
                  placeholder="Date:"
                />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ) : (
              <span className="text-gray-600 font-medium">{fields.date.label}</span>
            )}
            {renderEditableHighlight('date')}
          </div>
          
          {/* Time Field */}
          <div className="flex items-center justify-center gap-3 text-gray-700">
            {isEditable ? (
              <div className="group relative">
                <input
                  type="text"
                  className="bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-green-500 focus:ring-0 outline-none transition-all duration-200 text-right min-w-[3rem] px-2 py-1 placeholder:text-gray-400"
                  value={fields.time.label}
                  onChange={(e) => handleFieldChange('time', 'label', e.target.value)}
                  placeholder="Time:"
                />
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ) : (
              <span className="text-gray-600 font-medium">{fields.time.label}</span>
            )}
            {renderEditableHighlight('time')}
          </div>
        </div>

        <div className="mt-10 text-sm italic text-gray-600">
          {renderEditableHighlight('footer')}
        </div>
      </div>

      {/* Fixed action buttons with proper spacing */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none">
        <div className="max-w-xl mx-auto flex justify-center sm:justify-end pointer-events-auto">
          {isEditable && !id && (
            <button 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-2xl font-medium cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-4 focus:ring-green-500/30 focus:outline-none text-sm sm:text-base"
              onClick={handleShare} 
              disabled={sharing}
            >
              {sharing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="hidden sm:inline">Creating invitation...</span>
                  <span className="sm:hidden">Creating...</span>
                </span>
              ) : (
                <span>
                  <span className="hidden sm:inline">Generate Share Link</span>
                  <span className="sm:hidden">Share Link</span>
                </span>
              )}
            </button>
          )}

          {!isEditable && id && (
            <a 
              href="/" 
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-2xl font-medium no-underline inline-block transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 focus:ring-4 focus:ring-gray-500/30 focus:outline-none text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Create Your Own Invitation</span>
              <span className="sm:hidden">Create Invitation</span>
            </a>
          )}
        </div>
      </div>
      
      {/* Add bottom padding to prevent content overlap */}
      <div className="h-24"></div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  )
}

export default InviteCard