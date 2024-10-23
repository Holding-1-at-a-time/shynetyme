'use client'

import { useState, useEffect } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from "@clerk/nextjs"
import { Assessment, VehicleType } from '@/types'
import { Id } from "@/convex/_generated/dataModel"

interface AssessmentFormData extends Required<Pick<Assessment, 
  'userId' | 
  'clientName' | 
  'images' | 
  'vehicleType' | 
  'description' | 
  'interiorCondition' | 
  'exteriorCondition'
>> {}

export default function SelfAssessmentPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [assessmentId, setAssessmentId] = useState<Id<"assessments"> | null>(null);

  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    userId: user?.id || '',
    clientName: user?.fullName || '',
    images: [],
    vehicleType: 'sedan' as VehicleType,
    description: '',
    interiorCondition: 50,
    exteriorCondition: 50,
  });

  const createAssessment = useMutation(api.assessments.createAssessment);

  useEffect(() => {
    if (user) {
      setAssessmentData(prev => ({
        ...prev,
        userId: user.id,
        clientName: user.fullName || '',
      }));
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an assessment",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createAssessment(assessmentData);
      setAssessmentId(result);
      toast({
        title: "Success",
        description: "Assessment created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assessment",
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
          onStepChange={() => {}}
          onAssessmentChange={(newData) => setAssessmentData(prev => ({ ...prev, ...newData }))}
          onAssessmentComplete={handleSubmit}
        />

        {assessmentData && (
          <div className="mt-6 p-4 border rounded-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Assessment Details</h2>
            <p><strong>Vehicle Type:</strong> {assessmentData.vehicleType}</p>
            <p><strong>Interior Condition:</strong> {assessmentData.interiorCondition}</p>
            <p><strong>Exterior Condition:</strong> {assessmentData.exteriorCondition}</p>
            {assessmentData.estimatedPrice && (
              <p><strong>Estimated Price:</strong> ${assessmentData.estimatedPrice}</p>
            )}
            {assessmentData.createdAt && (
              <p><strong>Created At:</strong> {new Date(assessmentData.createdAt).toLocaleString()}</p>
            )}

            {assessmentData.aiAnalysis && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">AI Analysis</h3>
                <p>Body Type: {assessmentData.aiAnalysis.bodyType}</p>
                <p>Damage Areas: {assessmentData.aiAnalysis.damageAreas.join(', ')}</p>
                <p>Cleanliness Level: {assessmentData.aiAnalysis.cleanlinessLevel}</p>
                <p>Recommended Services: {assessmentData.aiAnalysis.recommendedServices.join(', ')}</p>
                <p>Confidence Score: {assessmentData.aiAnalysis.confidenceScore}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
