'use client'

import React, { useState } from 'react'
import { Stepper, Step, StepLabel } from './ui/stepper'
import { Button } from './ui/button'
import { ImageUpload } from './ui/imageUpload'
import { Slider } from './ui/slider'
import { Input } from './ui/input'

interface SelfAssessmentFormProps {
  step: number
  assessment: Assessment | null
  onStepChange: (step: number) => void
  onAssessmentChange: (assessment: Partial<Assessment>) => void
  onAssessmentComplete: () => void
}

export function SelfAssessmentForm({
  step,
  assessment,
  onStepChange,
  onAssessmentChange,
  onAssessmentComplete,
}: SelfAssessmentFormProps) {
  const totalSteps = 3

  const handleNext = () => {
    if (step < totalSteps) {
      onStepChange(step + 1)
    } else {
      onAssessmentComplete()
    }
  }

  const handlePrevious = () => {
    if (step > 1) {
      onStepChange(step - 1)
    }
  }

  return (
    <div className="space-y-4">
      <Stepper currentStep={step} totalSteps={totalSteps} />

      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Upload Vehicle Images</h3>
          <ImageUpload
            images={assessment?.images || []}
            onChange={(images) => onAssessmentChange({ images })}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Vehicle Details</h3>
          <Input
            label="Vehicle Type"
            type="text"
            value={assessment?.vehicleType || ''}
            onChange={(e) => onAssessmentChange({ vehicleType: e.target.value })}
          />
          <Input
            label="Vehicle Description"
            type="textarea"
            value={assessment?.description || ''}
            onChange={(e) => onAssessmentChange({ description: e.target.value })}
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Rate Vehicle Condition</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1">Interior Condition</label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={assessment?.interiorCondition || 50}
                onValueChange={(value) => onAssessmentChange({ interiorCondition: value })}
              />
            </div>
            <div>
              <label className="mb-1">Exterior Condition</label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={assessment?.exteriorCondition || 50}
                onValueChange={(value) => onAssessmentChange({ exteriorCondition: value })}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button onClick={handlePrevious} disabled={step === 1}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          {step === totalSteps ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
