import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

// Hardcoded fallback defaults (used when Firebase settings are not available)
const fallbackDefaultFields = [
  { id: 'title', type: 'title', value: 'You are Cordially Invited', visible: true, locked: true },
  { id: 'subtitle', type: 'subtitle', value: 'To attend', visible: true, locked: true },
  { id: 'event', type: 'event', value: '', placeholder: '[Event Name]', visible: true, required: true, locked: true },
  { id: 'from', type: 'detail', value: '', label: 'From:', placeholder: '[Your Name/Organization]', visible: false },
  { id: 'location', type: 'detail', value: '', label: 'Location:', placeholder: '[Venue/Address]', visible: true },
  { id: 'date', type: 'detail', value: '', label: 'Date:', placeholder: '[Day, Month Date, Year]', visible: true },
  { id: 'time', type: 'detail', value: '', label: 'Time:', placeholder: '[Start Time - End Time]', visible: true },
  { id: 'dresscode', type: 'detail', value: '', label: 'Dress Code:', placeholder: '[Formal/Casual/etc]', visible: false },
  { id: 'rsvp', type: 'detail', value: '', label: 'RSVP:', placeholder: '[Contact Information]', visible: false },
  { id: 'footer', type: 'footer', value: '', placeholder: '[Additional Information]', visible: true, locked: true }
]

const fallbackProtectedFields = ['title', 'subtitle', 'event', 'footer']

// Load default template from Firebase settings, falling back to hardcoded defaults
const loadDefaultTemplate = async () => {
  try {
    const response = await fetch(`${FIREBASE_URL}/settings/defaultTemplate.json`)
    if (response.ok) {
      const template = await response.json()
      if (template && Array.isArray(template.fields)) {
        return template.fields
      }
    }
  } catch (error) {
    console.warn('Failed to load default template from Firebase:', error)
  }
  
  // Fallback to hardcoded defaults
  return fallbackDefaultFields.map(f => ({ ...f }))
}

// Load protected fields from Firebase settings, falling back to hardcoded defaults
const loadProtectedFields = async () => {
  try {
    const response = await fetch(`${FIREBASE_URL}/settings/protectedFields.json`)
    if (response.ok) {
      const protectedFields = await response.json()
      if (Array.isArray(protectedFields)) {
        return protectedFields
      }
    }
  } catch (error) {
    console.warn('Failed to load protected fields from Firebase:', error)
  }
  
  // Fallback to hardcoded defaults
  return [...fallbackProtectedFields]
}

// Create initial fields with Firebase defaults (async)
const createInitialFields = async () => {
  const defaultFields = await loadDefaultTemplate()
  const protectedFields = await loadProtectedFields()
  
  // Apply protected status to fields
  return defaultFields.map(field => ({
    ...field,
    locked: protectedFields.includes(field.id) || field.locked || false
  }))
}

const hashInvite = (data) => {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).substr(0, 9)
}

export function useInvitation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true) // Always start loading to fetch defaults
  const [sharing, setSharing] = useState(false)
  const [fields, setFields] = useState([])
  const isEditable = !id || location.pathname === '/create'
  const [notFound, setNotFound] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const initializeFields = async () => {
      if (id) {
        setLoading(true)
        setNotFound(false)
        await fetchInvite(id)
      } else {
        // Load default template from Firebase for new invitations
        setLoading(true)
        try {
          const initialFields = await createInitialFields()
          setFields(initialFields)
        } catch (error) {
          console.error('Failed to load default template:', error)
          // Fallback to hardcoded defaults
          setFields(fallbackDefaultFields.map(f => ({ ...f })))
        }
        setLoading(false)
        setNotFound(false)
      }
    }

    initializeFields()
  }, [id])

  const fetchInvite = async (inviteId) => {
    try {
      const response = await fetch(`${FIREBASE_URL}/invites/${inviteId}.json`)
      if (response.ok) {
        const data = await response.json()
        if (data && data.fields) {
          setFields(data.fields)
        } else if (data) {
          // Handle old format - convert to new array format
          const convertedFields = await createInitialFields()
          Object.keys(data).forEach(key => {
            const field = convertedFields.find(f => f.id === key)
            if (field && data[key]) {
              Object.assign(field, data[key])
            }
          })
          setFields(convertedFields)
        } else {
          setNotFound(true)
        }
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
      setToast({ message: 'Failed to load invitation', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const updateField = (id, updates) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const toggleFieldVisibility = (id) => {
    setFields(fields.map(f => f.id === id ? { ...f, visible: !f.visible } : f))
  }

  const handleShare = async () => {
    const eventField = fields.find(f => f.id === 'event')
    if (!eventField?.value?.trim()) {
      setToast({ message: 'Please enter an event name', type: 'error' })
      return
    }

    setSharing(true)
    const inviteId = hashInvite(fields)
    
    try {
      const dataToSave = {
        fields,
        createdAt: new Date().toISOString()
      }
      
      const response = await fetch(`${FIREBASE_URL}/invites/${inviteId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      })
      
      if (response.ok) {
        const shareUrl = `${window.location.origin}/invite/${inviteId}`
        await navigator.clipboard.writeText(shareUrl)
        setToast({ message: 'Link copied to clipboard!', type: 'success' })
        navigate(`/invite/${inviteId}`)
      }
    } catch {
      setToast({ message: 'Failed to create invitation', type: 'error' })
      setSharing(false)
    }
  }

  return {
    fields,
    loading,
    sharing,
    isEditable,
    notFound,
    toast,
    setToast,
    updateField,
    toggleFieldVisibility,
    handleShare
  }
}