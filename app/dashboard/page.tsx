'use client'

import { PricingDashboard } from '@/components/PricingDashboard'
import { AiRecommendationsPanel } from '@/components/AiRecommendationsPanel'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function DashboardPage() {
  const getPredictivePricingInsights = useAction(api.pricing.getPredictivePricingInsights)

  const handleApplyRecommendation = async (recommendation: string) => {
    // Here you would implement the logic to apply the recommendation
    // This might involve updating the pricing model or other relevant data
    console.log(`Applying recommendation: ${recommendation}`)
    // After applying the recommendation, you might want to refetch the insights
    const updatedInsights = await getPredictivePricingInsights()
    // Update your state with the new insights
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Solopreneur Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <PricingDashboard />
        </div>
        <div>
          <AiRecommendationsPanel
            recommendations={[
              "Decrease SUV surcharge to remain competitive in your region",
              "Add an extra charge for vehicles larger than 7 seats",
              "Increase your base price for luxury vehicles by 5%"
            ]}
            onApply={handleApplyRecommendation}
          />
        </div>
      </div>
    </div>
  )
}
