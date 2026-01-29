import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("app"), v.literal("website"), v.literal("component")),
    code: v.string(),
    language: v.string(),
    userId: v.id("users"),
    isPublic: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),
  
  commands: defineTable({
    command: v.string(),
    output: v.string(),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    timestamp: v.number(),
  }).index("by_user", ["userId"]).index("by_project", ["projectId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
