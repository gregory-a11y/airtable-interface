import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listSettingLeads = query({
	args: {
		search: v.optional(v.string()),
		etapeSetting: v.optional(v.string()),
		leadType: v.optional(v.string()),
		source: v.optional(v.string()),
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		let leads = await ctx.db
			.query("leads")
			.withIndex("by_createdAt")
			.order("desc")
			.filter((q) =>
				q.or(
					q.eq(q.field("source"), "Setting WA"),
					q.eq(q.field("source"), "VSL ADS"),
					q.eq(q.field("source"), "FORMULAIRE ADS"),
				),
			)
			.collect();

		// Filter by etapeSetting
		if (args.etapeSetting) {
			leads = leads.filter((l) => l.etapeSetting === args.etapeSetting);
		}

		// Filter by leadType
		if (args.leadType) {
			leads = leads.filter((l) => l.leadType === args.leadType);
		}

		// Filter by source
		if (args.source) {
			leads = leads.filter((l) => l.source === args.source);
		}

		// Filter by date range
		if (args.dateFrom) {
			leads = leads.filter((l) => l.createdAt >= args.dateFrom!);
		}
		if (args.dateTo) {
			leads = leads.filter((l) => l.createdAt <= args.dateTo!);
		}

		// Search filter (name, email, phone)
		if (args.search) {
			const s = args.search.toLowerCase();
			leads = leads.filter(
				(l) =>
					l.name.toLowerCase().includes(s) ||
					l.email?.toLowerCase().includes(s) ||
					l.phone?.toLowerCase().includes(s),
			);
		}

		return leads;
	},
});

export const updateSettingStatus = mutation({
	args: {
		id: v.id("leads"),
		etapeSetting: v.string(),
	},
	handler: async (ctx, { id, etapeSetting }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		await ctx.db.patch(id, {
			etapeSetting,
			updatedAt: Date.now(),
		});
	},
});

export const updateLeadNote = mutation({
	args: {
		id: v.id("leads"),
		noteInterne: v.string(),
	},
	handler: async (ctx, { id, noteInterne }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		await ctx.db.patch(id, {
			noteInterne,
			updatedAt: Date.now(),
		});
	},
});

export const getLeadById = query({
	args: { id: v.id("leads") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.get(id);
	},
});
