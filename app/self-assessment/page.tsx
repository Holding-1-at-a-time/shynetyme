'use client'

import { api } from '@/convex/_generated/api'
import { VehicleAnalysis } from '@/types'
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Id } from '@/convex/_generated/dataModel'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'


interface AssessmentData {
  id: string
  images: string[]
  vehicleType: string
  interiorCondition: number
  exteriorCondition: number
  services: Record<string, boolean>
  basePrice: number
  aiAnalysis: VehicleAnalysis | undefined
}

const SelfAssessmentPage = () => {
  const { user } = useUser()
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    id: '',
    images: [],
    vehicleType: '',
    interiorCondition: 50,
    exteriorCondition: 50,
    services: {},
    basePrice: 0,
    aiAnalysis: undefined,
  })
  const { toast } = useToast()

  const createAssessment = useMutation(api.assessments.createAssessment)
  const getAssessment = useQuery(
    api.assessments.getAssessment,
    {
      assessmentId: assessmentData.id as Id<'assessments'>
    }
  )
  const updateAssessment = useMutation(api.assessments.updateAssessment)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an assessment",
        variant: "destructive",
      })
      return
    }

    const assessmentDataToSave = {
      userId: user.id,
      images: assessmentData.images,
      vehicleType: assessmentData.vehicleType,
      interiorCondition: assessmentData.interiorCondition,
      exteriorCondition: assessmentData.exteriorCondition,
    }

    const result = await createAssessment(assessmentDataToSave)
    setAssessmentData((prev) => ({ ...prev, id: result }))
  }

  return (
    <>
      <div>
        <h1>Self Assessment</h1>
        <SelfAssessmentForm
          assessment={assessmentData}
          onSubmit={handleSubmit}
        />

        {getAssessment.error && (
          <div className="mt-4 text-red-500">
            Error loading assessment: {getAssessment.error.message}
          </div>
        )}

        {getAssessment && getAssessment._state === 'loading' && (
          <div className="mt-4">Loading your assessment...</div>
        )}

        {getAssessment && getAssessment._state === 'success' && getAssessment.data && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Assessment Details</h2>
            <p><strong>Vehicle Type:</strong> {getAssessment.data.vehicleType}</p>
            <p><strong>Interior Condition:</strong> {getAssessment.data.interiorCondition}</p>
            <p><strong>Exterior Condition:</strong> {getAssessment.data.exteriorCondition}</p>
            <p><strong>Estimated Price:</strong> ${getAssessment.data.estimatedPrice}</p>
            <p><strong>Created At:</strong> {new Date(getAssessment.data.createdAt).toLocaleString()}</p>

            {getAssessment.data.aiAnalysis && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">AI Analysis</h3>
                <p>{getAssessment.data.aiAnalysis.summary}</p>
                <p>{getAssessment.data.aiAnalysis.description}</p>
                <p>{getAssessment.data.aiAnalysis.recommendations}</p>
                <p>{getAssessment.data.aiAnalysis.price}</p>
                <p>{getAssessment.data.aiAnalysis.services}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
