'use client'

import { useMemo } from 'react'

interface PricingBreakdownProps {
  assessment: {
    vehicleType: string
    interiorCondition: number
    exteriorCondition: number
  }
}

export function PricingBreakdown({ assessment }: PricingBreakdownProps) {
  const basePrice = useMemo(() => {
    switch (assessment.vehicleType) {
      case 'sedan':
        return 50
      case 'suv':
        return 70
      case 'truck':
        return 80
      case 'van':
        return 75
      case 'sports':
        return 90
      case 'luxury':
        return 100
      default:
        return 0
    }
  }, [assessment.vehicleType])

  const interiorFactor = useMemo(() => {
    return 1 + (100 - assessment.interiorCondition) / 100
  }, [assessment.interiorCondition])

  const exteriorFactor = useMemo(() => {
    return 1 + (100 - assessment.exteriorCondition) / 100
  }, [assessment.exteriorCondition])

  const totalPrice = useMemo(() => {
    return basePrice * interiorFactor * exteriorFactor
  }, [basePrice, interiorFactor, exteriorFactor])

  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-semibold mb-2">Estimated Price</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Base Price:</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Interior Condition Factor:</span>
          <span>x{interiorFactor.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Exterior Condition Factor:</span>
          <span>x{exteriorFactor.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total Estimated Price:</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
