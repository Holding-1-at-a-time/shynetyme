import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Assessment, VehicleType } from "../types";

// Custom error types for better error handling
export class AssessmentError extends ConvexError {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AssessmentError';
    this.code = code;
  }
}

export const createAssessment = mutation({
  args: {
    userId: v.string(),
    clientName: v.string(),
    images: v.array(v.string()),
    vehicleType: v.union(
      v.literal("sedan"),
      v.literal("suv"),
      v.literal("truck"),
      v.literal("van"),
      v.literal("sports"),
      v.literal("luxury")
    ),
    description: v.string(),
    interiorCondition: v.number(),
    exteriorCondition: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"assessments">> => {
    try {
      const estimatedPrice = await ctx.runMutation(api.pricing.calculateEstimatedPrice, {
        vehicleType: args.vehicleType,
        interiorCondition: args.interiorCondition,
        exteriorCondition: args.exteriorCondition,
        selectedServices: [],
      });

      const assessmentData = {
        ...args,
        estimatedPrice,
        embedding: [],
        services: {},
        basePrice: 0,
        createdAt: Date.now(), // Add the missing createdAt field
        aiAnalysis: undefined, // Add optional fields explicitly
        actualPrice: undefined,
      };

      return await ctx.db.insert("assessments", assessmentData);
    } catch (error) {
      throw new AssessmentError(
        error instanceof Error ? error.message : "Unknown error occurred",
        "CREATE_FAILED"
      );
    }
  },
});

export const getSimilarAssessments = query({
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
  },
  handler: async (ctx, args) => {
    const assessments = await ctx.db
      .query("assessments")
      .filter(q => q.eq(q.field("vehicleType"), args.vehicleType))
      .collect();

    return assessments
      .filter(assessment => 
        Math.abs(assessment.interiorCondition - args.interiorCondition) <= 10 &&
        Math.abs(assessment.exteriorCondition - args.exteriorCondition) <= 10
      )
      .slice(0, 5)
      .map(assessment => ({
        id: assessment._id,
        vehicleType: assessment.vehicleType,
        interiorCondition: assessment.interiorCondition,
        exteriorCondition: assessment.exteriorCondition,
        estimatedPrice: assessment.estimatedPrice,
        createdAt: assessment._creationTime,
      }));
  },
});

export const getAssessment = query({
  args: { assessmentId: v.id("assessments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assessmentId);
  },
});

export const updateAssessment = mutation({
  args: {
    assessmentId: v.id("assessments"),
    updates: v.object({
      aiAnalysis: v.optional(v.object({
        bodyType: v.string(),
        damageAreas: v.array(v.string()),
        cleanlinessLevel: v.string(),
        recommendedServices: v.array(v.string()),
        confidenceScore: v.number(),
      })),
      estimatedPrice: v.optional(v.number()),
      services: v.optional(v.record(v.string(), v.object({
        name: v.string(),
        price: v.number(),
        enabled: v.boolean(),
      }))),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    await ctx.db.patch(args.assessmentId, args.updates);
  },
});
