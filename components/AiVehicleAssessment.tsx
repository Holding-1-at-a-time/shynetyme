'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import { useAction, useMutation } from 'convex/react'
import logger from '@/lib/logger'
import { VehicleAnalysis } from '@/types'
import { toast } from '@/hooks/use-toast'
import { Id } from "@/convex/_generated/dataModel"

interface AiVehicleAssessmentProps {
  assessmentId: Id<"assessments">
  images: string[]
  vehicleType: string
  interiorCondition: number
  exteriorCondition: number
  onAnalysisComplete: (analysis: VehicleAnalysis) => void
}

export function AiVehicleAssessment({
  assessmentId,
  images,
  vehicleType,
  interiorCondition,
  exteriorCondition,
  onAnalysisComplete,
}: AiVehicleAssessmentProps) {
  const [analysis, setAnalysis] = useState<VehicleAnalysis | null>(null)
  const updateAssessment = useMutation(api.assessments.updateAssessment)

  const handleAnalyze = async () => {
    try {
      // Implement your AI analysis logic here
      const result: VehicleAnalysis = {
        bodyType: vehicleType,
        damageAreas: [],
        cleanlinessLevel: "good",
        recommendedServices: [],
        confidenceScore: 0.95,
      }

      setAnalysis(result)
      await updateAssessment({
        assessmentId,
        updates: {
          aiAnalysis: result,
        },
      })
      onAnalysisComplete(result)
    } catch (error) {
      console.error('Error analyzing vehicle:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Vehicle Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button onClick={handleAnalyze} disabled={false} className="w-full">
            Analyze Vehicle
          </Button>
        ) : (
          <div className="space-y-2">
            <p><strong>Body Type:</strong> {analysis.bodyType}</p>
            <p><strong>Damage Areas:</strong> {analysis.damageAreas.join(', ')}</p>
            <p><strong>Cleanliness Level:</strong> {analysis.cleanlinessLevel}</p>
            <p><strong>Recommended Services:</strong> {analysis.recommendedServices.join(', ')}</p>
            <p><strong>Confidence Score:</strong> {analysis.confidenceScore.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
