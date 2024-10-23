'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface SimilarAssessmentsProps {
  assessment: Assessment
}

interface SimilarAssessment {
  id: string
  vehicleType: string
  cleanlinessLevel: number
  totalPrice: number
  date: string
}

export function SimilarAssessments({ assessment }: SimilarAssessmentsProps) {
  const similarAssessments = useQuery(api.assessments.getSimilarAssessments, {
    vehicleType: assessment.vehicleType,
    cleanlinessLevel: assessment.cleanlinessLevel,
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        {similarAssessments && similarAssessments.length > 0 ? (
          <ul className="space-y-2">
            {similarAssessments.map((sim) => (
              <li key={sim.id} className="p-4 border rounded-md">
                <p><strong>Vehicle Type:</strong> {sim.vehicleType}</p>
                <p><strong>Cleanliness Level:</strong> {sim.cleanlinessLevel}</p>
                <p><strong>Total Price:</strong> ${sim.totalPrice}</p>
                <p><strong>Date:</strong> {new Date(sim.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No similar assessments found.</p>
        )}
      </CardContent>
    </Card>
  )
}
