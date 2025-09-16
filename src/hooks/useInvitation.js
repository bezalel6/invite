import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

const allPredefinedFields = [
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

const createInitialFields = () => allPredefinedFields.map(f => ({ ...f }))

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
  const [loading, setLoading] = useState(!!id)
  const [sharing, setSharing] = useState(false)
  const [fields, setFields] = useState(createInitialFields())
  const isEditable = !id || location.pathname === '/create'
  const [notFound, setNotFound] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (id) {
      setLoading(true)
      setNotFound(false)
      fetchInvite(id)
    } else {
      setFields(createInitialFields())
      setLoading(false)
      setNotFound(false)
    }
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
          const convertedFields = createInitialFields()
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