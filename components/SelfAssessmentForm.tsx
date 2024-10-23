'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ImageUpload } from './ImageUpload'
import { ConditionSlider } from './ConditionSlider'
import { VehicleTypeSelect } from '../src/components/VehicleTypeSelect'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { useToast } from './ui/use-toast'

interface SelfAssessmentFormProps {
  step: number
  assessment: {
    images: string[]
    vehicleType: string
    interiorCondition: number
    exteriorCondition: number
  }
  onStepChange: (step: number) => void
  onAssessmentChange: (assessment: Partial<typeof assessment>) => void
  onAssessmentComplete: (estimatedPrice: number) => void
}

export function SelfAssessmentForm({
  step,
  assessment,
  onStepChange,
  onAssessmentChange,
  onAssessmentComplete,
}: SelfAssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAssessment = useMutation(api.assessments.createAssessment)
  const { toast } = useToast()

  const handleNext = () => {
    onStepChange(step + 1)
  }

  const handlePrevious = () => {
    onStepChange(step - 1)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await createAssessment(assessment)
      toast({
        title: "Assessment submitted",
        description: "Your vehicle assessment has been successfully submitted.",
      })
      onAssessmentComplete(result.estimatedPrice)
    } catch (error) {
      console.error('Error submitting assessment:', error)
      toast({
        title: "Error",
        description: "There was an error submitting your assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* ... (rest of the component remains the same) ... */}
    </div>
  )
}
