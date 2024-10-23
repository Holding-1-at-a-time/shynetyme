'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { Slider } from './ui/slider'
import { toast } from './ui/use-toast'
import { z } from 'zod'

interface PriceFactor {
  name: string
  description: string
  value: number
  icon: React.ReactNode
}

interface Assessment {
  id: string
  images: string[]
  vehicleType: string
  interiorCondition: number
  exteriorCondition: number
  services: string[]
  availableServices: {
    name: string
    price: number
  }[]
  basePrice: number
  aiAnalysis?: {
    bodyType: string
    damageAreas: string[]
    cleanlinessLevel: string
    recommendedServices: string[]
    confidenceScore: number
  }
}

interface DynamicPricingEstimateProps {
  assessment: Assessment
  onApprove: (totalPrice: number, selectedServices: string[]) => void
  onModify: (selectedServices: string[]) => void
}

const assessmentSchema = z.object({
  id: z.string(),
  images: z.array(z.string().url()),
  vehicleType: z.enum(['sedan', 'suv', 'truck', 'van', 'sports', 'luxury']),
  interiorCondition: z.number().min(0).max(100),
  exteriorCondition: z.number().min(0).max(100),
  services: z.array(z.string()),
  availableServices: z.array(z.object({
    name: z.string(),
    price: z.number().positive(),
  })),
  basePrice: z.number().positive(),
  aiAnalysis: z.object({
    bodyType: z.string(),
    damageAreas: z.array(z.string()),
    cleanlinessLevel: z.string(),
    recommendedServices: z.array(z.string()),
    confidenceScore: z.number().min(0).max(1),
  }).optional(),
});

export function DynamicPricingEstimate({ assessment, onApprove, onModify }: DynamicPricingEstimateProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(assessment.services)
  const [totalPrice, setTotalPrice] = useState<number>(assessment.basePrice)
  const [isLoading, setIsLoading] = useState(false)

  const calculateEstimatedPrice = useMutation(api.pricing.calculateEstimatedPrice)
  const pricingModel = useQuery(api.pricing.getPricingModel)

  useEffect(() => {
    try {
      assessmentSchema.parse(assessment);
    } catch (error) {
      console.error("Invalid assessment data:", error);
      toast({
        title: "Invalid Data",
        description: "There was an issue with the assessment data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    updateTotalPrice()
  }, [selectedServices, assessment])

  const updateTotalPrice = async () => {
    if (!pricingModel) return

    setIsLoading(true)
    try {
      const estimatedPrice = await calculateEstimatedPrice({
        vehicleType: assessment.vehicleType,
        interiorCondition: assessment.interiorCondition,
        exteriorCondition: assessment.exteriorCondition,
      })

      const servicesCost = selectedServices.reduce((total, service) => {
        const servicePrice = assessment.availableServices.find(s => s.name === service)?.price || 0
        return total + servicePrice
      }, 0)

      setTotalPrice(estimatedPrice + servicesCost)
    } catch (error) {
      console.error("Error calculating price:", error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the price. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    )
  }

  const priceFactors: PriceFactor[] = [
    { name: 'Vehicle Type', description: assessment.vehicleType, value: assessment.basePrice, icon: '🚗' },
    { name: 'Interior Condition', description: `${assessment.interiorCondition}% Clean`, value: 0, icon: '🧼' },
    { name: 'Exterior Condition', description: `${assessment.exteriorCondition}% Clean`, value: 0, icon: '✨' },
  ]

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Dynamic Pricing Estimate</CardTitle>
        <CardDescription>Based on your vehicle assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {priceFactors.map((factor, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{factor.icon}</span>
                  <div>
                    <p className="font-medium">{factor.name}</p>
                    <p className="text-sm text-gray-500">{factor.description}</p>
                  </div>
                </div>
                <p className="font-semibold">${factor.value.toFixed(2)}</p>
              </div>
            ))}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Additional Services</h3>
              {assessment.availableServices.map((service, index) => (
                <div key={index} className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedServices.includes(service.name)}
                      onCheckedChange={() => handleServiceToggle(service.name)}
                    />
                    <span>{service.name}</span>
                  </div>
                  <span>${service.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold">Total Estimate</h3>
              <p className="text-3xl font-bold">${totalPrice.toFixed(2)}</p>
            </div>

            <div className="flex justify-between mt-6">
              <Button onClick={() => onModify(selectedServices)} variant="outline">Modify</Button>
              <Button onClick={() => onApprove(totalPrice, selectedServices)}>Approve Estimate</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
