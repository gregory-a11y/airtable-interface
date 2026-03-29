import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: { type: v.optional(v.string()), status: v.optional(v.string()) },
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.query("invoices").order("desc").collect();
	},
});

export const create = mutation({
	args: {
		type: v.union(v.literal("client"), v.literal("interne")),
		clientId: v.optional(v.id("clients")),
		teamMemberId: v.optional(v.id("users")),
		amount: v.number(),
		status: v.union(v.literal("en_attente"), v.literal("paye"), v.literal("refuse")),
		invoiceType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.insert("invoices", { ...args, createdAt: Date.now() });
	},
});

export const updateStatus = mutation({
	args: {
		id: v.id("invoices"),
		status: v.union(v.literal("en_attente"), v.literal("paye"), v.literal("refuse")),
	},
	handler: async (ctx, { id, status }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		await ctx.db.patch(id, { status });
	},
});
