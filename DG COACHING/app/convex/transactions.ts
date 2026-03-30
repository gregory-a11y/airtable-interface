import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


export const generatePID = mutation({
	args: {
		offerId: v.id("offers"),
		leadId: v.optional(v.id("leads")),
		prospectName: v.optional(v.string()),
		prospectEmail: v.optional(v.string()),
		prospectPhone: v.optional(v.string()),
	},
	handler: async (ctx, args) => {

		const offer = await ctx.db.get(args.offerId);
		if (!offer) throw new Error("Offre introuvable");

		const pid = crypto.randomUUID().slice(0, 8);

		const txId = await ctx.db.insert("transactions", {
			pid,
			offerId: args.offerId,
			leadId: args.leadId,
			prospectName: args.prospectName,
			prospectEmail: args.prospectEmail,
			prospectPhone: args.prospectPhone,
			status: "pending",
			installmentCurrent: 0,
			installmentTotal: offer.installmentCount || 1,
			createdAt: Date.now(),
		});

		return { pid, transactionId: txId, offerId: args.offerId };
	},
});

export const getByPID = query({
	args: { pid: v.string() },
	handler: async (ctx, { pid }) => {
		return await ctx.db
			.query("transactions")
			.withIndex("by_pid", (q) => q.eq("pid", pid))
			.unique();
	},
});

export const getByPIDPublic = query({
	args: { pid: v.string() },
	handler: async (ctx, { pid }) => {
		const tx = await ctx.db
			.query("transactions")
			.withIndex("by_pid", (q) => q.eq("pid", pid))
			.unique();
		if (!tx) return null;
		const offer = await ctx.db.get(tx.offerId);
		return { transaction: tx, offer };
	},
});

export const listByLead = query({
	args: { leadId: v.id("leads") },
	handler: async (ctx, { leadId }) => {
		return await ctx.db
			.query("transactions")
			.withIndex("by_leadId", (q) => q.eq("leadId", leadId))
			.collect();
	},
});

export const listByClient = query({
	args: { clientId: v.id("clients") },
	handler: async (ctx, { clientId }) => {
		return await ctx.db
			.query("transactions")
			.withIndex("by_clientId", (q) => q.eq("clientId", clientId))
			.collect();
	},
});

export const updateProviderTx = mutation({
	args: {
		pid: v.string(),
		provider: v.string(),
		providerTxId: v.string(),
	},
	handler: async (ctx, { pid, provider, providerTxId }) => {
		const tx = await ctx.db
			.query("transactions")
			.withIndex("by_pid", (q) => q.eq("pid", pid))
			.unique();
		if (!tx) throw new Error("Transaction introuvable");
		await ctx.db.patch(tx._id, { provider, providerTxId });
	},
});
