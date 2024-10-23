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

export const getSimilarAssessments = query({
    args: {
        vehicleType: v.string(),
        interiorCondition: v.number(),
        exteriorCondition: v.number(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        const embedding = await ctx.runAction(api.embeddings.generateEmbedding, {
            vehicleType: args.vehicleType,
            interiorCondition: args.interiorCondition,
            exteriorCondition: args.exteriorCondition,
        });
        
        return await ctx.db
            .query("assessments")
            .withIndex("by_embedding", (q) => q.vectorSearch("embedding", embedding, args.limit))
            .collect();
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
            estimatedPrice: v.optional(v.number()),
            actualPrice: v.optional(v.number()),
            aiAnalysis: v.optional(v.any()),
        }),
    },
    handler: async (ctx, args) => {
        const { assessmentId, updates } = args;
        await ctx.db.patch(assessmentId, updates);
    },
});
