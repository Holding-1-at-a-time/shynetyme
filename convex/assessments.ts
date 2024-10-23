import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { Assessment, VehicleType } from "../types";
import { VehicleAnalysis } from "../types";

// Types
type UserId = string;

interface AssessmentData {
    userId: string;
    clientName: string;
    images: string[];
    vehicleType: "sedan" | "suv" | "truck" | "van" | "sports" | "luxury";
    interiorCondition: number;
    exteriorCondition: number;
    estimatedPrice: number;
    embedding: number[];
    createdAt: number;
    services: Record<string, {
        name: string;
        price: number;
        enabled: boolean;
    }>;
    basePrice: number;
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
        interiorCondition: v.number(),
        exteriorCondition: v.number(),
    },
    handler: async (ctx, args): Promise<Id<"assessments">> => {
        const estimatedPrice = await ctx.runMutation(api.pricing.calculateEstimatedPrice, {
            vehicleType: args.vehicleType,
            interiorCondition: args.interiorCondition,
            exteriorCondition: args.exteriorCondition,
            selectedServices: [],
        });

        const assessmentData: AssessmentData = {
            ...args,
            estimatedPrice,
            embedding: [], // This will be populated by the AI service
            createdAt: Date.now(),
            services: {},
            basePrice: 0, // This will be set based on the pricing model
        };

        return await ctx.db.insert("assessments", assessmentData);
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
            .filter(q => 
                q.eq(q.field("vehicleType"), args.vehicleType)
            )
            .collect();

        // Filter and sort after collecting
        return assessments
            .filter(assessment => 
                Math.abs(assessment.interiorCondition - args.interiorCondition) <= 10 &&
                Math.abs(assessment.exteriorCondition - args.exteriorCondition) <= 10
            )
            .slice(0, 5)
            .map((assessment: Assessment) => ({
                id: assessment._id,
                vehicleType: assessment.vehicleType,
                interiorCondition: assessment.interiorCondition,
                exteriorCondition: assessment.exteriorCondition,
                estimatedPrice: assessment.estimatedPrice,
                createdAt: assessment.createdAt,
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
