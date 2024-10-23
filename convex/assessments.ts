import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Types
type UserId = string;

interface AssessmentData {
    userId: UserId;
    images: string[];
    vehicleType: string;
    interiorCondition: number;
    exteriorCondition: number;
    estimatedPrice: number;
    embedding: number[];
    createdAt: number;
}

export const createAssessment = mutation({
    args: {
        userId: v.string(),
        images: v.array(v.string()),
        vehicleType: v.string(),
        interiorCondition: v.number(),
        exteriorCondition: v.number(),
    },
    handler: async (ctx, args): Promise<Id<"assessments">> => {
        const estimatedPrice = await ctx.runMutation(api.pricing.calculateEstimatedPrice, {
            vehicleType: args.vehicleType,
            interiorCondition: args.interiorCondition,
            exteriorCondition: args.exteriorCondition,
        });

        const embedding = await ctx.runAction(api.embeddings.generateEmbedding, {
            vehicleType: args.vehicleType,
            interiorCondition: args.interiorCondition,
            exteriorCondition: args.exteriorCondition,
        });

        const assessmentData: AssessmentData = {
            ...args,
            estimatedPrice,
            embedding,
            createdAt: Date.now(),
        };

        return await ctx.db.insert("assessments", assessmentData);
    },
});

export const getSimilarAssessments = query(async ({ db }, { vehicleType, cleanlinessLevel }) => {
  const assessments = await db.query('assessments')
    .where('vehicleType', vehicleType)
    .and('cleanlinessLevel', cleanlinessLevel)
    .take(5)
    .collect()

  return assessments.map(a => ({
    id: a.id,
    vehicleType: a.vehicleType,
    cleanlinessLevel: a.cleanlinessLevel,
    totalPrice: a.totalPrice,
    date: a.createdAt.toISOString(),
  }))
})

export const getAssessment = query({
    args: { assessmentId: v.id("assessments") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.assessmentId);
    },
});

export const updateAssessment = mutation(async ({ db, auth }, { assessmentId, aiAnalysis }) => {
  if (!auth.userId) {
    throw new Error('Unauthorized')
  }
  await db.patch(assessmentId, { aiAnalysis })
})
