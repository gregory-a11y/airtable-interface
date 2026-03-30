"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import Stripe from "stripe";

function getStripe() {
	return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

/**
 * Create a Stripe Checkout session for a given PID.
 * Called from the frontend payment page.
 */
export const createCheckoutSession = action({
	args: {
		pid: v.string(),
		successUrl: v.string(),
		cancelUrl: v.string(),
	},
	handler: async (ctx, args): Promise<{ url: string | null }> => {
		const stripe = getStripe();

		const txData = await ctx.runQuery(internal.paymentInternal.getTransactionByPID, { pid: args.pid });
		if (!txData) throw new Error("Transaction introuvable");

		const { transaction, offer } = txData;
		if (!offer) throw new Error("Offre introuvable");
		if (transaction.status === "completed") throw new Error("Paiement deja effectue");

		// Determine amount for this specific payment
		let amount: number;
		if (offer.paymentMode === "unique") {
			amount = offer.amount;
		} else if (
			offer.paymentMode === "fixe_plus_mensuel" &&
			(transaction.installmentCurrent || 0) === 0
		) {
			amount = offer.firstPaymentAmount || offer.amount;
		} else {
			amount = offer.recurringAmount || offer.amount;
		}

		const installmentLabel =
			offer.installmentCount && offer.installmentCount > 1
				? ` — Paiement ${(transaction.installmentCurrent || 0) + 1}/${offer.installmentCount}`
				: "";

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "eur",
						product_data: {
							name: `${offer.name}${installmentLabel}`,
						},
						unit_amount: amount,
					},
					quantity: 1,
				},
			],
			metadata: {
				pid: args.pid,
				offerId: offer._id,
			},
			customer_email: transaction.prospectEmail || undefined,
			success_url: `${args.successUrl}?pid=${args.pid}&status=success`,
			cancel_url: `${args.cancelUrl}?pid=${args.pid}&status=cancelled`,
		});

		// Store Stripe session ID on the transaction
		await ctx.runMutation(internal.paymentInternal.updateProviderTx, {
			pid: args.pid,
			provider: "stripe",
			providerTxId: session.id,
		});

		return { url: session.url };
	},
});

/**
 * Verify Stripe webhook signature and process the event.
 * Called from httpAction in http.ts.
 */
export const verifyWebhook = internalAction({
	args: {
		body: v.string(),
		signature: v.string(),
	},
	handler: async (ctx, { body, signature }) => {
		const stripe = getStripe();
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			throw new Error(`Webhook signature verification failed: ${(err as Error).message}`);
		}

		// Idempotency: check if already processed
		const existing = await ctx.runQuery(internal.paymentInternal.getWebhookEvent, {
			providerEventId: event.id,
		});
		if (existing?.processed) {
			return { alreadyProcessed: true };
		}

		// Record webhook event
		await ctx.runMutation(internal.paymentInternal.recordWebhookEvent, {
			providerEventId: event.id,
			provider: "stripe",
			eventType: event.type,
		});

		// Process checkout.session.completed
		if (event.type === "checkout.session.completed") {
			const session = event.data.object as Stripe.Checkout.Session;
			const pid = session.metadata?.pid;
			if (pid) {
				await ctx.runMutation(internal.paymentInternal.confirmPayment, {
					pid,
					provider: "stripe",
					providerTxId: session.id,
					providerPaymentId:
						typeof session.payment_intent === "string"
							? session.payment_intent
							: undefined,
					amountReceived: session.amount_total || 0,
				});
			}
		}

		// Mark event as processed
		await ctx.runMutation(internal.paymentInternal.markWebhookProcessed, {
			providerEventId: event.id,
		});

		return { processed: true, eventType: event.type };
	},
});
