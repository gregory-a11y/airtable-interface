import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: { category: v.optional(v.string()) },
	handler: async (ctx, { category }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		if (category) {
			return await ctx.db
				.query("expenses")
				.withIndex("by_category", (q) => q.eq("category", category))
				.order("desc")
				.collect();
		}
		return await ctx.db.query("expenses").order("desc").collect();
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		amount: v.number(),
		category: v.string(),
		date: v.number(),
		source: v.optional(v.string()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.insert("expenses", { ...args, createdAt: Date.now() });
	},
});

export const remove = mutation({
	args: { id: v.id("expenses") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		await ctx.db.delete(id);
	},
});
