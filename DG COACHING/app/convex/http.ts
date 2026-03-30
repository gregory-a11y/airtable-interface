import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Stripe webhook handler
http.route({
	path: "/webhooks/stripe",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		const body = await request.text();
		const signature = request.headers.get("stripe-signature");

		if (!signature) {
			return new Response("Missing stripe-signature header", { status: 400 });
		}

		try {
			const result = await ctx.runAction(internal.stripe.verifyWebhook, {
				body,
				signature,
			});
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (err) {
			console.error("Stripe webhook error:", err);
			return new Response(`Webhook error: ${(err as Error).message}`, { status: 400 });
		}
	}),
});

export default http;
