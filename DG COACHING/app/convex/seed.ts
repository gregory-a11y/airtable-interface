import { mutation } from "./_generated/server";

export const seedAdmin = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if admin already exists
		const existing = await ctx.db
			.query("users")
			.withIndex("email", (q) => q.eq("email", "gregory@endosia.com"))
			.unique();

		if (existing) {
			// Ensure admin role
			if (existing.role !== "admin") {
				await ctx.db.patch(existing._id, { role: "admin", status: "active" });
			}
			return { status: "exists", id: existing._id };
		}

		const id = await ctx.db.insert("users", {
			email: "gregory@endosia.com",
			name: "Gregory Giunta",
			role: "admin",
			status: "active",
		});

		return { status: "created", id };
	},
});
