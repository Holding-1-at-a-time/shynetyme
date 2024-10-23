'use client'

import { PricingDashboard } from '@/components/PricingDashboard'
import { AiRecommendationsPanel } from '@/components/AiRecommendationsPanel'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const getPredictivePricingInsights = useAction(api.pricing.getPredictivePricingInsights)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleApplyRecommendation = async (recommendation: string) => {
    try {
      // Implement the logic to apply the recommendation
      console.log(`Applying recommendation: ${recommendation}`)
      // After applying, refetch the insights
      const updatedInsights = await getPredictivePricingInsights()
      setRecommendations(updatedInsights.recommendations)
    } catch (err) {
      console.error('Failed to apply recommendation:', err)
      setError('Failed to apply recommendation. Please try again.')
    }
  }

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const insights = await getPredictivePricingInsights()
        setRecommendations(insights.recommendations)
      } catch (err) {
        console.error('Failed to fetch insights:', err)
        setError('Failed to load recommendations.')
      }
    }
    fetchInsights()
  }, [getPredictivePricingInsights])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Solopreneur Dashboard</h1>
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PricingDashboard />
        </div>
        <div>
          <AiRecommendationsPanel
            recommendations={recommendations}
            onApply={handleApplyRecommendation}
          />
        </div>
      </div>
    </div>
  )
}
