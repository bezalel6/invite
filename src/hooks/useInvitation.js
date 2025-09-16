import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

const FIREBASE_URL = 'https://invites-75e19-default-rtdb.firebaseio.com'

// Load settings from Firebase only - no fallbacks
const loadSettings = async () => {
  const [templateResponse, protectedResponse] = await Promise.all([
    fetch(`${FIREBASE_URL}/settings/defaultTemplate.json`),
    fetch(`${FIREBASE_URL}/settings/protectedFields.json`)
  ])
  
  if (!templateResponse.ok || !protectedResponse.ok) {
    throw new Error('Failed to load settings from Firebase')
  }
  
  const template = await templateResponse.json()
  const protectedFields = await protectedResponse.json()
  
  if (!template || !Array.isArray(template.fields)) {
    throw new Error('Invalid template structure in Firebase')
  }
  
  if (!Array.isArray(protectedFields)) {
    throw new Error('Invalid protected fields structure in Firebase')
  }
  
  // Apply protected status to fields
  const fields = template.fields.map(field => ({
    ...field,
    locked: protectedFields.includes(field.id) || field.locked || false
  }))
  
  return fields
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
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [fields, setFields] = useState([])
  const [error, setError] = useState(null)
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
        // Load settings from Firebase - no fallbacks
        setLoading(true)
        setError(null)
        try {
          const fields = await loadSettings()
          setFields(fields)
        } catch (error) {
          console.error('Failed to load settings from Firebase:', error)
          setError('Unable to load invitation settings. Please try again later.')
        }
        setLoading(false)
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
          // Handle old format - need to load settings to get field structure
          try {
            const defaultFields = await loadSettings()
            Object.keys(data).forEach(key => {
              const field = defaultFields.find(f => f.id === key)
              if (field && data[key]) {
                Object.assign(field, data[key])
              }
            })
            setFields(defaultFields)
          } catch (error) {
            console.error('Failed to load settings for old format conversion:', error)
            setNotFound(true)
          }
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
    error,
    toast,
    setToast,
    updateField,
    toggleFieldVisibility,
    handleShare
  }
}