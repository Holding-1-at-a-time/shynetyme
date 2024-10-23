import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

export const AssessmentSchema = z.object({
  userId: z.string().min(1),
  clientName: z.string().min(1).max(100),
  images: z.array(z.string().url()).min(1),
  vehicleType: z.enum(['sedan', 'suv', 'truck', 'van', 'sports', 'luxury']),
  description: z.string().max(1000),
  interiorCondition: z.number().min(0).max(100),
  exteriorCondition: z.number().min(0).max(100),
})

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input.trim())
}

export function validateAssessment(data: unknown) {
  return AssessmentSchema.parse(data)
}

export function sanitizeAndValidateAssessment(data: unknown) {
  const sanitizedData = {
    ...data,
    clientName: typeof data?.clientName === 'string' ? sanitizeInput(data.clientName) : '',
    description: typeof data?.description === 'string' ? sanitizeInput(data.description) : '',
  }
  return validateAssessment(sanitizedData)
}
