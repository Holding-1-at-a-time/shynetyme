export interface PricingModel {
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

export interface PredictivePricingInsights {
  recommendations: string[]
  trendAnalysis: {
    [key: string]: {
      trend: 'increasing' | 'decreasing' | 'stable'
      suggestion: string
    }
  }
}

export interface PricingAccuracy {
  accuracy: number
  totalAssessments: number
  accurateAssessments: number
}

export interface Assessment {
  id: string
  images: string[]
  vehicleType: string
  description: string
  interiorCondition: number
  exteriorCondition: number
  filthinessFactor: number
  vehicleSize?: string
  vehicleSizeFactor?: number
  luxury?: boolean
  luxurySurcharge?: number
  services: {
    [key: string]: {
      name: string
      price: number
      enabled: boolean
    }
  }
  laborCost: number
  materialCost: number
  aiAnalysis?: VehicleAnalysis
}

export interface VehicleAnalysis {
  bodyType: string
  damageAreas: string[]
  cleanlinessLevel: number
  recommendedServices: string[]
  confidenceScore: number
}
