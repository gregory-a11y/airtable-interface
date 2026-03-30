import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


export const list = query({
	args: {
		status: v.optional(v.string()),
		clientId: v.optional(v.id("clients")),
	},
	handler: async (ctx, { status, clientId }) => {

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

export const getCommissionsByUser = query({
	args: {},
	handler: async (ctx) => {
		const confirmed = await ctx.db
			.query("payments")
			.withIndex("by_status", (q) => q.eq("status", "confirmed"))
			.collect();

		const userMap: Record<
			string,
			{ name: string; role: string; totalClosing: number; totalSetting: number; count: number }
		> = {};

		for (const p of confirmed) {
			if (p.closerId && (p.commissionClosing ?? 0) > 0) {
				if (!userMap[p.closerId]) {
					const user = await ctx.db.get(p.closerId);
					userMap[p.closerId] = {
						name: user?.name ?? user?.email ?? "Inconnu",
						role: "closer",
						totalClosing: 0,
						totalSetting: 0,
						count: 0,
					};
				}
				userMap[p.closerId].totalClosing += p.commissionClosing!;
				userMap[p.closerId].count += 1;
			}

			if (p.setterId && (p.commissionSetting ?? 0) > 0) {
				if (!userMap[p.setterId]) {
					const user = await ctx.db.get(p.setterId);
					userMap[p.setterId] = {
						name: user?.name ?? user?.email ?? "Inconnu",
						role: "setter",
						totalClosing: 0,
						totalSetting: 0,
						count: 0,
					};
				}
				userMap[p.setterId].totalSetting += p.commissionSetting!;
				userMap[p.setterId].count += 1;
			}
		}

		return Object.entries(userMap).map(([userId, data]) => ({
			userId,
			...data,
			total: data.totalClosing + data.totalSetting,
		}));
	},
});

export const createManual = mutation({
	args: {
		clientId: v.id("clients"),
		offerId: v.id("offers"),
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
		if (args.amount <= 0) throw new Error("Le montant doit etre positif");

		const client = await ctx.db.get(args.clientId);
		if (!client) throw new Error("Client introuvable");

		const offer = await ctx.db.get(args.offerId);
		if (!offer) throw new Error("Offre introuvable");

		const pid = `manual-${crypto.randomUUID().slice(0, 6)}`;
		const now = Date.now();

		const transactionId = await ctx.db.insert("transactions", {
			pid,
			offerId: args.offerId,
			prospectName: client.name,
			prospectEmail: client.email,
			clientId: args.clientId,
			provider: args.provider,
			status: args.status === "confirmed" ? "completed" : "pending",
			createdAt: now,
			confirmedAt: args.status === "confirmed" ? now : undefined,
		});

		// Calculate commissions from client percentages
		const commissionClosing = client.commissionPercentCloser
			? Math.round(args.amount * (client.commissionPercentCloser / 100))
			: undefined;
		const commissionSetting = client.commissionPercentSetter
			? Math.round(args.amount * (client.commissionPercentSetter / 100))
			: undefined;

		return await ctx.db.insert("payments", {
			transactionId,
			pid,
			amount: args.amount,
			amountHT: Math.round(args.amount * 0.8),
			provider: args.provider,
			status: args.status,
			sourceType: args.provider,
			clientId: args.clientId,
			closerId: client.closerId,
			setterId: client.setterId,
			commissionClosing,
			commissionSetting,
			installmentNumber: args.installmentNumber,
			confirmedAt: args.status === "confirmed" ? now : undefined,
			createdAt: now,
		});
	},
});
