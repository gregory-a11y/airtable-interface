import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


// ============================================================
// QUERIES
// ============================================================

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("calendars").collect();
	},
});

export const getById = query({
	args: { id: v.id("calendars") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const getBySlug = query({
	args: { slug: v.string() },
	handler: async (ctx, { slug }) => {
		// Public — no auth required
		return await ctx.db
			.query("calendars")
			.withIndex("by_slug", (q) => q.eq("slug", slug))
			.first();
	},
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
	args: {
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		internalNote: v.optional(v.string()),
		sourceTag: v.optional(v.string()),
		duration: v.number(),
		bufferBefore: v.optional(v.number()),
		bufferAfter: v.optional(v.number()),
		maxPerDay: v.optional(v.number()),
		availableDays: v.array(v.number()),
		startHour: v.number(),
		endHour: v.number(),
		timezone: v.string(),
		hosts: v.array(
			v.object({
				userId: v.id("users"),
				priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
			}),
		),
		formId: v.optional(v.id("forms")),
		confirmationEmailEnabled: v.boolean(),
		reminderEnabled: v.boolean(),
		reminderHoursBefore: v.optional(v.number()),
		confirmationMessage: v.optional(v.string()),
		active: v.boolean(),
	},
	handler: async (ctx, args) => {
		// Verify slug uniqueness
		const existing = await ctx.db
			.query("calendars")
			.withIndex("by_slug", (q) => q.eq("slug", args.slug))
			.first();
		if (existing) {
			throw new Error("Ce slug est deja utilise");
		}

		return await ctx.db.insert("calendars", {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("calendars"),
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		internalNote: v.optional(v.string()),
		sourceTag: v.optional(v.string()),
		duration: v.optional(v.number()),
		bufferBefore: v.optional(v.number()),
		bufferAfter: v.optional(v.number()),
		maxPerDay: v.optional(v.number()),
		availableDays: v.optional(v.array(v.number())),
		startHour: v.optional(v.number()),
		endHour: v.optional(v.number()),
		timezone: v.optional(v.string()),
		hosts: v.optional(
			v.array(
				v.object({
					userId: v.id("users"),
					priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
				}),
			),
		),
		formId: v.optional(v.id("forms")),
		confirmationEmailEnabled: v.optional(v.boolean()),
		reminderEnabled: v.optional(v.boolean()),
		reminderHoursBefore: v.optional(v.number()),
		confirmationMessage: v.optional(v.string()),
		active: v.optional(v.boolean()),
	},
	handler: async (ctx, { id, ...fields }) => {
		// If slug changed, verify uniqueness
		if (fields.slug) {
			const existing = await ctx.db
				.query("calendars")
				.withIndex("by_slug", (q) => q.eq("slug", fields.slug!))
				.first();
			if (existing && existing._id !== id) {
				throw new Error("Ce slug est deja utilise");
			}
		}

		const updates: Record<string, unknown> = {};
		for (const [key, val] of Object.entries(fields)) {
			if (val !== undefined) updates[key] = val;
		}
		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(id, updates);
		}
	},
});

export const remove = mutation({
	args: { id: v.id("calendars") },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
	},
});
