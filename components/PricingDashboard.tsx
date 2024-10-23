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
    try {
      await updatePricingModel(pricingModel)
      logger.info('Pricing model updated', { pricingModel });
      // Show success message using toast
    } catch (error) {
      logger.error('Error updating pricing model', { error });
      // Show error message using toast
    }
  }

  const handleApplyRecommendation = async (recommendation: string) => {
    // Implement logic to apply the recommendation
    // This might involve updating the pricing model
    console.log(`Applying recommendation: ${recommendation}`)
    // After applying the recommendation, refetch the insights
    const updatedInsights = await getPredictivePricingInsights()
    setInsights(updatedInsights)
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
          <Button onClick={handleSaveChanges} className="mt-4">Save Changes</Button>
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
