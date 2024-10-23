'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from "@clerk/nextjs"
import { Assessment, VehicleType } from '@/types'
import { Id } from "@/convex/_generated/dataModel"

export default function SelfAssessmentPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [assessmentId, setAssessmentId] = useState | undefined>(undefined);

  const [assessmentData, setAssessmentData] = useState<Partial<Assessment>>({
    images: [],
    vehicleType: 'sedan' as VehicleType,
    interiorCondition: 50,
    exteriorCondition: 50,
    services: {},
    basePrice: 0,
  });

  const createAssessment = useMutation(api.assessments.createAssessment);
  const assessment = useQuery(
    api.assessments.getAssessment,
    assessmentId ? { assessmentId } : "skip"
  );

  /**
   * Handle the assessment completion.
   * Create a new assessment in the database and
   * display a toast message with the result.
   */
  const handleAssessmentComplete = async () => {
    if (!user) {
      // If user is not logged in, display an error toast.
      toast({
        title: "Error",
        description: "You must be logged in to create an assessment",
        variant: "destructive",
      });
      return;
    }

    // Try to create a new assessment in the database.
    try {
      const assessmentToCreate: Partial<Assessment> = {
        userId: user.id,
        clientName: user.fullName || 'Anonymous',
        images: assessmentData.images || [],
        vehicleType: assessmentData.vehicleType as VehicleType,
        description: assessmentData.description || '',
        interiorCondition: assessmentData.interiorCondition || 50,
        exteriorCondition: assessmentData.exteriorCondition || 50,
      };  

      const result = await ctx.createAssessment();
      setAssessmentId(result);
      toast({
        title: "Success", 
        description: "Assessment created successfully",
      });
    } catch (error) {
      // If there is an error, display an error toast.
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "There was an error creating your assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vehicle Self-Assessment</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <SelfAssessmentForm
          assessment={assessmentData}
          step={1}
          onStepChange={() => { }}
          onAssessmentChange={setAssessmentData}
          onAssessmentComplete={handleAssessmentComplete}
        />

        {assessment && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Assessment Details</h2>
            <p><strong>Vehicle Type:</strong> {assessment.vehicleType}</p>
            <p><strong>Interior Condition:</strong> {assessment.interiorCondition}</p>
            <p><strong>Exterior Condition:</strong> {assessment.exteriorCondition}</p>
            <p><strong>Estimated Price:</strong> ${assessment.estimatedPrice}</p>
            <p><strong>Created At:</strong> {new Date(assessment.createdAt).toLocaleString()}</p>

            {assessment.aiAnalysis && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">AI Analysis</h3>
                <p>Body Type: {assessment.aiAnalysis.bodyType}</p>
                <p>Damage Areas: {assessment.aiAnalysis.damageAreas.join(', ')}</p>
                <p>Cleanliness Level: {assessment.aiAnalysis.cleanlinessLevel}</p>
                <p>Recommended Services: {assessment.aiAnalysis.recommendedServices.join(', ')}</p>
                <p>Confidence Score: {assessment.aiAnalysis.confidenceScore}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
