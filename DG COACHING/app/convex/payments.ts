import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: {
		status: v.optional(v.string()),
		clientId: v.optional(v.id("clients")),
	},
	handler: async (ctx, { status, clientId }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		let results;
		if (clientId) {
			results = await ctx.db
				.query("payments")
				.withIndex("by_clientId", (q) => q.eq("clientId", clientId))
				.order("desc")
				.collect();
		} else if (status) {
			results = await ctx.db
				.query("payments")
				.withIndex("by_status", (q) => q.eq("status", status as "confirmed" | "failed" | "refunded" | "pending"))
				.order("desc")
				.collect();
		} else {
			results = await ctx.db.query("payments").order("desc").take(200);
		}
		return results;
	},
});

export const getByClient = query({
	args: { clientId: v.id("clients") },
	handler: async (ctx, { clientId }) => {
		return await ctx.db
			.query("payments")
			.withIndex("by_clientId", (q) => q.eq("clientId", clientId))
			.order("desc")
			.collect();
	},
});

export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		const allPayments = await ctx.db.query("payments").collect();
		const confirmed = allPayments.filter((p) => p.status === "confirmed");
		const failed = allPayments.filter((p) => p.status === "failed");

		const totalCollecte = confirmed.reduce((sum, p) => sum + p.amount, 0);
		const totalCommissionsClosing = confirmed.reduce(
			(sum, p) => sum + (p.commissionClosing || 0),
			0,
		);
		const totalCommissionsSetting = confirmed.reduce(
			(sum, p) => sum + (p.commissionSetting || 0),
			0,
		);

		// Group by closer
		const byCloser = new Map<string, number>();
		for (const p of confirmed) {
			if (p.closerId) {
				byCloser.set(p.closerId, (byCloser.get(p.closerId) || 0) + p.amount);
			}
		}

		// Group by setter
		const bySetter = new Map<string, number>();
		for (const p of confirmed) {
			if (p.setterId) {
				bySetter.set(p.setterId, (bySetter.get(p.setterId) || 0) + p.amount);
			}
		}

		return {
			totalCollecte,
			totalFailed: failed.length,
			totalCommissionsClosing,
			totalCommissionsSetting,
			count: allPayments.length,
		};
	},
});

export const createManual = mutation({
	args: {
		clientId: v.id("clients"),
		amount: v.number(),
		provider: v.string(),
		status: v.union(
			v.literal("confirmed"),
			v.literal("pending"),
			v.literal("failed"),
		),
		installmentNumber: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		const client = await ctx.db.get(args.clientId);
		if (!client) throw new Error("Client introuvable");

		return await ctx.db.insert("payments", {
			transactionId: "" as any,
			pid: `manual-${crypto.randomUUID().slice(0, 6)}`,
			amount: args.amount,
			amountHT: Math.round(args.amount * 0.8),
			provider: args.provider,
			status: args.status,
			sourceType: args.provider,
			clientId: args.clientId,
			closerId: client.closerId,
			setterId: client.setterId,
			installmentNumber: args.installmentNumber,
			confirmedAt: args.status === "confirmed" ? Date.now() : undefined,
			createdAt: Date.now(),
		});
	},
});
