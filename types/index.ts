import { Id } from "../convex/_generated/dataModel";

export type VehicleType = "sedan" | "suv" | "truck" | "van" | "sports" | "luxury";

export interface Assessment {
  _id: Id<"assessments">;
  userId: string;
  clientName: string;
  images: string[];
  vehicleType: VehicleType;
  interiorCondition: number;
  exteriorCondition: number;
  estimatedPrice: number;
  actualPrice?: number;
  embedding: number[];
  createdAt: number;
  services: Record<string, ServiceDetail>;
  basePrice: number;
  aiAnalysis?: VehicleAnalysis;
}

export interface ServiceDetail {
  name: string;
  price: number;
  enabled: boolean;
}

export interface VehicleAnalysis {
  bodyType: string;
  damageAreas: string[];
  cleanlinessLevel: string;
  recommendedServices: string[];
  confidenceScore: number;
}

export interface PricingModel {
  basePrice: Record<VehicleType, number>;
  surcharges: {
    luxurySurcharge: number;
    filthinessFactor: number;
  };
  services: Record<string, ServiceDetail>;
  laborCost: number;
  materialCost: number;
}
