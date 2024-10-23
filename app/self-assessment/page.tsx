'use client'

import { useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'
import { DynamicPricingEstimate } from '@/components/DynamicPricingEstimate'
import { useToast } from '@/components/ui/use-toast'
import { SimilarAssessments } from '@/components/SimilarAssessments'
import { AiVehicleAssessment } from '@/components/AiVehicleAssessment'

export default function SelfAssessmentPage() {
  const [step, setStep] = useState(1)
  const [assessment, setAssessment] = useState({
    images: [],
    vehicleType: '',
    interiorCondition: 50,
    exteriorCondition: 50,
    aiAnalysis: null,
  })
  const { toast } = useToast()

  const handleStepChange = (newStep: number) => {
    setStep(newStep)
  }

  const handleAssessmentChange = (newAssessment: Partial<typeof assessment>) => {
    setAssessment({ ...assessment, ...newAssessment })
  }

  const handleAssessmentComplete = () => {
    setStep(4) // Move to the pricing estimate step
  }

  const handleApproveEstimate = () => {
    // TODO: Implement booking or payment logic
    toast({
      title: "Estimate Approved",
      description: "You will be redirected to the booking page.",
    })
  }

  const handleModifyServices = () => {
    setStep(3) // Go back to the condition assessment step
  }

  const createAssessment = useMutation(api.assessments.createAssessment)
  const getAssessment = useQuery(api.assessments.getAssessment)
  const updateAssessment = useMutation(api.assessments.updateAssessment)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    // ... (keep existing submit logic)
    const { assessmentId } = await createAssessment(assessmentData)
    setAssessment({ ...assessmentData, id: assessmentId })
  }

  const handleAiAnalysisComplete = async (analysis: any) => {
    if (assessment) {
      await updateAssessment({
        assessmentId: assessment.id,
        aiAnalysis: analysis,
      })
      setAssessment((prev) => ({
        ...prev!,
        aiAnalysis: analysis,
      }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vehicle Self-Assessment</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {step < 4 ? (
          <SelfAssessmentForm
            step={step}
            assessment={assessment}
            onStepChange={handleStepChange}
            onAssessmentChange={handleAssessmentChange}
            onAssessmentComplete={handleAssessmentComplete}
          />
        ) : (
          <div>
            <AiVehicleAssessment
              assessmentId={assessment.id}
              images={assessment.images}
              vehicleType={assessment.vehicleType}
              interiorCondition={assessment.interiorCondition}
              exteriorCondition={assessment.exteriorCondition}
              onAnalysisComplete={handleAiAnalysisComplete}
            />
            <DynamicPricingEstimate
              assessment={assessment}
              onApprove={handleApproveEstimate}
              onModify={handleModifyServices}
            />
            <SimilarAssessments assessment={assessment} />
          </div>
        )}
      </div>
    </div>
  )
}
