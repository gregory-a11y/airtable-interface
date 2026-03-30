import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


export const list = query({
	args: { activeOnly: v.optional(v.boolean()) },
	handler: async (ctx, { activeOnly }) => {
		if (activeOnly) {
			return await ctx.db
				.query("offers")
				.withIndex("by_active", (q) => q.eq("active", true))
				.order("desc")
				.collect();
		}
		return await ctx.db.query("offers").order("desc").collect();
	},
});

export const getById = query({
	args: { id: v.id("offers") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const getByIdPublic = query({
	args: { id: v.id("offers") },
	handler: async (ctx, { id }) => {
		const offer = await ctx.db.get(id);
		if (!offer || !offer.active) return null;
		return offer;
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		type: v.union(v.literal("classique"), v.literal("renouvellement"), v.literal("acompte")),
		amount: v.number(),
		paymentMode: v.union(
			v.literal("unique"),
			v.literal("mensuel"),
			v.literal("fixe_plus_mensuel"),
		),
		installmentCount: v.optional(v.number()),
		firstPaymentAmount: v.optional(v.number()),
		recurringAmount: v.optional(v.number()),
		duration: v.optional(v.string()),
		providers: v.array(v.string()),
	},
	handler: async (ctx, args) => {

		return await ctx.db.insert("offers", {
			...args,
			currency: "EUR",
			active: true,
			createdAt: Date.now(),
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("offers"),
		name: v.optional(v.string()),
		amount: v.optional(v.number()),
		active: v.optional(v.boolean()),
		installmentCount: v.optional(v.number()),
		recurringAmount: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...fields }) => {
		const updates: Record<string, unknown> = {};
		for (const [k, val] of Object.entries(fields)) {
			if (val !== undefined) updates[k] = val;
		}
		await ctx.db.patch(id, updates);
	},
});

export const toggleActive = mutation({
	args: { id: v.id("offers") },
	handler: async (ctx, { id }) => {
		const offer = await ctx.db.get(id);
		if (!offer) throw new Error("Offre introuvable");
		await ctx.db.patch(id, { active: !offer.active });
	},
});
