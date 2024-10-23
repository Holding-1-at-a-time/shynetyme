import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const serviceSchema = {
  name: v.string(),
  price: v.number(),
  enabled: v.boolean(),
};

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    role: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  assessments: defineTable({
    userId: v.string(),
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
    estimatedPrice: v.number(),
    actualPrice: v.optional(v.number()),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    description: v.string(),
    services: v.record(v.string(), v.object(serviceSchema)),
    basePrice: v.number(),
    clientName: v.string(),
    aiAnalysis: v.optional(v.object({
      bodyType: v.string(),
      damageAreas: v.array(v.string()),
      cleanlinessLevel: v.string(),
      recommendedServices: v.array(v.string()),
      confidenceScore: v.number(),
    })),
  }).index("by_user", ["userId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 384,
    }),

  pricingModels: defineTable({
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
    services: v.record(v.string(), v.object(serviceSchema)),
    laborCost: v.number(),
    materialCost: v.number(),
  }),
});
