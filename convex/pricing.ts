import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import logger from '../lib/logger';

interface PredictivePricingInsights {
  recommendations: string[];
  trendAnalysis: Record<string, {
    trend: "increasing" | "decreasing" | "stable";
    suggestion: string;
  }>;
}

interface PricingModel {
  _id: Id<"pricingModels">;
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

interface ServicePrice {
  name: string;
  price: number;
}

export const getPricingAnalytics = query({
  handler: async (ctx) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const orders = await ctx.db
        .query("assessments")
        .filter(q => q.gte(q.field("createdAt"), thirtyDaysAgo.getTime()))
        .collect();

      const totalRevenue = orders.reduce((acc, order) => acc + (order.estimatedPrice || 0), 0);
      const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;

      const serviceCounts = new Map<string, number>();
      orders.forEach(order => {
        Object.keys(order.services || {}).forEach(service => {
          serviceCounts.set(service, (serviceCounts.get(service) || 0) + 1);
        });
      });

      const popularServices = Array.from(serviceCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([service]) => service);

      const analytics = {
        totalRevenue,
        averageOrderValue,
        popularServices,
      };

      logger.info('Fetched pricing analytics', { analytics });
      return analytics;
    } catch (error) {
      logger.error('Error fetching pricing analytics', { error });
      throw new ConvexError('Failed to fetch pricing analytics');
    }
  },
});

export const getPredictivePricingInsights = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<PredictivePricingInsights> => {
    try {
      const recentAssessment = await ctx.db
        .query("assessments")
        .filter(q => q.eq(q.field("userId"), args.userId))
        .order("desc")
        .first();

      if (!recentAssessment) {
        const emptyInsights: PredictivePricingInsights = {
          recommendations: [],
          trendAnalysis: {},
        };
        logger.info('No recent assessments found', { userId: args.userId });
        return emptyInsights;
      }

      const pricingModel = await ctx.db.query("pricingModels").first();
      if (!pricingModel) {
        throw new ConvexError("No pricing model found");
      }

      const availableServices = Object.keys(recentAssessment.services || {});
      const servicePrices = availableServices.reduce<Record<string, number>>((acc, service) => {
        const price = pricingModel.services[service]?.price || 0;
        acc[service] = price;
        return acc;
      }, {});

      const priceValues = Object.values(servicePrices);
      const averageServicePrice = priceValues.length 
        ? priceValues.reduce((acc, price) => acc + price, 0) / priceValues.length 
        : 0;

      const recommendations = availableServices.map(service => {
        const currentPrice = servicePrices[service];
        const suggestedPrice = currentPrice > averageServicePrice
          ? Math.floor(currentPrice * 0.95)
          : Math.ceil(currentPrice * 1.05);
        return `Adjust price for ${service} to $${suggestedPrice} to stay competitive.`;
      });

      const insights: PredictivePricingInsights = {
        recommendations,
        trendAnalysis: {
          pricing: {
            trend: "stable",
            suggestion: "Current pricing model is performing well.",
          },
        },
      };

      logger.info('Generated pricing insights', { userId: args.userId });
      return insights;
    } catch (error) {
      logger.error('Error generating pricing insights', { error, userId: args.userId });
      throw new ConvexError('Failed to generate pricing insights');
    }
  },
});

export const calculateEstimatedPrice = mutation({
  args: {
    vehicleType: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("truck"),
      v.literal("van"),
      v.literal("sports"),
      v.literal("luxury")
    ),
    interiorCondition: v.number(),
    exteriorCondition: v.number(),
    selectedServices: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<number> => {
    const { vehicleType, interiorCondition, exteriorCondition, selectedServices } = args;

    if (interiorCondition < 0 || interiorCondition > 100 || 
        exteriorCondition < 0 || exteriorCondition > 100) {
      throw new ConvexError("Condition values must be between 0 and 100");
    }

    const pricingModel = await ctx.db.query("pricingModels").first() as PricingModel | null;
    if (!pricingModel) {
      throw new ConvexError("Pricing model not found");
    }

    let totalPrice = pricingModel.basePrice[vehicleType] || 0;
    const interiorFactor = 1 + (100 - interiorCondition) / 100;
    const exteriorFactor = 1 + (100 - exteriorCondition) / 100;

    totalPrice *= interiorFactor * exteriorFactor;

    selectedServices.forEach(service => {
      const servicePrice = pricingModel.services[service]?.price || 0;
      if (pricingModel.services[service]?.enabled) {
        totalPrice += servicePrice;
      }
    });

    if (pricingModel.surcharges.luxurySurcharge && 
        ['luxury', 'sports'].includes(vehicleType)) {
      totalPrice *= (1 + pricingModel.surcharges.luxurySurcharge / 100);
    }

    if (pricingModel.surcharges.filthinessFactor) {
      const filthiness = (100 - Math.min(interiorCondition, exteriorCondition)) / 100;
      totalPrice *= (1 + filthiness * pricingModel.surcharges.filthinessFactor / 100);
    }

    return Math.round(totalPrice);
  },
});

export const updatePricingModel = mutation({
  args: {
    updates: v.object({
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
      services: v.array(v.object({
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

    const isAdmin = await ctx.runQuery(api.users.isUserAdmin, { 
      clerkId: identity.subject 
    });
    
    if (!isAdmin) {
      throw new ConvexError("Unauthorized: Admin privileges required");
    }

    const existingModel = await ctx.db.query("pricingModels").first();
    if (existingModel) {
      await ctx.db.patch(existingModel._id, args.updates);
    } else {
      await ctx.db.insert("pricingModels", args.updates);
    }

    logger.info('Pricing model updated successfully');
  },
});
