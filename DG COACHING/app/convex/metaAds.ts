import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: { campaignName: v.optional(v.string()), status: v.optional(v.string()) },
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.query("metaAds").order("desc").take(500);
	},
});

export const sync = mutation({
	args: {
		ads: v.array(
			v.object({
				adId: v.string(),
				adName: v.string(),
				adSetName: v.optional(v.string()),
				campaignName: v.optional(v.string()),
				status: v.optional(v.string()),
				format: v.optional(v.string()),
				spend: v.optional(v.number()),
				impressions: v.optional(v.number()),
				clicks: v.optional(v.number()),
				roas: v.optional(v.number()),
				ctr: v.optional(v.number()),
				cpa: v.optional(v.number()),
			}),
		),
	},
	handler: async (ctx, { ads }) => {
		for (const ad of ads) {
			const existing = await ctx.db
				.query("metaAds")
				.withIndex("by_adId", (q) => q.eq("adId", ad.adId))
				.unique();
			if (existing) {
				await ctx.db.patch(existing._id, { ...ad, lastSynced: Date.now() });
			} else {
				await ctx.db.insert("metaAds", { ...ad, lastSynced: Date.now(), createdAt: Date.now() });
			}
		}
	},
});
