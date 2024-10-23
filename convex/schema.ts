import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    vehicleType: v.string(),
    interiorCondition: v.number(),
    exteriorCondition: v.number(),
    estimatedPrice: v.number(),
    actualPrice: v.optional(v.number()),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    services: v.map(v.object({
      name: v.string(),
      price: v.number(),
      enabled: v.boolean(),
    })),
    basePrice: v.number(),
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
    services: v.map(v.object({
      name: v.string(),
      price: v.number(),
      enabled: v.boolean(),
    })),
    laborCost: v.number(),
    materialCost: v.number(),
  }),
});
