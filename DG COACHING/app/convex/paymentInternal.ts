import { internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get transaction + offer by PID (internal version for use in actions).
 */
export const getTransactionByPID = internalQuery({
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

/**
 * Store provider reference on a transaction (internal version).
 */
export const updateProviderTx = internalMutation({
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

export const getWebhookEvent = internalQuery({
	args: { providerEventId: v.string() },
	handler: async (ctx, { providerEventId }) => {
		return await ctx.db
			.query("webhookEvents")
			.withIndex("by_providerEventId", (q) => q.eq("providerEventId", providerEventId))
			.first();
	},
});

export const recordWebhookEvent = internalMutation({
	args: {
		providerEventId: v.string(),
		provider: v.string(),
		eventType: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert("webhookEvents", {
			...args,
			processed: false,
			receivedAt: Date.now(),
		});
	},
});

export const markWebhookProcessed = internalMutation({
	args: { providerEventId: v.string() },
	handler: async (ctx, { providerEventId }) => {
		const event = await ctx.db
			.query("webhookEvents")
			.withIndex("by_providerEventId", (q) => q.eq("providerEventId", providerEventId))
			.first();
		if (event) {
			await ctx.db.patch(event._id, { processed: true, processedAt: Date.now() });
		}
	},
});

export const confirmPayment = internalMutation({
	args: {
		pid: v.string(),
		provider: v.string(),
		providerTxId: v.string(),
		providerPaymentId: v.optional(v.string()),
		amountReceived: v.number(),
	},
	handler: async (ctx, args) => {
		const tx = await ctx.db
			.query("transactions")
			.withIndex("by_pid", (q) => q.eq("pid", args.pid))
			.unique();
		if (!tx) throw new Error(`Transaction ${args.pid} introuvable`);
		if (tx.status === "completed") return;

		const offer = await ctx.db.get(tx.offerId);
		if (!offer) throw new Error("Offre introuvable");

		const now = Date.now();
		const newInstallmentCurrent = (tx.installmentCurrent || 0) + 1;
		const isComplete = newInstallmentCurrent >= (tx.installmentTotal || 1);

		// Update transaction status
		await ctx.db.patch(tx._id, {
			provider: args.provider,
			providerTxId: args.providerTxId,
			status: isComplete ? "completed" : "partial",
			installmentCurrent: newInstallmentCurrent,
			confirmedAt: now,
		});

		// Resolve commission data from client or lead
		let closerId, setterId, commissionClosing, commissionSetting;
		if (tx.clientId) {
			const client = await ctx.db.get(tx.clientId);
			if (client) {
				closerId = client.closerId;
				setterId = client.setterId;
				commissionClosing = client.commissionPercentCloser
					? Math.round(args.amountReceived * (client.commissionPercentCloser / 100))
					: undefined;
				commissionSetting = client.commissionPercentSetter
					? Math.round(args.amountReceived * (client.commissionPercentSetter / 100))
					: undefined;
			}
		} else if (tx.leadId) {
			const lead = await ctx.db.get(tx.leadId);
			if (lead) {
				closerId = lead.closerId;
				setterId = lead.setterId;
			}
		}

		// Create payment record
		await ctx.db.insert("payments", {
			transactionId: tx._id,
			pid: args.pid,
			amount: args.amountReceived,
			// Default: 20% French VAT (TTC -> HT = amount / 1.20)
			amountHT: Math.round(args.amountReceived / 1.2),
			provider: args.provider,
			providerTxId: args.providerTxId,
			providerPaymentId: args.providerPaymentId,
			status: "confirmed",
			sourceType: args.provider,
			clientId: tx.clientId,
			closerId,
			setterId,
			commissionClosing,
			commissionSetting,
			installmentNumber: newInstallmentCurrent,
			confirmedAt: now,
			createdAt: now,
		});
	},
});
