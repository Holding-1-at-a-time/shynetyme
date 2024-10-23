'use client'

import { useState, useEffect } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { PricingInputSection } from './PricingInputSection'
import { AnalyticsSection } from './AnalyticsSection'
import { AiRecommendationsPanel } from './AiRecommendationsPanel'
import logger from '@/lib/logger'
import { toast } from '@/components/ui/use-toast'

interface PricingModel {
  basePrice: {
    sedan: number
    suv: number
    truck: number
    van: number
    sports: number
    luxury: number
  }
  surcharges: {
    luxurySurcharge: number
    filthinessFactor: number
  }
  services: {
    [key: string]: {
      name: string
      price: number
      enabled: boolean
    }
  }
  laborCost: number
  materialCost: number
}

interface PredictivePricingInsights {
  recommendations: string[]
  trendAnalysis: {
    [key: string]: {
      trend: 'increasing' | 'decreasing' | 'stable'
      suggestion: string
    }
  }
}

interface PricingAccuracy {
  accuracy: number
  totalAssessments: number
  accurateAssessments: number
}

export function PricingDashboard() {
  const [pricingModel, setPricingModel] = useState<PricingModel>({
    basePrice: {
      sedan: 50,
      suv: 70,
      truck: 80,
      van: 75,
      sports: 90,
      luxury: 100,
    },
    surcharges: {
      luxurySurcharge: 20,
      filthinessFactor: 10,
    },
    services: {
      interiorCleaning: { name: 'Interior Cleaning', price: 30, enabled: true },
      exteriorCleaning: { name: 'Exterior Cleaning', price: 40, enabled: true },
      waxing: { name: 'Waxing', price: 50, enabled: true },
    },
    laborCost: 25,
    materialCost: 10,
  })
  const [insights, setInsights] = useState<PredictivePricingInsights | null>(null)
  const [accuracy, setAccuracy] = useState<PricingAccuracy | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updatePricingModel = useMutation(api.pricing.updatePricingModel)
  const getPredictivePricingInsights = useAction(api.pricing.getPredictivePricingInsights)
  const getPricingAccuracy = useQuery(api.pricing.getPricingAccuracy)

  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true)
      try {
        const fetchedInsights = await getPredictivePricingInsights()
        setInsights(fetchedInsights)
        logger.info('Fetched predictive pricing insights', { insights: fetchedInsights });
      } catch (error) {
        logger.error('Error fetching predictive pricing insights', { error });
        console.error('Error fetching predictive pricing insights:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, [getPredictivePricingInsights])

  useEffect(() => {
    if (getPricingAccuracy) {
      setAccuracy(getPricingAccuracy)
    }
  }, [getPricingAccuracy])

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      await updatePricingModel(pricingModel)
      logger.info('Pricing model updated', { pricingModel })
      toast({
        title: "Success",
        description: "Pricing model updated successfully.",
      })
    } catch (error) {
      logger.error('Error updating pricing model', { error })
      toast({
        title: "Error",
        description: "Failed to update pricing model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyRecommendation = async (recommendation: string) => {
    try {
      // Implement logic to apply the recommendation
      console.log(`Applying recommendation: ${recommendation}`)
      // After applying, refetch the insights
      const updatedInsights = await getPredictivePricingInsights()
      setInsights(updatedInsights)
      toast({
        title: "Recommendation Applied",
        description: "The recommendation has been applied successfully.",
      })
    } catch (error) {
      logger.error('Failed to apply recommendation', { error })
      toast({
        title: "Error",
        description: "Failed to apply recommendation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PricingInputSection
              pricingModel={pricingModel}
              onChange={setPricingModel}
            />
            <AnalyticsSection analytics={accuracy} />
          </div>
          <Button onClick={handleSaveChanges} className="mt-4 w-full md:w-auto">Save Changes</Button>
        </CardContent>
      </Card>
      
      {insights && (
        <AiRecommendationsPanel
          recommendations={insights.recommendations}
          onApply={handleApplyRecommendation}
        />
      )}
      
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}
    </div>
  )
}
