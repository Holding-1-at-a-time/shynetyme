import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { Assessment, VehicleType } from "../types";

// Custom error types for better error handling
export class AssessmentError extends ConvexError<{ code: string }> {
  constructor(message: string, public code: string) {
    super({ message, code });
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
    // Validate user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new AssessmentError(
        "User must be authenticated to create an assessment",
        "UNAUTHORIZED"
      );
    }

    // Validate input data
    if (args.images.length === 0) {
      throw new AssessmentError(
        "At least one vehicle image is required",
        "INVALID_INPUT"
      );
    }

    if (args.interiorCondition < 0 || args.interiorCondition > 100) {
      throw new AssessmentError(
        "Interior condition must be between 0 and 100",
        "INVALID_INPUT"
      );
    }

    if (args.exteriorCondition < 0 || args.exteriorCondition > 100) {
      throw new AssessmentError(
        "Exterior condition must be between 0 and 100",
        "INVALID_INPUT"
      );
    }

    try {
      // Calculate estimated price
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
      };

      const assessmentId = await ctx.db.insert("assessments", assessmentData);

      // Remove scheduler.runAfter since we don't have ai module yet
      // We'll implement AI analysis differently

      return assessmentId;
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }
      
      // Log unexpected errors
      console.error('Error creating assessment:', error);
      throw new AssessmentError(
        "Failed to create assessment. Please try again later.",
        "INTERNAL_ERROR"
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
