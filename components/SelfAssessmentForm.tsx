"use client";
import React, { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useToast } from './ui/use-toast'
import { Stepper } from './ui/stepper'
import { Button } from './ui/button'
import { ImageUpload } from './ui/ImageUpload'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Assessment, VehicleType } from '@/types'
import { cn } from '@/lib/utils'

const VEHICLE_TYPES: { label: string; value: VehicleType }[] = [
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Truck', value: 'truck' },
  { label: 'Van', value: 'van' },
  { label: 'Sports Car', value: 'sports' },
  { label: 'Luxury Vehicle', value: 'luxury' },
]

interface SelfAssessmentFormProps {
  step: number
  assessment: Partial<Assessment>
  onStepChange: (step: number) => void
  onAssessmentChange: (assessment: Partial<Assessment>) => void
  onAssessmentComplete: (result: any) => void
}

export function SelfAssessmentForm({
  step,
  assessment,
  onStepChange,
  onAssessmentChange,
  onAssessmentComplete,
}: SelfAssessmentFormProps) {
  const totalSteps = 3
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAssessment = useMutation(api.assessments.createAssessment)
  const { toast } = useToast()

  const isStepValid = () => {
    switch (step) {
      case 1:
        return assessment.images && assessment.images.length > 0
      case 2:
        return assessment.vehicleType && assessment.description
      case 3:
        return typeof assessment.interiorCondition === 'number' && 
               typeof assessment.exteriorCondition === 'number'
      default:
        return false
    }
  }

  const handleNext = () => {
    if (!isStepValid()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive",
      })
      return
    }

    if (step < totalSteps) {
      onStepChange(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await createAssessment({
        ...assessment,
        description: assessment.description || '',
        userId: assessment.userId,
        clientName: assessment.clientName,
        images: assessment.images || [],
        vehicleType: assessment.vehicleType,
        interiorCondition: assessment.interiorCondition,
        exteriorCondition: assessment.exteriorCondition,
      })
      toast({
        title: "Assessment submitted",
        description: "Your vehicle assessment has been successfully submitted.",
      })
      onAssessmentComplete(result)
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

  const handlePrevious = () => {
    if (step > 1) {
      onStepChange(step - 1)
    }
  }

  const getConditionLabel = (value: number) => {
    if (value <= 25) return 'Poor'
    if (value <= 50) return 'Fair'
    if (value <= 75) return 'Good'
    return 'Excellent'
  }

  return (
    <div className="space-y-6">
      <Stepper currentStep={step} totalSteps={totalSteps} />

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload Vehicle Images</h3>
          <p className="text-sm text-muted-foreground">
            Please upload clear images of your vehicle from different angles
          </p>
          <ImageUpload
            images={assessment?.images || []}
            onChange={(images) => onAssessmentChange({ ...assessment, images })}
            maxImages={6}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vehicle Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Vehicle Type</label>
              <Select
                value={assessment?.vehicleType}
                onValueChange={(value: VehicleType) => 
                  onAssessmentChange({ ...assessment, vehicleType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Vehicle Description</label>
              <Textarea
                value={assessment?.description || ''}
                onChange={(e) => 
                  onAssessmentChange({ ...assessment, description: e.target.value })}
                placeholder="Describe any specific details about your vehicle"
                className="h-24"
              />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Rate Vehicle Condition</h3>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Interior Condition</label>
                <span className="text-sm text-muted-foreground">
                  {getConditionLabel(assessment?.interiorCondition || 50)}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={assessment?.interiorCondition || 50}
                onValueChange={(value) => 
                  onAssessmentChange({ ...assessment, interiorCondition: value })}
                className={cn(
                  "w-full",
                  assessment?.interiorCondition && assessment.interiorCondition > 75 && "accent-green-500",
                  assessment?.interiorCondition && assessment.interiorCondition <= 25 && "accent-red-500"
                )}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Exterior Condition</label>
                <span className="text-sm text-muted-foreground">
                  {getConditionLabel(assessment?.exteriorCondition || 50)}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={assessment?.exteriorCondition || 50}
                onValueChange={(value) => 
                  onAssessmentChange({ ...assessment, exteriorCondition: value })}
                className={cn(
                  "w-full",
                  assessment?.exteriorCondition && assessment.exteriorCondition > 75 && "accent-green-500",
                  assessment?.exteriorCondition && assessment.exteriorCondition <= 25 && "accent-red-500"
                )}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button 
          onClick={handlePrevious} 
          disabled={step === 1}
          variant="outline"
        >
          Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isSubmitting || !isStepValid()}
        >
          {step === totalSteps ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Next'}
        </Button>
      </div>
    </div>
  )
}
