import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const results = await ctx.db.query("coachTracking").order("desc").take(100);

		const enriched = [];
		for (const r of results) {
			const evalue = await ctx.db.get(r.coachEvalueId);
			const evaluateur = await ctx.db.get(r.coachEvaluateurId);
			enriched.push({
				...r,
				coachEvalueName: evalue && "name" in evalue ? evalue.name : "—",
				coachEvaluateurName: evaluateur && "name" in evaluateur ? evaluateur.name : "—",
			});
		}
		return enriched;
	},
});

export const create = mutation({
	args: {
		coachEvalueId: v.id("users"),
		delaiReponse: v.number(),
		relanceClients: v.number(),
		positionProfessionnelle: v.number(),
		qualiteDiete: v.number(),
		qualiteProgramme: v.number(),
		energie: v.number(),
		moyenne: v.number(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		return await ctx.db.insert("coachTracking", {
			...args,
			coachEvaluateurId: userId,
			createdAt: Date.now(),
		});
	},
});
