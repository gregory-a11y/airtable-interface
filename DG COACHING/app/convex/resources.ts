import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByCategory = query({
	args: { category: v.string() },
	handler: async (ctx, { category }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db
			.query("resources")
			.withIndex("by_category", (q) => q.eq("category", category as any))
			.order("desc")
			.collect();
	},
});

export const create = mutation({
	args: {
		title: v.string(),
		category: v.union(v.literal("sop"), v.literal("asset_coaching"), v.literal("asset_sales"), v.literal("ressource")),
		subCategory: v.optional(v.string()),
		content: v.optional(v.string()),
		active: v.boolean(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.insert("resources", {
			...args,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("resources"),
		title: v.optional(v.string()),
		content: v.optional(v.string()),
		subCategory: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...fields }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const updates: Record<string, unknown> = { updatedAt: Date.now() };
		for (const [k, val] of Object.entries(fields)) {
			if (val !== undefined) updates[k] = val;
		}
		await ctx.db.patch(id, updates);
	},
});

export const remove = mutation({
	args: { id: v.id("resources") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		await ctx.db.delete(id);
	},
});
