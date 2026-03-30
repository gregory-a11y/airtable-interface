import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// ============================================================
// SEED DEMO DATA
// ============================================================
export const seedDemoData = mutation({
	args: {},
	handler: async (ctx) => {
		// Check if demo data already exists
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", "maxime@primecoaching.fr"))
			.first();
		if (existing) return { status: "already_seeded" };

		const now = Date.now();
		const DAY = 86_400_000;
		const HOUR = 3_600_000;

		// ─── Helper ───────────────────────────────────────────
		const daysAgo = (d: number) => now - d * DAY;
		const randomBetween = (min: number, max: number) =>
			Math.floor(Math.random() * (max - min + 1)) + min;

		// ============================================================
		// 1. USERS (6)
		// ============================================================
		const _adminId = await ctx.db.insert("users", {
			email: "maxime@primecoaching.fr",
			name: "Maxime Dupont",
			role: "admin",
			status: "active",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 12 34 56 78",
			bio: "Fondateur de Prime Coaching",
			specialty: "Business & Leadership",
			commissionPercent: 0,
		});

		const lucasId = await ctx.db.insert("users", {
			email: "lucas@primecoaching.fr",
			name: "Lucas Martin",
			role: "sales",
			status: "active",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 23 45 67 89",
			specialty: "Closing",
			commissionPercent: 10,
		});

		const sarahId = await ctx.db.insert("users", {
			email: "sarah@primecoaching.fr",
			name: "Sarah Benali",
			role: "sales",
			status: "active",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 34 56 78 90",
			specialty: "Setting & Closing",
			commissionPercent: 10,
		});

		const julieId = await ctx.db.insert("users", {
			email: "julie@primecoaching.fr",
			name: "Julie Moreau",
			role: "coach",
			status: "active",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 45 67 89 01",
			specialty: "Perte de poids & Recomposition",
			pricePerStudent: 15000,
			maxCapacity: 25,
		});

		const thomasId = await ctx.db.insert("users", {
			email: "thomas@primecoaching.fr",
			name: "Thomas Petit",
			role: "coach",
			status: "active",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 56 78 90 12",
			specialty: "Prise de masse & Performance",
			pricePerStudent: 15000,
			maxCapacity: 20,
		});

		const _emmaId = await ctx.db.insert("users", {
			email: "emma@primecoaching.fr",
			name: "Emma Laurent",
			role: "sales",
			status: "disabled",
			passwordHash: "",
			passwordSalt: "",
			mustChangePassword: true,
			phone: "+33 6 67 89 01 23",
			specialty: "Setting",
			commissionPercent: 8,
		});

		const salesIds = [lucasId, sarahId];
		const coachIds = [julieId, thomasId];

		// ============================================================
		// 2. OFFERS (3)
		// ============================================================
		const offer3mId = await ctx.db.insert("offers", {
			name: "Coaching 3 mois",
			type: "classique",
			amount: 299900,
			currency: "EUR",
			paymentMode: "mensuel",
			installmentCount: 3,
			recurringAmount: 99967,
			duration: "3M",
			providers: ["stripe"],
			active: true,
			createdAt: daysAgo(90),
		});

		const offer6mId = await ctx.db.insert("offers", {
			name: "Coaching 6 mois",
			type: "classique",
			amount: 499900,
			currency: "EUR",
			paymentMode: "mensuel",
			installmentCount: 6,
			recurringAmount: 83317,
			duration: "6M",
			providers: ["stripe"],
			active: true,
			createdAt: daysAgo(90),
		});

		const offer12mId = await ctx.db.insert("offers", {
			name: "Accompagnement 12 mois",
			type: "classique",
			amount: 899900,
			currency: "EUR",
			paymentMode: "mensuel",
			installmentCount: 12,
			recurringAmount: 74992,
			duration: "12M",
			providers: ["stripe"],
			active: true,
			createdAt: daysAgo(90),
		});

		const offerIds = [offer3mId, offer6mId, offer12mId];

		// ============================================================
		// 3. LEADS (32)
		// ============================================================
		const raisonsPerte = ["Prix trop élevé", "Pas le bon moment", "Concurrent", "Pas de réponse", "Pas convaincu"];

		const leadData: {
			firstName: string;
			lastName: string;
			email: string;
			phone: string;
			source: string;
			type: "prospect" | "client" | "ancien_client";
			qualification: "qualifie" | "non_qualifie" | "pending";
			etapeClosing: string;
			montantContracte?: number;
			daysAgo: number;
		}[] = [
			// ── appel_a_venir (5) ──
			{ firstName: "Antoine", lastName: "Leroy", email: "antoine.leroy@gmail.com", phone: "+33 6 11 22 33 44", source: "Instagram", type: "prospect", qualification: "pending", etapeClosing: "appel_a_venir", daysAgo: 2 },
			{ firstName: "Camille", lastName: "Fournier", email: "camille.fournier@outlook.fr", phone: "+33 6 22 33 44 55", source: "Facebook Ads", type: "prospect", qualification: "pending", etapeClosing: "appel_a_venir", daysAgo: 1 },
			{ firstName: "Romain", lastName: "Garnier", email: "romain.garnier@yahoo.fr", phone: "+33 6 33 44 55 66", source: "TikTok", type: "prospect", qualification: "pending", etapeClosing: "appel_a_venir", daysAgo: 3 },
			{ firstName: "Léa", lastName: "Chevalier", email: "lea.chevalier@gmail.com", phone: "+33 6 44 55 66 77", source: "Google", type: "prospect", qualification: "pending", etapeClosing: "appel_a_venir", daysAgo: 0 },
			{ firstName: "Hugo", lastName: "Faure", email: "hugo.faure@hotmail.fr", phone: "+33 6 55 66 77 88", source: "Recommandation", type: "prospect", qualification: "pending", etapeClosing: "appel_a_venir", daysAgo: 4 },

			// ── appel_du_jour (4) ──
			{ firstName: "Manon", lastName: "Rousseau", email: "manon.rousseau@gmail.com", phone: "+33 7 11 22 33 44", source: "Instagram", type: "prospect", qualification: "qualifie", etapeClosing: "appel_du_jour", montantContracte: 299900, daysAgo: 0 },
			{ firstName: "Théo", lastName: "Blanc", email: "theo.blanc@outlook.fr", phone: "+33 7 22 33 44 55", source: "Facebook Ads", type: "prospect", qualification: "qualifie", etapeClosing: "appel_du_jour", montantContracte: 499900, daysAgo: 0 },
			{ firstName: "Clara", lastName: "Guérin", email: "clara.guerin@gmail.com", phone: "+33 7 33 44 55 66", source: "Google", type: "prospect", qualification: "qualifie", etapeClosing: "appel_du_jour", montantContracte: 299900, daysAgo: 0 },
			{ firstName: "Nathan", lastName: "Muller", email: "nathan.muller@yahoo.fr", phone: "+33 7 44 55 66 77", source: "TikTok", type: "prospect", qualification: "pending", etapeClosing: "appel_du_jour", daysAgo: 1 },

			// ── follow_up (6) ──
			{ firstName: "Inès", lastName: "Lambert", email: "ines.lambert@gmail.com", phone: "+33 6 66 77 88 99", source: "Instagram", type: "prospect", qualification: "qualifie", etapeClosing: "follow_up", montantContracte: 499900, daysAgo: 7 },
			{ firstName: "Maxence", lastName: "Dupuis", email: "maxence.dupuis@outlook.fr", phone: "+33 6 77 88 99 00", source: "Facebook Ads", type: "prospect", qualification: "qualifie", etapeClosing: "follow_up", montantContracte: 299900, daysAgo: 10 },
			{ firstName: "Chloé", lastName: "Fontaine", email: "chloe.fontaine@gmail.com", phone: "+33 7 55 66 77 88", source: "Recommandation", type: "prospect", qualification: "qualifie", etapeClosing: "follow_up", montantContracte: 899900, daysAgo: 5 },
			{ firstName: "Enzo", lastName: "Robin", email: "enzo.robin@hotmail.fr", phone: "+33 7 66 77 88 99", source: "Google", type: "prospect", qualification: "non_qualifie", etapeClosing: "follow_up", daysAgo: 14 },
			{ firstName: "Jade", lastName: "Marchand", email: "jade.marchand@gmail.com", phone: "+33 7 77 88 99 00", source: "TikTok", type: "prospect", qualification: "qualifie", etapeClosing: "follow_up", montantContracte: 499900, daysAgo: 3 },
			{ firstName: "Raphaël", lastName: "Simon", email: "raphael.simon@yahoo.fr", phone: "+33 6 88 99 00 11", source: "Instagram", type: "prospect", qualification: "qualifie", etapeClosing: "follow_up", montantContracte: 299900, daysAgo: 8 },

			// ── no_show (3) ──
			{ firstName: "Emma", lastName: "Michel", email: "emma.michel@gmail.com", phone: "+33 7 88 99 00 11", source: "Facebook Ads", type: "prospect", qualification: "qualifie", etapeClosing: "no_show", montantContracte: 299900, daysAgo: 12 },
			{ firstName: "Louis", lastName: "Garcia", email: "louis.garcia@outlook.fr", phone: "+33 7 99 00 11 22", source: "Instagram", type: "prospect", qualification: "qualifie", etapeClosing: "no_show", montantContracte: 499900, daysAgo: 6 },
			{ firstName: "Zoé", lastName: "David", email: "zoe.david@gmail.com", phone: "+33 6 99 00 11 22", source: "TikTok", type: "prospect", qualification: "pending", etapeClosing: "no_show", daysAgo: 9 },

			// ── en_attente (3) ──
			{ firstName: "Axel", lastName: "Bertrand", email: "axel.bertrand@hotmail.fr", phone: "+33 6 10 20 30 40", source: "Recommandation", type: "prospect", qualification: "qualifie", etapeClosing: "en_attente", montantContracte: 499900, daysAgo: 20 },
			{ firstName: "Lina", lastName: "Roux", email: "lina.roux@gmail.com", phone: "+33 6 20 30 40 50", source: "Instagram", type: "prospect", qualification: "qualifie", etapeClosing: "en_attente", montantContracte: 299900, daysAgo: 15 },
			{ firstName: "Gabriel", lastName: "Vincent", email: "gabriel.vincent@outlook.fr", phone: "+33 7 10 20 30 40", source: "Google", type: "prospect", qualification: "non_qualifie", etapeClosing: "en_attente", daysAgo: 25 },

			// ── close (6) — these are won deals ──
			{ firstName: "Océane", lastName: "Lefèvre", email: "oceane.lefevre@gmail.com", phone: "+33 6 30 40 50 60", source: "Instagram", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 299900, daysAgo: 30 },
			{ firstName: "Lucas", lastName: "Morel", email: "lucas.morel@outlook.fr", phone: "+33 6 40 50 60 70", source: "Facebook Ads", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 499900, daysAgo: 45 },
			{ firstName: "Ambre", lastName: "Girard", email: "ambre.girard@gmail.com", phone: "+33 7 20 30 40 50", source: "Recommandation", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 899900, daysAgo: 60 },
			{ firstName: "Mathis", lastName: "André", email: "mathis.andre@yahoo.fr", phone: "+33 7 30 40 50 60", source: "Google", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 499900, daysAgo: 15 },
			{ firstName: "Eva", lastName: "Lemaire", email: "eva.lemaire@gmail.com", phone: "+33 6 50 60 70 80", source: "Instagram", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 299900, daysAgo: 75 },
			{ firstName: "Nolan", lastName: "Henry", email: "nolan.henry@hotmail.fr", phone: "+33 7 40 50 60 70", source: "TikTok", type: "client", qualification: "qualifie", etapeClosing: "close", montantContracte: 499900, daysAgo: 20 },

			// ── perdu (5) ──
			{ firstName: "Léonie", lastName: "Perrin", email: "leonie.perrin@gmail.com", phone: "+33 6 60 70 80 90", source: "Facebook Ads", type: "ancien_client", qualification: "qualifie", etapeClosing: "perdu", montantContracte: 299900, daysAgo: 40 },
			{ firstName: "Sacha", lastName: "Bonnet", email: "sacha.bonnet@outlook.fr", phone: "+33 6 70 80 90 01", source: "Instagram", type: "prospect", qualification: "non_qualifie", etapeClosing: "perdu", daysAgo: 55 },
			{ firstName: "Lola", lastName: "Renaud", email: "lola.renaud@gmail.com", phone: "+33 7 50 60 70 80", source: "Google", type: "prospect", qualification: "qualifie", etapeClosing: "perdu", montantContracte: 499900, daysAgo: 35 },
			{ firstName: "Tom", lastName: "Picard", email: "tom.picard@yahoo.fr", phone: "+33 7 60 70 80 90", source: "Recommandation", type: "prospect", qualification: "qualifie", etapeClosing: "perdu", montantContracte: 899900, daysAgo: 50 },
			{ firstName: "Alice", lastName: "Dumont", email: "alice.dumont@hotmail.fr", phone: "+33 7 70 80 90 01", source: "TikTok", type: "prospect", qualification: "qualifie", etapeClosing: "perdu", montantContracte: 299900, daysAgo: 28 },
		];

		const leadIds: Id<"leads">[] = [];

		for (let i = 0; i < leadData.length; i++) {
			const ld = leadData[i];
			const setterId = salesIds[i % 2];
			const closerId = salesIds[(i + 1) % 2];
			const createdAt = daysAgo(ld.daysAgo);

			const leadId = await ctx.db.insert("leads", {
				name: `${ld.firstName} ${ld.lastName}`,
				firstName: ld.firstName,
				lastName: ld.lastName,
				email: ld.email,
				phone: ld.phone,
				source: ld.source,
				type: ld.type,
				qualification: ld.qualification,
				etapeClosing: ld.etapeClosing,
				raisonPerte: ld.etapeClosing === "perdu" ? raisonsPerte[i % raisonsPerte.length] : undefined,
				setterId,
				closerId,
				montantContracte: ld.montantContracte,
				dateBookingCall: ld.etapeClosing !== "appel_a_venir" ? createdAt - 2 * DAY : createdAt + DAY,
				dateAppelVente: ["appel_du_jour", "follow_up", "close", "perdu"].includes(ld.etapeClosing) ? createdAt : undefined,
				offerId: ld.montantContracte ? offerIds[ld.montantContracte === 299900 ? 0 : ld.montantContracte === 499900 ? 1 : 2] : undefined,
				noteInterne: ld.etapeClosing === "follow_up" ? "Relancer cette semaine" : undefined,
				createdAt,
				updatedAt: createdAt,
			});

			leadIds.push(leadId);
		}

		// ============================================================
		// 4. CLIENTS (12)
		// ============================================================
		const clientData: {
			name: string;
			email: string;
			phone: string;
			status: string;
			prestation: string;
			montantContracteTTC: number;
			daysAgoDebut: number;
			coachIdx: number;
			leadIdx: number; // index in leadIds for "close" leads (index 21-26)
			hasTrainingLog: boolean;
			hasTelegramGroup: boolean;
		}[] = [
			{ name: "Océane Lefèvre", email: "oceane.lefevre@gmail.com", phone: "+33 6 30 40 50 60", status: "active", prestation: "3M", montantContracteTTC: 299900, daysAgoDebut: 28, coachIdx: 0, leadIdx: 21, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Lucas Morel", email: "lucas.morel@outlook.fr", phone: "+33 6 40 50 60 70", status: "active", prestation: "6M", montantContracteTTC: 499900, daysAgoDebut: 42, coachIdx: 1, leadIdx: 22, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Ambre Girard", email: "ambre.girard@gmail.com", phone: "+33 7 20 30 40 50", status: "active", prestation: "12M", montantContracteTTC: 899900, daysAgoDebut: 58, coachIdx: 0, leadIdx: 23, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Mathis André", email: "mathis.andre@yahoo.fr", phone: "+33 7 30 40 50 60", status: "nouveau_client", prestation: "6M", montantContracteTTC: 499900, daysAgoDebut: 10, coachIdx: 1, leadIdx: 24, hasTrainingLog: false, hasTelegramGroup: false },
			{ name: "Eva Lemaire", email: "eva.lemaire@gmail.com", phone: "+33 6 50 60 70 80", status: "active", prestation: "3M", montantContracteTTC: 299900, daysAgoDebut: 70, coachIdx: 0, leadIdx: 25, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Nolan Henry", email: "nolan.henry@hotmail.fr", phone: "+33 7 40 50 60 70", status: "acompte", prestation: "6M", montantContracteTTC: 499900, daysAgoDebut: 5, coachIdx: 1, leadIdx: 26, hasTrainingLog: false, hasTelegramGroup: false },
			// Additional clients not from leads above
			{ name: "Sophie Duval", email: "sophie.duval@gmail.com", phone: "+33 6 81 22 33 44", status: "active", prestation: "3M", montantContracteTTC: 299900, daysAgoDebut: 90, coachIdx: 0, leadIdx: -1, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Pierre Legrand", email: "pierre.legrand@outlook.fr", phone: "+33 6 82 33 44 55", status: "termine", prestation: "3M", montantContracteTTC: 299900, daysAgoDebut: 120, coachIdx: 1, leadIdx: -1, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Margaux Petit", email: "margaux.petit@gmail.com", phone: "+33 7 81 22 33 44", status: "en_attente", prestation: "6M", montantContracteTTC: 499900, daysAgoDebut: 50, coachIdx: 0, leadIdx: -1, hasTrainingLog: true, hasTelegramGroup: false },
			{ name: "Julien Bernard", email: "julien.bernard@yahoo.fr", phone: "+33 7 82 33 44 55", status: "paused", prestation: "12M", montantContracteTTC: 899900, daysAgoDebut: 80, coachIdx: 1, leadIdx: -1, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Anaïs Dubois", email: "anais.dubois@gmail.com", phone: "+33 6 83 44 55 66", status: "active", prestation: "6M", montantContracteTTC: 499900, daysAgoDebut: 35, coachIdx: 0, leadIdx: -1, hasTrainingLog: true, hasTelegramGroup: true },
			{ name: "Kévin Mercier", email: "kevin.mercier@hotmail.fr", phone: "+33 7 83 44 55 66", status: "nouveau_client", prestation: "3M", montantContracteTTC: 299900, daysAgoDebut: 3, coachIdx: 1, leadIdx: -1, hasTrainingLog: false, hasTelegramGroup: false },
		];

		const clientIds: Id<"clients">[] = [];

		for (let i = 0; i < clientData.length; i++) {
			const cd = clientData[i];
			const dateDebut = daysAgo(cd.daysAgoDebut);
			const setterId = salesIds[i % 2];
			const closerId = salesIds[(i + 1) % 2];
			const durationMonths = cd.prestation === "3M" ? 3 : cd.prestation === "6M" ? 6 : 12;
			const dateFinCalculee = dateDebut + durationMonths * 30 * DAY;

			const clientId = await ctx.db.insert("clients", {
				name: cd.name,
				email: cd.email,
				phone: cd.phone,
				status: cd.status,
				prestation: cd.prestation,
				montantContracteTTC: cd.montantContracteTTC,
				dateDebut,
				dateFinCalculee,
				dateClosing: dateDebut - 2 * DAY,
				coachId: coachIds[cd.coachIdx],
				leadId: cd.leadIdx >= 0 ? leadIds[cd.leadIdx] : undefined,
				setterId,
				closerId,
				commissionPercentSetter: 5,
				commissionPercentCloser: 10,
				trainingLogUrl: cd.hasTrainingLog ? "https://docs.google.com/spreadsheets/d/example" : undefined,
				telegramGroupUrl: cd.hasTelegramGroup ? "https://t.me/+example" : undefined,
				onboardingStatus: cd.status === "nouveau_client" ? "en_cours" : "termine",
				jourDuBilan: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"][i % 5],
				createdAt: dateDebut,
				updatedAt: now,
			});

			clientIds.push(clientId);
		}

		// ============================================================
		// 5. TRANSACTIONS (15)
		// ============================================================
		const transactionStatuses: ("pending" | "partial" | "completed" | "failed")[] = ["completed", "completed", "completed", "completed", "completed", "completed", "partial", "partial", "partial", "completed", "completed", "pending", "completed", "completed", "failed"];

		const txIds: Id<"transactions">[] = [];

		for (let i = 0; i < 15; i++) {
			const clientIdx = i % clientIds.length;
			const offerIdx = i % 3;
			const cd = clientData[clientIdx];
			const status = transactionStatuses[i];
			const createdAt = daysAgo(randomBetween(5, 80));
			const installmentTotal = offerIdx === 0 ? 3 : offerIdx === 1 ? 6 : 12;
			const installmentCurrent = status === "completed" ? installmentTotal : status === "partial" ? randomBetween(1, installmentTotal - 1) : status === "pending" ? 0 : 1;

			const txId = await ctx.db.insert("transactions", {
				pid: `PID-${String(i + 1).padStart(4, "0")}`,
				offerId: offerIds[offerIdx],
				prospectName: cd.name,
				prospectEmail: cd.email,
				prospectPhone: cd.phone,
				clientId: clientIds[clientIdx],
				leadId: cd.leadIdx >= 0 ? leadIds[cd.leadIdx] : undefined,
				provider: "stripe",
				providerTxId: `pi_${Date.now()}_${i}`,
				status,
				installmentCurrent,
				installmentTotal,
				createdAt,
				confirmedAt: status === "completed" ? createdAt + HOUR : status === "partial" ? createdAt + HOUR : undefined,
			});

			txIds.push(txId);
		}

		// ============================================================
		// 6. PAYMENTS (24)
		// ============================================================
		const paymentStatuses: ("confirmed" | "failed" | "pending")[] = ["confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "confirmed", "failed", "failed", "pending", "pending", "confirmed", "confirmed", "confirmed"];

		for (let i = 0; i < 24; i++) {
			const txIdx = i % txIds.length;
			const clientIdx = i % clientIds.length;
			const status = paymentStatuses[i];
			const amount = [99967, 83317, 74992, 149950, 99967, 83317, 74992, 149950, 99967, 83317, 74992, 99967, 83317, 74992, 149950, 99967, 83317, 74992, 99967, 83317, 74992, 149950, 99967, 83317][i];
			const createdAt = daysAgo(randomBetween(1, 85));
			const setterId = salesIds[i % 2];
			const closerId = salesIds[(i + 1) % 2];
			const commissionClosing = status === "confirmed" ? Math.round(amount * 0.10) : undefined;
			const commissionSetting = status === "confirmed" ? Math.round(amount * 0.05) : undefined;

			await ctx.db.insert("payments", {
				transactionId: txIds[txIdx],
				pid: `PID-${String(txIdx + 1).padStart(4, "0")}`,
				amount,
				amountHT: Math.round(amount / 1.2),
				provider: "stripe",
				providerTxId: `ch_${Date.now()}_${i}`,
				providerPaymentId: `py_${Date.now()}_${i}`,
				status,
				installmentNumber: (i % 6) + 1,
				sourceType: "recurring",
				commissionClosing,
				commissionSetting,
				clientId: clientIds[clientIdx],
				closerId,
				setterId,
				confirmedAt: status === "confirmed" ? createdAt + HOUR : undefined,
				createdAt,
			});
		}

		return {
			status: "seeded",
			counts: {
				users: 6,
				offers: 3,
				leads: leadData.length,
				clients: clientData.length,
				transactions: 15,
				payments: 24,
			},
		};
	},
});

// ============================================================
// CLEANUP DEMO DATA
// ============================================================
export const cleanDemoData = mutation({
	args: {},
	handler: async (ctx) => {
		const tables = ["payments", "transactions", "clients", "leads", "offers", "users"] as const;
		let totalDeleted = 0;

		for (const table of tables) {
			const docs = await ctx.db.query(table).collect();
			for (const doc of docs) {
				await ctx.db.delete(doc._id);
				totalDeleted++;
			}
		}

		return { deleted: totalDeleted };
	},
});

export const fullCleanup = mutation({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		let deleted = 0;
		const users = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.collect();
		for (const u of users) {
			await ctx.db.delete(u._id);
			deleted++;
		}
		return { deleted };
	},
});

export const promoteToAdmin = mutation({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const users = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email))
			.collect();
		if (users.length === 0) throw new Error("Utilisateur non trouve");
		const user = users[users.length - 1];
		await ctx.db.patch(user._id, { role: "admin", status: "active", name: "Gregory Giunta" });
		return { id: user._id };
	},
});

// Create admin account and send credentials email
export const createAdminAndSendEmail = action({
	args: { email: v.string(), password: v.string() },
	handler: async (ctx, { email, password }) => {
		// Step 1: Create account via custom auth
		await ctx.runMutation(api.auth.createAccount, {
			email,
			password,
			name: "Gregory Giunta",
			role: "admin",
			mustChangePassword: false,
		});

		// Step 2: Send email with credentials
		const siteUrl = process.env.SITE_URL || "http://localhost:3000";
		const resendRes = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Prime Coaching <noreply@send.galdencoaching.com>",
				to: [email],
				subject: "Vos acces Prime Coaching ERP — Admin",
				html: `
					<div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
						<div style="text-align: center; margin-bottom: 32px;">
							<h1 style="color: #D0003C; font-size: 24px; margin: 0;">Prime Coaching</h1>
							<p style="color: #64748B; font-size: 14px; margin-top: 4px;">ERP Interne</p>
						</div>
						<div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 32px;">
							<h2 style="color: #0F172A; font-size: 18px; margin: 0 0 8px;">Bienvenue !</h2>
							<p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
								Votre compte administrateur Prime Coaching est pret. Voici vos identifiants :
							</p>
							<div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
								<p style="color: #64748B; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
								<p style="color: #0F172A; font-size: 16px; font-weight: 700; margin: 0 0 16px;">${email}</p>
								<p style="color: #64748B; font-size: 12px; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">Mot de passe</p>
								<p style="color: #D0003C; font-size: 20px; font-weight: 700; margin: 0; font-family: monospace; letter-spacing: 2px;">${password}</p>
							</div>
							<a href="${siteUrl}/login" style="display: block; text-align: center; background: #D0003C; color: #FFFFFF; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-size: 15px; font-weight: 600;">
								Se connecter
							</a>
						</div>
					</div>
				`,
			}),
		});

		if (!resendRes.ok) {
			const errText = await resendRes.text();
			throw new Error(`Resend failed: ${errText}`);
		}

		return { success: true, email };
	},
});
