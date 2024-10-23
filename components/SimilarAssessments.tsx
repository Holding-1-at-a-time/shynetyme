'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface SimilarAssessmentsProps {
  assessment: {
    id: string
    vehicleType: string
    interiorCondition: number
    exteriorCondition: number
  }
}

export function SimilarAssessments({ assessment }: SimilarAssessmentsProps) {
  const similarAssessments = useQuery(api.pricing.getSimilarAssessments, {
    vehicleType: assessment.vehicleType,
    interiorCondition: assessment.interiorCondition,
    exteriorCondition: assessment.exteriorCondition,
  })

  const assessmentDetails = useQuery(api.assessments.getAssessment, { assessmentId: assessment.id })

  if (!similarAssessments || !assessmentDetails) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Similar Assessments</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similarAssessments.map((similar) => (
          <Card key={similar._id}>
            <CardHeader>
              <CardTitle>{similar.vehicleType}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Interior Condition: {similar.interiorCondition}</p>
              <p>Exterior Condition: {similar.exteriorCondition}</p>
              <p>Estimated Price: ${similar.estimatedPrice.toFixed(2)}</p>
              {similar.actualPrice && (
                <p>Actual Price: ${similar.actualPrice.toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
