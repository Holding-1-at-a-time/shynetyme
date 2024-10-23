import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { pricingChain } from "../lib/ollama";
import { Doc, Id } from "./_generated/dataModel";
import { ConvexError } from "convex/values";
import logger from '../lib/logger';

// Add these new functions
export const getPricingAnalytics = query({
  handler: async (ctx) => {
    // Implement your pricing analytics logic here
    // For now, we'll return a mock object
    return {
      totalRevenue: 10000,
      averageOrderValue: 150,
      popularServices: ["exterior cleaning", "interior detailing"],
    };
  },
});

export const getCurrentPricingModel = query({
  handler: async (ctx) => {
    return await ctx.db.query("pricingModels").order("desc").first();
  },
});

export const getPredictivePricingInsights = action({
  handler: async (ctx): Promise<PredictivePricingInsights> => {
    const historicalData = await ctx.runQuery(api.pricing.getPricingAnalytics);
    const currentPricingModel = await ctx.runQuery(api.pricing.getCurrentPricingModel);

    // Prepare input for Ollama
    const input = JSON.stringify({
      historicalData,
      currentPricingModel,
    });

    // Get AI-driven insights
    const aiInsights = await pricingChain.invoke({
      input,
      task: "generate_pricing_insights",
    });

    const insights: PredictivePricingInsights = JSON.parse(aiInsights);
    return insights;
  },
});

export const getPricingAccuracy = query({
  handler: async (ctx): Promise<PricingAccuracy> => {
    const assessments = await ctx.db.query("assessments").collect();
    const totalAssessments = assessments.length;
    const accurateAssessments = assessments.filter(a => 
      a.actualPrice !== undefined && 
      Math.abs(a.estimatedPrice - a.actualPrice) / a.actualPrice <= 0.1
    ).length;

    const accuracy = totalAssessments > 0 ? (accurateAssessments / totalAssessments) * 100 : 0;
    
    return {
      accuracy,
      totalAssessments,
      accurateAssessments,
    };
  },
});

const vehicleTypeSchema = v.union(
  v.literal("sedan"),
  v.literal("suv"),
  v.literal("truck"),
  v.literal("van"),
  v.literal("sports"),
  v.literal("luxury")
);

export const calculateEstimatedPrice = mutation({
  args: {
    vehicleType: vehicleTypeSchema,
    interiorCondition: v.number(),
    exteriorCondition: v.number(),
    services: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<number> => {
    const { vehicleType, interiorCondition, exteriorCondition, services } = args;

    logger.info('Calculating estimated price', { vehicleType, interiorCondition, exteriorCondition, services });

    // Input validation
    if (interiorCondition < 0 || interiorCondition > 100 || exteriorCondition < 0 || exteriorCondition > 100) {
      logger.warn('Invalid condition values', { interiorCondition, exteriorCondition });
      throw new ConvexError("Condition values must be between 0 and 100");
    }

    const pricingModel = await ctx.db.query("pricingModels").first();
    if (!pricingModel) {
      logger.error('Pricing model not found');
      throw new ConvexError("Pricing model not found");
    }

    const basePrice = pricingModel.basePrice[vehicleType] || 0;
    const interiorFactor = 1 + (100 - interiorCondition) / 100;
    const exteriorFactor = 1 + (100 - exteriorCondition) / 100;

    let totalPrice = basePrice * interiorFactor * exteriorFactor;

    // Add prices for selected services
    for (const service of services) {
      if (pricingModel.services[service] && pricingModel.services[service].enabled) {
        totalPrice += pricingModel.services[service].price;
      }
    }

    // Apply surcharges
    if (pricingModel.surcharges.luxurySurcharge && ['luxury', 'sports'].includes(vehicleType)) {
      totalPrice *= (1 + pricingModel.surcharges.luxurySurcharge / 100);
    }

    if (pricingModel.surcharges.filthinessFactor) {
      const filthiness = (100 - Math.min(interiorCondition, exteriorCondition)) / 100;
      totalPrice *= (1 + filthiness * pricingModel.surcharges.filthinessFactor / 100);
    }

    const estimatedPrice = Math.round(totalPrice);
    logger.info('Estimated price calculated', { estimatedPrice });

    return estimatedPrice;
  },
});

export const getPricingModel = query({
  handler: async (ctx): Promise<PricingModel | null> => {
    return await ctx.db.query("pricingModels").first();
  },
});

export const updatePricingModel = mutation({
  args: {
    pricingModel: v.object({
      basePrice: v.object({
        sedan: v.number(),
        suv: v.number(),
        truck: v.number(),
        van: v.number(),
        sports: v.number(),
        luxury: v.number(),
      }),
      surcharges: v.object({
        luxurySurcharge: v.number(),
        filthinessFactor: v.number(),
      }),
      services: v.record(v.object({
        name: v.string(),
        price: v.number(),
        enabled: v.boolean(),
      })),
      laborCost: v.number(),
      materialCost: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Check if the user has admin privileges (you'll need to implement this logic)
    const isAdmin = await ctx.runQuery(api.users.isUserAdmin, { userId: identity.subject });
    if (!isAdmin) {
      throw new ConvexError("Unauthorized: Admin privileges required");
    }

    const { pricingModel } = args;

    logger.info('Updating pricing model', { pricingModel });

    const existingModel = await ctx.db.query("pricingModels").first();
    if (existingModel) {
      await ctx.db.patch(existingModel._id, pricingModel);
    } else {
      await ctx.db.insert("pricingModels", pricingModel);
    }

    logger.info('Pricing model updated successfully');
  },
});

export const aiAnalyzeVehicle = action({
  args: {
    images: v.array(v.string()),
    vehicleType: v.string(),
    interiorCondition: v.number(),
    exteriorCondition: v.number(),
  },
  handler: async (ctx, args) => {
    // This is a placeholder for the AI analysis logic
    // In a production environment, you would integrate with an AI service here
    return {
      bodyType: args.vehicleType,
      damageAreas: ["front bumper", "rear fender"],
      cleanlinessLevel: args.interiorCondition > 50 ? "Clean" : "Dirty",
      recommendedServices: ["Exterior Wash", "Interior Detailing"],
      confidenceScore: 0.85,
    };
  },
});

// Add these interfaces at the top of the file
interface PredictivePricingInsights {
  recommendations: string[];
  trendAnalysis: {
    [key: string]: {
      trend: "increasing" | "decreasing" | "stable";
      suggestion: string;
    };
  };
}

interface PricingAccuracy {
  accuracy: number;
  totalAssessments: number;
  accurateAssessments: number;
}

interface PricingModel {
  basePrice: {
    sedan: number;
    suv: number;
    truck: number;
    van: number;
    sports: number;
    luxury: number;
  };
  surcharges: {
    luxurySurcharge: number;
    filthinessFactor: number;
  };
  services: Record<string, {
    name: string;
    price: number;
    enabled: boolean;
  }>;
  laborCost: number;
  materialCost: number;
}
