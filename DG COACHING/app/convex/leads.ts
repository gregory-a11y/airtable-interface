import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
	args: {
		name: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		instagram: v.optional(v.string()),
		address: v.optional(v.string()),
		source: v.string(),
		type: v.union(v.literal("prospect"), v.literal("client"), v.literal("ancien_client")),
		qualification: v.union(
			v.literal("qualifie"),
			v.literal("non_qualifie"),
			v.literal("pending"),
		),
		etapeClosing: v.optional(v.string()),
		raisonPerte: v.optional(v.string()),
		etapeSetting: v.optional(v.string()),
		leadType: v.optional(v.string()),
		dateBookingCall: v.optional(v.number()),
		dateAppelVente: v.optional(v.number()),
		meetingUrl: v.optional(v.string()),
		videoCallUrl: v.optional(v.string()),
		transcriptCall: v.optional(v.string()),
		questionnaireAnswers: v.optional(v.string()),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		montantContracte: v.optional(v.number()),
		noteInterne: v.optional(v.string()),
	},
	handler: async (ctx, args) => {

		const now = Date.now();
		const id = await ctx.db.insert("leads", {
			...args,
			etapeClosing: args.etapeClosing ?? "appel_a_venir",
			createdAt: now,
			updatedAt: now,
		});
		return id;
	},
});

export const update = mutation({
	args: {
		id: v.id("leads"),
		name: v.optional(v.string()),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		instagram: v.optional(v.string()),
		address: v.optional(v.string()),
		source: v.optional(v.string()),
		type: v.optional(
			v.union(v.literal("prospect"), v.literal("client"), v.literal("ancien_client")),
		),
		qualification: v.optional(
			v.union(v.literal("qualifie"), v.literal("non_qualifie"), v.literal("pending")),
		),
		etapeClosing: v.optional(v.string()),
		raisonPerte: v.optional(v.string()),
		etapeSetting: v.optional(v.string()),
		leadType: v.optional(v.string()),
		dateBookingCall: v.optional(v.number()),
		dateAppelVente: v.optional(v.number()),
		meetingUrl: v.optional(v.string()),
		videoCallUrl: v.optional(v.string()),
		transcriptCall: v.optional(v.string()),
		questionnaireAnswers: v.optional(v.string()),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		montantContracte: v.optional(v.number()),
		noteInterne: v.optional(v.string()),
	},
	handler: async (ctx, { id, ...fields }) => {

		const updates: Record<string, unknown> = { updatedAt: Date.now() };
		for (const [key, val] of Object.entries(fields)) {
			if (val !== undefined) updates[key] = val;
		}
		await ctx.db.patch(id, updates);
	},
});

export const updateEtape = mutation({
	args: {
		id: v.id("leads"),
		etape: v.string(),
	},
	handler: async (ctx, { id, etape }) => {
		const lead = await ctx.db.get(id);
		if (!lead) throw new Error("Lead introuvable");

		await ctx.db.patch(id, {
			etapeClosing: etape,
			updatedAt: Date.now(),
		});
	},
});

export const remove = mutation({
	args: { id: v.id("leads") },
	handler: async (ctx, { id }) => {


		await ctx.db.delete(id);
	},
});

export const assignSetter = mutation({
	args: {
		id: v.id("leads"),
		setterId: v.id("users"),
	},
	handler: async (ctx, { id, setterId }) => {
		await ctx.db.patch(id, { setterId, updatedAt: Date.now() });
	},
});

export const assignCloser = mutation({
	args: {
		id: v.id("leads"),
		closerId: v.id("users"),
	},
	handler: async (ctx, { id, closerId }) => {
		await ctx.db.patch(id, { closerId, updatedAt: Date.now() });
	},
});

// ============================================================
// QUERIES
// ============================================================

export const list = query({
	args: {
		etape: v.optional(v.string()),
		source: v.optional(v.string()),
		qualification: v.optional(v.string()),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		search: v.optional(v.string()),
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
		page: v.optional(v.number()),
		perPage: v.optional(v.number()),
	},
	handler: async (ctx, args) => {

		let leads = await ctx.db.query("leads").order("desc").collect();

		// Filters
		if (args.etape) {
			leads = leads.filter((l) => l.etapeClosing === args.etape);
		}
		if (args.source) {
			leads = leads.filter((l) => l.source === args.source);
		}
		if (args.qualification) {
			leads = leads.filter((l) => l.qualification === args.qualification);
		}
		if (args.setterId) {
			leads = leads.filter((l) => l.setterId === args.setterId);
		}
		if (args.closerId) {
			leads = leads.filter((l) => l.closerId === args.closerId);
		}
		if (args.dateFrom) {
			leads = leads.filter((l) => l.createdAt >= args.dateFrom!);
		}
		if (args.dateTo) {
			leads = leads.filter((l) => l.createdAt <= args.dateTo!);
		}
		if (args.search) {
			const s = args.search.toLowerCase();
			leads = leads.filter(
				(l) =>
					l.name.toLowerCase().includes(s) ||
					(l.email && l.email.toLowerCase().includes(s)) ||
					(l.phone && l.phone.includes(s)),
			);
		}

		const total = leads.length;
		const perPage = args.perPage ?? 20;
		const page = args.page ?? 0;
		const paginated = leads.slice(page * perPage, (page + 1) * perPage);

		return { leads: paginated, total, page, perPage };
	},
});

export const getById = query({
	args: { id: v.id("leads") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const getByEtape = query({
	args: {
		search: v.optional(v.string()),
		source: v.optional(v.string()),
		qualification: v.optional(v.string()),
	},
	handler: async (ctx, args) => {

		let leads = await ctx.db.query("leads").order("desc").collect();

		if (args.source) {
			leads = leads.filter((l) => l.source === args.source);
		}
		if (args.qualification) {
			leads = leads.filter((l) => l.qualification === args.qualification);
		}
		if (args.search) {
			const s = args.search.toLowerCase();
			leads = leads.filter(
				(l) =>
					l.name.toLowerCase().includes(s) ||
					(l.email && l.email.toLowerCase().includes(s)) ||
					(l.phone && l.phone.includes(s)),
			);
		}

		const etapes = [
			"appel_a_venir",
			"appel_du_jour",
			"follow_up",
			"no_show",
			"en_attente",
			"close",
			"perdu",
		];

		const grouped: Record<string, typeof leads> = {};
		for (const etape of etapes) {
			grouped[etape] = leads.filter((l) => l.etapeClosing === etape);
		}

		return grouped;
	},
});

export const getStats = query({
	args: {
		closerId: v.optional(v.id("users")),
		dateFrom: v.optional(v.number()),
		dateTo: v.optional(v.number()),
	},
	handler: async (ctx, args) => {

		let leads = await ctx.db.query("leads").collect();

		// Filter by closer
		if (args.closerId) {
			leads = leads.filter((l) => l.closerId === args.closerId);
		}

		// Filter by date range
		if (args.dateFrom) {
			leads = leads.filter((l) => l.createdAt >= args.dateFrom!);
		}
		if (args.dateTo) {
			leads = leads.filter((l) => l.createdAt <= args.dateTo!);
		}

		// KPIs
		const callsProgrammes = leads.filter(
			(l) => l.etapeClosing === "appel_a_venir" || l.etapeClosing === "appel_du_jour",
		).length;

		const callsEffectues = leads.filter(
			(l) => l.etapeClosing !== "appel_a_venir" && l.dateAppelVente,
		).length;

		const totalLeadsWithCall =
			leads.filter((l) => l.dateAppelVente || l.etapeClosing !== "appel_a_venir").length || 1;

		const showRate = totalLeadsWithCall > 0 ? (callsEffectues / totalLeadsWithCall) * 100 : 0;

		const closes = leads.filter((l) => l.etapeClosing === "close");
		const closeCount = closes.length;
		const closeRate = callsEffectues > 0 ? (closeCount / callsEffectues) * 100 : 0;

		const caContracte = closes.reduce((sum, l) => sum + (l.montantContracte ?? 0), 0);
		const panierMoyen = closeCount > 0 ? caContracte / closeCount : 0;
		const caParCall = callsEffectues > 0 ? caContracte / callsEffectues : 0;

		// Raisons perte
		const perdu = leads.filter((l) => l.etapeClosing === "perdu");
		const raisonsMap: Record<string, number> = {};
		for (const l of perdu) {
			const raison = l.raisonPerte || "Non specifie";
			raisonsMap[raison] = (raisonsMap[raison] ?? 0) + 1;
		}
		const raisonsPerte = Object.entries(raisonsMap)
			.map(([raison, count]) => ({ raison, count }))
			.sort((a, b) => b.count - a.count);

		// Top closers
		const closerMap: Record<string, { closes: number; calls: number; ca: number }> = {};
		for (const l of leads) {
			if (!l.closerId) continue;
			const cid = l.closerId;
			if (!closerMap[cid]) closerMap[cid] = { closes: 0, calls: 0, ca: 0 };
			if (l.dateAppelVente || l.etapeClosing !== "appel_a_venir") {
				closerMap[cid].calls += 1;
			}
			if (l.etapeClosing === "close") {
				closerMap[cid].closes += 1;
				closerMap[cid].ca += l.montantContracte ?? 0;
			}
		}

		const topClosersRaw = Object.entries(closerMap).map(([closerId, data]) => ({
			closerId,
			closes: data.closes,
			calls: data.calls,
			ca: data.ca,
			closeRate: data.calls > 0 ? (data.closes / data.calls) * 100 : 0,
		}));
		topClosersRaw.sort((a, b) => b.closeRate - a.closeRate);

		// Resolve closer names
		const topClosers = [];
		for (const tc of topClosersRaw.slice(0, 10)) {
			const user = tc.closerId ? await ctx.db.get(tc.closerId as any) : null;
			const userName = user && "name" in user ? (user as { name?: string }).name : undefined;
			topClosers.push({
				...tc,
				name: userName ?? "Inconnu",
			});
		}

		// Funnel data
		const totalLeads = leads.length;
		const appelsPris = leads.filter(
			(l) =>
				l.etapeClosing !== "appel_a_venir" && l.etapeClosing !== "no_show",
		).length;
		const enNego = leads.filter(
			(l) =>
				l.etapeClosing === "follow_up" ||
				l.etapeClosing === "en_attente" ||
				l.etapeClosing === "close",
		).length;

		const funnel = [
			{ name: "Leads", value: totalLeads },
			{ name: "Appels pris", value: appelsPris },
			{ name: "En nego", value: enNego },
			{ name: "Closes", value: closeCount },
		];

		// Revenue by month (last 12 months)
		const now = Date.now();
		const monthlyRevenue: { month: string; contracte: number; collecte: number }[] = [];
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now);
			d.setMonth(d.getMonth() - i);
			const year = d.getFullYear();
			const month = d.getMonth();
			const monthStart = new Date(year, month, 1).getTime();
			const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();

			const monthLeads = leads.filter(
				(l) => l.createdAt >= monthStart && l.createdAt <= monthEnd,
			);
			const contracte = monthLeads
				.filter((l) => l.etapeClosing === "close")
				.reduce((s, l) => s + (l.montantContracte ?? 0), 0);

			const label = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "2-digit" }).format(
				new Date(year, month),
			);

			monthlyRevenue.push({
				month: label,
				contracte,
				collecte: Math.round(contracte * 0.7), // Approximation since we don't have payment data in scope
			});
		}

		return {
			callsProgrammes,
			callsEffectues,
			showRate: Math.round(showRate * 10) / 10,
			closeCount,
			closeRate: Math.round(closeRate * 10) / 10,
			caContracte,
			panierMoyen: Math.round(panierMoyen),
			caParCall: Math.round(caParCall),
			raisonsPerte,
			topClosers,
			funnel,
			monthlyRevenue,
			totalLeads: leads.length,
		};
	},
});
