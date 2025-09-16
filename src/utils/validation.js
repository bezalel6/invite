import { z } from 'zod'

// Schema for a single field in the invitation
const InviteFieldSchema = z.object({
  value: z.string(),
  label: z.string().optional(),
  placeholder: z.string().optional()
})

// Full invitation schema
export const InviteSchema = z.object({
  title: InviteFieldSchema.refine(
    (field) => field.value.length > 0 && field.value.length <= 100,
    { message: "Title must be between 1 and 100 characters" }
  ),
  subtitle: InviteFieldSchema.refine(
    (field) => field.value.length > 0 && field.value.length <= 100,
    { message: "Subtitle must be between 1 and 100 characters" }
  ),
  event: InviteFieldSchema.refine(
    (field) => field.value.length > 0 && field.value.length <= 100,
    { message: "Event name is required and must be less than 100 characters" }
  ),
  from: InviteFieldSchema.refine(
    (field) => field.value.length <= 100,
    { message: "From field must be less than 100 characters" }
  ),
  location: InviteFieldSchema.refine(
    (field) => field.value.length <= 200,
    { message: "Location must be less than 200 characters" }
  ),
  date: InviteFieldSchema.refine(
    (field) => field.value.length <= 100,
    { message: "Date must be less than 100 characters" }
  ),
  time: InviteFieldSchema.refine(
    (field) => field.value.length <= 100,
    { message: "Time must be less than 100 characters" }
  ),
  footer: InviteFieldSchema.refine(
    (field) => field.value.length <= 300,
    { message: "Footer must be less than 300 characters" }
  ),
  createdAt: z.string().optional()
})

// Validation function with detailed error messages
export const validateInvite = (data) => {
  try {
    const validated = InviteSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      return { success: false, errors }
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation failed' }] }
  }
}

// Function to sanitize invitation data for display
export const sanitizeInviteData = (data) => {
  const escapeHtml = (str) => {
    if (!str) return ''
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const sanitizeField = (field) => {
    if (!field) return { value: '', label: '', placeholder: '' }
    return {
      value: escapeHtml(field.value || ''),
      label: escapeHtml(field.label || ''),
      placeholder: escapeHtml(field.placeholder || '')
    }
  }

  return {
    title: sanitizeField(data.title),
    subtitle: sanitizeField(data.subtitle),
    event: sanitizeField(data.event),
    from: sanitizeField(data.from),
    location: sanitizeField(data.location),
    date: sanitizeField(data.date),
    time: sanitizeField(data.time),
    footer: sanitizeField(data.footer),
    createdAt: data.createdAt || new Date().toISOString()
  }
}