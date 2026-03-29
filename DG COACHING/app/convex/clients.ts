import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function calculateDateFin(dateDebut: number, prestation: string): number | undefined {
	if (!dateDebut) return undefined;
	const d = new Date(dateDebut);
	if (prestation.startsWith("1M")) d.setMonth(d.getMonth() + 1);
	else if (prestation.startsWith("3M")) d.setMonth(d.getMonth() + 3);
	else if (prestation.startsWith("6M")) d.setMonth(d.getMonth() + 6);
	else if (prestation.startsWith("12M")) d.setMonth(d.getMonth() + 12);
	else return undefined;
	return d.getTime();
}

export const list = query({
	args: {
		coachId: v.optional(v.id("users")),
		status: v.optional(v.string()),
		search: v.optional(v.string()),
	},
	handler: async (ctx, { coachId, status, search }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const user = await ctx.db.get(userId);

		let results;
		if (coachId) {
			results = await ctx.db
				.query("clients")
				.withIndex("by_coachId", (q) => q.eq("coachId", coachId))
				.collect();
		} else if (user?.role === "coach") {
			results = await ctx.db
				.query("clients")
				.withIndex("by_coachId", (q) => q.eq("coachId", userId))
				.collect();
		} else {
			results = await ctx.db.query("clients").order("desc").collect();
		}

		if (status) {
			results = results.filter((c) => c.status === status);
		}
		if (search) {
			const s = search.toLowerCase();
			results = results.filter(
				(c) =>
					c.name.toLowerCase().includes(s) ||
					c.email?.toLowerCase().includes(s) ||
					c.phone?.includes(s),
			);
		}
		return results;
	},
});

export const listGrouped = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const user = await ctx.db.get(userId);

		let clients;
		if (user?.role === "coach") {
			clients = await ctx.db
				.query("clients")
				.withIndex("by_coachId", (q) => q.eq("coachId", userId))
				.collect();
		} else {
			clients = await ctx.db.query("clients").collect();
		}

		// Fetch coaches
		const coachIds = [...new Set(clients.map((c) => c.coachId).filter(Boolean))];
		const coaches = await Promise.all(
			coachIds.map((id) => ctx.db.get(id!)),
		);
		const coachMap = new Map(coaches.filter(Boolean).map((c) => [c!._id, c!]));

		// Group by coach then status
		const grouped: Record<
			string,
			{ coach: { id: string; name: string } | null; byStatus: Record<string, typeof clients> }
		> = {};

		for (const client of clients) {
			const coachKey = client.coachId || "none";
			if (!grouped[coachKey]) {
				const coach = client.coachId ? coachMap.get(client.coachId) : null;
				grouped[coachKey] = {
					coach: coach ? { id: coach._id, name: coach.name || "Sans nom" } : null,
					byStatus: {},
				};
			}
			const status = client.status || "nouveau_client";
			if (!grouped[coachKey].byStatus[status]) {
				grouped[coachKey].byStatus[status] = [];
			}
			grouped[coachKey].byStatus[status].push(client);
		}

		return grouped;
	},
});

export const getById = query({
	args: { id: v.id("clients") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const client = await ctx.db.get(id);
		if (!client) return null;

		const coach = client.coachId ? await ctx.db.get(client.coachId) : null;
		const payments = await ctx.db
			.query("payments")
			.withIndex("by_clientId", (q) => q.eq("clientId", id))
			.order("desc")
			.collect();

		const bilans = await ctx.db
			.query("bilans")
			.withIndex("by_clientId", (q) => q.eq("clientId", id))
			.order("desc")
			.collect();

		const totalCollecte = payments
			.filter((p) => p.status === "confirmed")
			.reduce((sum, p) => sum + p.amount, 0);

		return {
			...client,
			coach,
			payments,
			bilans,
			totalCollecte,
			restantAPayer: client.montantContracteTTC - totalCollecte,
			pourcentageAvancement:
				client.montantContracteTTC > 0
					? Math.round((totalCollecte / client.montantContracteTTC) * 100)
					: 0,
		};
	},
});

export const getStats = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const user = await ctx.db.get(userId);

		let clients;
		if (user?.role === "coach") {
			clients = await ctx.db
				.query("clients")
				.withIndex("by_coachId", (q) => q.eq("coachId", userId))
				.collect();
		} else {
			clients = await ctx.db.query("clients").collect();
		}

		const now = Date.now();
		const thirtyDays = 30 * 24 * 60 * 60 * 1000;
		const thisMonth = new Date();
		thisMonth.setDate(1);
		thisMonth.setHours(0, 0, 0, 0);

		const actifs = clients.filter((c) => c.status === "active");
		const enAttente = clients.filter((c) => c.status === "en_attente_programme");
		const finProche = clients.filter(
			(c) =>
				c.status === "active" && c.dateFinReelle && c.dateFinReelle - now < thirtyDays && c.dateFinReelle > now,
		);
		const enPause = clients.filter((c) => c.status === "paused");
		const nouveaux = clients.filter((c) => c.createdAt >= thisMonth.getTime());

		// Group by coach
		const parCoach = new Map<string, number>();
		for (const c of actifs) {
			if (c.coachId) {
				parCoach.set(c.coachId, (parCoach.get(c.coachId) || 0) + 1);
			}
		}

		return {
			totalActifs: actifs.length,
			enAttenteProgramme: enAttente.length,
			finProche: finProche.length,
			enPause: enPause.length,
			nouveauxCeMois: nouveaux.length,
			total: clients.length,
		};
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
		prestation: v.string(),
		montantContracteTTC: v.number(),
		coachId: v.optional(v.id("users")),
		leadId: v.optional(v.id("leads")),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		dateDebut: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		const dateFinCalculee = args.dateDebut
			? calculateDateFin(args.dateDebut, args.prestation)
			: undefined;

		const clientId = await ctx.db.insert("clients", {
			name: args.name,
			email: args.email,
			phone: args.phone,
			address: args.address,
			status: "nouveau_client",
			prestation: args.prestation,
			montantContracteTTC: args.montantContracteTTC,
			dateDebut: args.dateDebut,
			dateFinCalculee,
			dateFinReelle: dateFinCalculee,
			dateClosing: Date.now(),
			coachId: args.coachId,
			leadId: args.leadId,
			setterId: args.setterId,
			closerId: args.closerId,
			nbJoursPause: 0,
			onboardingStatus: "en_attente",
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Update lead if provided
		if (args.leadId) {
			await ctx.db.patch(args.leadId, {
				clientId,
				type: "client",
				convertedAt: Date.now(),
				updatedAt: Date.now(),
			});
		}

		return clientId;
	},
});

export const update = mutation({
	args: {
		id: v.id("clients"),
		name: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
		status: v.optional(v.string()),
		prestation: v.optional(v.string()),
		coachId: v.optional(v.id("users")),
		trainingLogUrl: v.optional(v.string()),
		telegramGroupUrl: v.optional(v.string()),
		dossierClientUrl: v.optional(v.string()),
		notes: v.optional(v.string()),
		nbJoursPause: v.optional(v.number()),
		dateDebut: v.optional(v.number()),
		onboardingStatus: v.optional(v.string()),
		jourDuBilan: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...fields }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");

		const client = await ctx.db.get(id);
		if (!client) throw new Error("Client introuvable");

		const updates: Record<string, unknown> = { updatedAt: Date.now() };
		for (const [k, val] of Object.entries(fields)) {
			if (val !== undefined) updates[k] = val;
		}

		// Recalculate dates if needed
		const prestation = (fields.prestation || client.prestation) as string;
		const dateDebut = fields.dateDebut || client.dateDebut;
		if (dateDebut && (fields.prestation || fields.dateDebut)) {
			updates.dateFinCalculee = calculateDateFin(dateDebut, prestation);
			const nbPause = fields.nbJoursPause ?? client.nbJoursPause ?? 0;
			if (updates.dateFinCalculee) {
				updates.dateFinReelle =
					(updates.dateFinCalculee as number) + nbPause * 24 * 60 * 60 * 1000;
			}
		}

		if (fields.nbJoursPause !== undefined && client.dateFinCalculee) {
			updates.dateFinReelle =
				client.dateFinCalculee + fields.nbJoursPause * 24 * 60 * 60 * 1000;
		}

		await ctx.db.patch(id, updates);
	},
});

export const remove = mutation({
	args: { id: v.id("clients") },
	handler: async (ctx, { id }) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const caller = await ctx.db.get(userId);
		if (caller?.role !== "admin") throw new Error("Admin requis");
		await ctx.db.delete(id);
	},
});
