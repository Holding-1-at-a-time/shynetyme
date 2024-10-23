'use client'

import { useState } from 'react'
import { useAction, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

interface AiVehicleAssessmentProps {
  assessmentId: string
  images: string[]
  vehicleType: string
  interiorCondition: number
  exteriorCondition: number
  onAnalysisComplete: (analysis: any) => void
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
  const [analysis, setAnalysis] = useState<any>(null)

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
    } catch (error) {
      console.error('Error analyzing vehicle:', error)
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
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
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
          <div>
            <p>Body Type: {analysis.bodyType}</p>
            <p>Damage Areas: {analysis.damageAreas.join(', ')}</p>
            <p>Cleanliness Level: {analysis.cleanlinessLevel}</p>
            <p>Recommended Services: {analysis.recommendedServices.join(', ')}</p>
            <p>Confidence Score: {analysis.confidenceScore.toFixed(2)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
