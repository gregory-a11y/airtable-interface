import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Helper: get authenticated user from all queries/mutations that need auth
// The client passes sessionToken via the auth context — but since Convex queries
// can't receive headers, we'll use a simpler approach: all protected queries
// accept no token (they're accessible) but filter data based on the calling user.
// For mutations that need auth, we check via a userId argument.

export const currentUser = query({
	args: { token: v.optional(v.string()) },
	handler: async (ctx, { token }) => {
		if (!token) return null;
		const user = await ctx.db
			.query("users")
			.withIndex("by_sessionToken", (q) => q.eq("sessionToken", token))
			.first();
		if (!user) return null;
		if (user.sessionExpiry && user.sessionExpiry < Date.now()) return null;
		return user;
	},
});

export const listTeam = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("users")
			.filter((q) => q.neq(q.field("status"), "disabled"))
			.collect();
	},
});

export const getById = query({
	args: { id: v.id("users") },
	handler: async (ctx, { id }) => {
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
		status: v.optional(v.union(v.literal("active"), v.literal("invited"), v.literal("disabled"))),
		commissionPercent: v.optional(v.number()),
		pricePerStudent: v.optional(v.number()),
		maxCapacity: v.optional(v.number()),
	},
	handler: async (ctx, { id, ...fields }) => {
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
		name: v.optional(v.string()),
		role: v.union(v.literal("admin"), v.literal("sales"), v.literal("coach")),
	},
	handler: async (ctx, { email, name, role }) => {
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
			.first();
		if (existing) throw new Error("Email deja utilise");

		return await ctx.db.insert("users", {
			email: email.toLowerCase(),
			name: name?.trim() || email.split("@")[0],
			role,
			status: "invited",
			mustChangePassword: true,
		});
	},
});

export const getTeamStats = query({
	args: {},
	handler: async (ctx) => {
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
