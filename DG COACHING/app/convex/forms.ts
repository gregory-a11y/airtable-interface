import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: { type: v.optional(v.string()), active: v.optional(v.boolean()) },
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.query("forms").order("desc").collect();
	},
});

export const getById = query({
	args: { id: v.id("forms") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		type: v.union(v.literal("onboarding"), v.literal("bilan"), v.literal("booking"), v.literal("custom")),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.insert("forms", {
			...args,
			description: args.description || "",
			active: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});
