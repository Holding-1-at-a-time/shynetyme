'use client'

import { useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SelfAssessmentForm } from '@/components/SelfAssessmentForm'
import { DynamicPricingEstimate } from '@/components/DynamicPricingEstimate'
import { useToast } from '@/components/ui/use-toast'
import { SimilarAssessments } from '@/components/SimilarAssessments'
import { AiVehicleAssessment } from '@/components/AiVehicleAssessment'
import { VehicleAnalysis } from '@/types'
import { useUser } from "@clerk/nextjs";

export default function SelfAssessmentPage() {
  const { user } = useUser();
  const [assessment, setAssessment] = useState({
    id: '',
    images: [],
    vehicleType: '',
    interiorCondition: 50,
    exteriorCondition: 50,
    services: {},
    basePrice: 0,
    aiAnalysis: undefined as VehicleAnalysis | undefined,
  });
  const { toast } = useToast();

  const createAssessment = useMutation(api.assessments.createAssessment);
  const getAssessment = useQuery(api.assessments.getAssessment, { 
    assessmentId: assessment.id as Id<"assessments"> 
  });
  const updateAssessment = useMutation(api.assessments.updateAssessment);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an assessment",
        variant: "destructive",
      });
      return;
    }

    const assessmentData = {
      userId: user.id,
      images: assessment.images,
      vehicleType: assessment.vehicleType,
      interiorCondition: assessment.interiorCondition,
      exteriorCondition: assessment.exteriorCondition,
    };

    const result = await createAssessment(assessmentData);
    setAssessment(prev => ({ ...prev, id: result }));
  };

  // ... rest of the component
}
