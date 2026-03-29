"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { formatEUR } from "@/lib/utils";
import Image from "next/image";
import { CreditCard, Wallet, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useState, Suspense } from "react";

function PaymentContent() {
	const searchParams = useSearchParams();
	const pid = searchParams.get("pid");
	const offerId = searchParams.get("offer");

	const data = useQuery(api.transactions.getByPIDPublic, pid ? { pid } : "skip");
	const [selectedMethod, setSelectedMethod] = useState<"stripe" | "paypal">("stripe");
	const [processing, setProcessing] = useState(false);

	if (!pid || !offerId) {
		return <ErrorState message="Lien de paiement invalide" />;
	}

	if (data === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	if (!data) {
		return <ErrorState message="Ce lien de paiement n'est pas valide ou a expire" />;
	}

	const { transaction, offer } = data;

	if (transaction.status === "completed") {
		return (
			<div className="text-center">
				<CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
				<h2 className="mt-4 text-xl font-bold text-slate-800">Paiement confirme !</h2>
				<p className="mt-2 text-sm text-slate-500">
					Bienvenue chez Prime Coaching. Vous recevrez un email de confirmation.
				</p>
			</div>
		);
	}

	if (transaction.status === "failed") {
		return <ErrorState message="Ce paiement a echoue. Contactez l'equipe Prime Coaching." />;
	}

	const handlePay = async () => {
		setProcessing(true);
		// In production: call Stripe Checkout or PayPal Orders API
		// For now, show processing state
		setTimeout(() => setProcessing(false), 3000);
	};

	const installmentLabel = offer?.installmentCount
		? `${offer.installmentCount} mensualites de ${formatEUR(offer.recurringAmount || 0)}`
		: null;

	return (
		<div className="space-y-6">
			{/* Offer summary */}
			<div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
				<h2 className="text-lg font-bold text-slate-800">{offer?.name}</h2>
				<div className="mt-2 text-3xl font-bold text-[#D0003C]">
					{formatEUR(offer?.amount || 0)}
				</div>
				{installmentLabel && (
					<p className="mt-1 text-sm text-slate-500">{installmentLabel}</p>
				)}
			</div>

			{/* Payment method */}
			<div className="space-y-3">
				<p className="text-sm font-medium text-slate-700">Moyen de paiement</p>

				<label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 p-4 transition-colors has-[:checked]:border-[#D0003C] has-[:checked]:bg-red-50/50">
					<input
						type="radio"
						name="method"
						value="stripe"
						checked={selectedMethod === "stripe"}
						onChange={() => setSelectedMethod("stripe")}
						className="sr-only"
					/>
					<CreditCard className="h-5 w-5 text-slate-600" />
					<div className="flex-1">
						<div className="text-sm font-medium text-slate-800">Carte bancaire</div>
						<div className="text-xs text-slate-400">
							CB, Visa, Mastercard, Apple Pay, Google Pay
						</div>
					</div>
				</label>

				<label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-slate-200 p-4 transition-colors has-[:checked]:border-[#D0003C] has-[:checked]:bg-red-50/50">
					<input
						type="radio"
						name="method"
						value="paypal"
						checked={selectedMethod === "paypal"}
						onChange={() => setSelectedMethod("paypal")}
						className="sr-only"
					/>
					<Wallet className="h-5 w-5 text-blue-600" />
					<div className="flex-1">
						<div className="text-sm font-medium text-slate-800">PayPal</div>
						<div className="text-xs text-slate-400">
							Wallet PayPal — 4x sans frais si eligible
						</div>
					</div>
				</label>
			</div>

			{/* Pay button */}
			<button
				type="button"
				onClick={handlePay}
				disabled={processing}
				className="w-full rounded-xl bg-[#D0003C] px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#B80035] disabled:opacity-50"
			>
				{processing ? (
					<span className="flex items-center justify-center gap-2">
						<Loader2 className="h-5 w-5 animate-spin" />
						Redirection vers le paiement...
					</span>
				) : (
					`Payer ${formatEUR(offer?.amount || 0)}`
				)}
			</button>

			<p className="text-center text-xs text-slate-400">
				Paiement securise. Vos donnees sont protegees.
			</p>
		</div>
	);
}

function ErrorState({ message }: { message: string }) {
	return (
		<div className="text-center">
			<XCircle className="mx-auto h-16 w-16 text-red-400" />
			<h2 className="mt-4 text-lg font-bold text-slate-800">Erreur</h2>
			<p className="mt-2 text-sm text-slate-500">{message}</p>
		</div>
	);
}

export default function PayPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
			<div className="w-full max-w-md">
				<div className="mb-6 flex justify-center">
					<Image
						src="/logo-complet-rouge.png"
						alt="Prime Coaching"
						width={180}
						height={50}
						priority
					/>
				</div>
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<Suspense
						fallback={
							<div className="flex justify-center py-10">
								<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
							</div>
						}
					>
						<PaymentContent />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
