import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getDashboard = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Non authentifie");
		const user = await ctx.db.get(userId);
		if (user?.role !== "admin") throw new Error("Admin requis");

		const allPayments = await ctx.db.query("payments").collect();
		const confirmed = allPayments.filter((p) => p.status === "confirmed");
		const allClients = await ctx.db.query("clients").collect();
		const allExpenses = await ctx.db.query("expenses").collect();

		const caCollecte = confirmed.reduce((sum, p) => sum + p.amount, 0);
		const caContracte = allClients.reduce((sum, c) => sum + c.montantContracteTTC, 0);
		const sorties = allExpenses.reduce((sum, e) => sum + e.amount, 0);
		const benefices = caCollecte - sorties;
		const ratioProfits = caCollecte > 0 ? Math.round((benefices / caCollecte) * 100) : 0;
		const tauxCollecte = caContracte > 0 ? Math.round((caCollecte / caContracte) * 100) : 0;

		// Monthly evolution (last 12 months)
		const now = new Date();
		const evolution = [];
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const monthStart = d.getTime();
			const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
			const monthLabel = d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });

			const monthCollecte = confirmed
				.filter((p) => p.confirmedAt && p.confirmedAt >= monthStart && p.confirmedAt < nextMonth)
				.reduce((sum, p) => sum + p.amount, 0);

			const monthContracte = allClients
				.filter((c) => c.dateClosing && c.dateClosing >= monthStart && c.dateClosing < nextMonth)
				.reduce((sum, c) => sum + c.montantContracteTTC, 0);

			evolution.push({ month: monthLabel, collecte: monthCollecte, contracte: monthContracte });
		}

		// By source
		const bySource = new Map<string, number>();
		for (const p of confirmed) {
			const src = p.sourceType || p.provider || "Autre";
			bySource.set(src, (bySource.get(src) || 0) + p.amount);
		}

		// By prestation
		const byPrestation = new Map<string, number>();
		for (const c of allClients) {
			byPrestation.set(c.prestation, (byPrestation.get(c.prestation) || 0) + c.montantContracteTTC);
		}

		// This month
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
		const ceMoisCollecte = confirmed
			.filter((p) => p.confirmedAt && p.confirmedAt >= thisMonthStart)
			.reduce((sum, p) => sum + p.amount, 0);
		const moisPrecedentCollecte = confirmed
			.filter((p) => p.confirmedAt && p.confirmedAt >= lastMonthStart && p.confirmedAt < thisMonthStart)
			.reduce((sum, p) => sum + p.amount, 0);

		return {
			caCollecte,
			caContracte,
			sorties,
			benefices,
			ratioProfits,
			tauxCollecte,
			evolution,
			bySource: Array.from(bySource.entries()).map(([name, value]) => ({ name, value })),
			byPrestation: Array.from(byPrestation.entries())
				.map(([name, value]) => ({ name, value }))
				.sort((a, b) => b.value - a.value),
			ceMois: {
				collecte: ceMoisCollecte,
				trend: moisPrecedentCollecte > 0
					? Math.round(((ceMoisCollecte - moisPrecedentCollecte) / moisPrecedentCollecte) * 100)
					: 0,
			},
		};
	},
});
