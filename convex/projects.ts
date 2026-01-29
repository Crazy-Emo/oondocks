import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("app"), v.literal("website"), v.literal("component")),
    description: v.optional(v.string()),
    language: v.string(),
    code: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("projects", {
      name: args.name,
      type: args.type,
      description: args.description,
      language: args.language,
      code: args.code || "",
      userId,
      isPublic: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    await ctx.db.patch(args.id, { code: args.code });
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) return null;
    
    return project;
  },
});
