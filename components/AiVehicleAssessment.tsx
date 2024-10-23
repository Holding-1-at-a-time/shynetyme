'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { api } from '@/convex/_generated/api'
import { useAction, useMutation } from 'convex/react'
import logger from '@/lib/logger'
import { toast } from '@/components/ui/use-toast'

interface AiVehicleAssessmentProps {
  assessmentId: string
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<VehicleAnalysis | null>(null)

  const aiAnalyzeVehicle = useAction(api.pricing.aiAnalyzeVehicle)
  const updateAssessment = useMutation(api.assessments.updateAssessment)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const result = await aiAnalyzeVehicle({
        images,
        vehicleType,
        interiorCondition,
        exteriorCondition,
      })
      setAnalysis(result)
      await updateAssessment({
        assessmentId,
        aiAnalysis: result,
      })
      onAnalysisComplete(result)
      logger.info('AI analysis completed', { assessmentId, analysis: result })
      toast({
        title: "Success",
        description: "AI analysis completed successfully.",
      })
    } catch (error) {
      console.error('Error analyzing vehicle:', error)
      logger.error('Error analyzing vehicle', { error, assessmentId })
      toast({
        title: "Error",
        description: "Failed to analyze vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Vehicle Assessment</CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Vehicle'
            )}
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
