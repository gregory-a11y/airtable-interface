import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const currentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		return await ctx.db.get(userId);
	},
});

export const listTeam = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db
			.query("users")
			.filter((q) => q.neq(q.field("status"), "disabled"))
			.collect();
	},
});

export const getById = query({
	args: { id: v.id("users") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.get(id);
	},
});

export const updateProfile = mutation({
	args: {
		id: v.id("users"),
		name: v.optional(v.string()),
		phone: v.optional(v.string()),
		bio: v.optional(v.string()),
		specialty: v.optional(v.string()),
		role: v.optional(v.union(v.literal("admin"), v.literal("sales"), v.literal("coach"))),
		status: v.optional(
			v.union(v.literal("active"), v.literal("invited"), v.literal("disabled")),
		),
		commissionPercent: v.optional(v.number()),
		pricePerStudent: v.optional(v.number()),
		maxCapacity: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...fields }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const caller = await ctx.db.get(userId);
		if (caller?.role !== "admin" && userId !== id) {
			throw new Error("Non autorise");
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

export const invite = mutation({
	args: {
		email: v.string(),
		role: v.union(v.literal("admin"), v.literal("sales"), v.literal("coach")),
	},
	handler: async (ctx, { email, role }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const caller = await ctx.db.get(userId);
		if (caller?.role !== "admin") throw new Error("Admin requis");

		const token = crypto.randomUUID().slice(0, 12);
		const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;

		const newUserId = await ctx.db.insert("users", {
			email,
			name: email.split("@")[0],
			role,
			status: "invited",
			inviteToken: token,
			inviteExpiry: expiry,
		});

		return { userId: newUserId, token, email };
	},
});

export const getTeamStats = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const all = await ctx.db
			.query("users")
			.filter((q) => q.neq(q.field("status"), "disabled"))
			.collect();
		return {
			total: all.length,
			sales: all.filter((u) => u.role === "sales").length,
			coaches: all.filter((u) => u.role === "coach").length,
			admins: all.filter((u) => u.role === "admin").length,
		};
	},
});
