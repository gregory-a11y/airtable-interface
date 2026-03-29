"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Copy, LinkIcon, Loader2, Check } from "lucide-react";

export default function LiensPaiementPage() {
	const offers = useQuery(api.offers.list, {});
	const createOffer = useMutation(api.offers.create);
	const toggleActive = useMutation(api.offers.toggleActive);
	const generatePID = useMutation(api.transactions.generatePID);
	const [showCreate, setShowCreate] = useState(false);
	const [showGenerate, setShowGenerate] = useState(false);
	const [generatedLink, setGeneratedLink] = useState("");
	const [copied, setCopied] = useState(false);

	// Create form state
	const [name, setName] = useState("");
	const [type, setType] = useState<"classique" | "renouvellement" | "acompte">("classique");
	const [amount, setAmount] = useState("");
	const [paymentMode, setPaymentMode] = useState<"unique" | "mensuel" | "fixe_plus_mensuel">(
		"unique",
	);
	const [installmentCount, setInstallmentCount] = useState("");
	const [duration, setDuration] = useState("6M");

	const handleCreate = async () => {
		if (!name || !amount) {
			toast.error("Nom et montant requis");
			return;
		}
		try {
			await createOffer({
				name,
				type,
				amount: Math.round(parseFloat(amount) * 100),
				paymentMode,
				installmentCount: installmentCount ? parseInt(installmentCount) : undefined,
				duration,
				providers: ["stripe", "paypal"],
			});
			toast.success("Offre creee");
			setShowCreate(false);
			setName("");
			setAmount("");
		} catch {
			toast.error("Erreur");
		}
	};

	const handleGenerate = async (offerId: string) => {
		try {
			const result = await generatePID({ offerId: offerId as any });
			const link = `https://pay.galdencoaching.com/pay?offer=${offerId}&pid=${result.pid}`;
			setGeneratedLink(link);
			setShowGenerate(true);
		} catch {
			toast.error("Erreur lors de la generation du lien");
		}
	};

	const copyLink = () => {
		navigator.clipboard.writeText(generatedLink);
		setCopied(true);
		toast.success("Lien copie !");
		setTimeout(() => setCopied(false), 2000);
	};

	if (offers === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-slate-800">Liens de paiement</h1>
				<button
					type="button"
					onClick={() => setShowCreate(true)}
					className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]"
				>
					<Plus size={16} />
					Nouvelle offre
				</button>
			</div>

			{/* Create modal */}
			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-2xl bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-800">Nouvelle offre</h2>
						<div className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Accompagnement 6 mois"
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								/>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">
										Montant (EUR)
									</label>
									<input
										type="number"
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										placeholder="1997"
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
									/>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
									<select
										value={type}
										onChange={(e) => setType(e.target.value as any)}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
									>
										<option value="classique">Classique</option>
										<option value="renouvellement">Renouvellement</option>
										<option value="acompte">Acompte</option>
									</select>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">
										Modalite
									</label>
									<select
										value={paymentMode}
										onChange={(e) => setPaymentMode(e.target.value as any)}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
									>
										<option value="unique">Paiement unique</option>
										<option value="mensuel">Mensuel</option>
										<option value="fixe_plus_mensuel">Fixe + mensuel</option>
									</select>
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">
										Duree
									</label>
									<select
										value={duration}
										onChange={(e) => setDuration(e.target.value)}
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
									>
										<option value="1M">1 mois</option>
										<option value="3M">3 mois</option>
										<option value="6M">6 mois</option>
										<option value="12M">12 mois</option>
									</select>
								</div>
							</div>
							{paymentMode !== "unique" && (
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">
										Nombre de mensualites
									</label>
									<input
										type="number"
										value={installmentCount}
										onChange={(e) => setInstallmentCount(e.target.value)}
										placeholder="6"
										className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
									/>
								</div>
							)}
						</div>
						<div className="mt-6 flex gap-3">
							<button
								type="button"
								onClick={() => setShowCreate(false)}
								className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
							>
								Annuler
							</button>
							<button
								type="button"
								onClick={handleCreate}
								className="flex-1 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]"
							>
								Creer
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Generated link modal */}
			{showGenerate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-md rounded-2xl bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-800">Lien genere</h2>
						<div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
							<input
								type="text"
								value={generatedLink}
								readOnly
								className="flex-1 bg-transparent text-sm text-slate-700 outline-none"
							/>
							<button
								type="button"
								onClick={copyLink}
								className="rounded-lg bg-[#D0003C] p-2 text-white hover:bg-[#B80035]"
							>
								{copied ? <Check size={16} /> : <Copy size={16} />}
							</button>
						</div>
						<button
							type="button"
							onClick={() => setShowGenerate(false)}
							className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
						>
							Fermer
						</button>
					</div>
				</div>
			)}

			{/* Offers table */}
			<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
				{offers.length === 0 ? (
					<div className="py-16 text-center">
						<LinkIcon className="mx-auto h-12 w-12 text-slate-300" />
						<p className="mt-3 text-sm text-slate-500">Aucune offre creee</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-slate-50">
								<tr className="text-left text-xs text-slate-500">
									<th className="px-4 py-3 font-medium">Titre</th>
									<th className="px-4 py-3 font-medium">Type</th>
									<th className="px-4 py-3 font-medium">Montant</th>
									<th className="px-4 py-3 font-medium">Modalite</th>
									<th className="px-4 py-3 font-medium">Duree</th>
									<th className="px-4 py-3 font-medium">Statut</th>
									<th className="px-4 py-3 font-medium">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{offers.map((offer) => (
									<tr key={offer._id} className="hover:bg-slate-50">
										<td className="px-4 py-3 font-medium text-slate-800">
											{offer.name}
										</td>
										<td className="px-4 py-3">
											<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
												{offer.type}
											</span>
										</td>
										<td className="px-4 py-3 font-medium text-slate-800">
											{formatEUR(offer.amount)}
										</td>
										<td className="px-4 py-3 text-slate-500">
											{offer.paymentMode.replace(/_/g, " ")}
										</td>
										<td className="px-4 py-3 text-slate-500">
											{offer.duration || "—"}
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												onClick={() => toggleActive({ id: offer._id })}
												className={cn(
													"rounded-full px-2 py-0.5 text-xs font-medium",
													offer.active
														? "bg-emerald-100 text-emerald-700"
														: "bg-slate-100 text-slate-500",
												)}
											>
												{offer.active ? "Actif" : "Inactif"}
											</button>
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												onClick={() => handleGenerate(offer._id)}
												className="flex items-center gap-1 rounded-lg bg-[#D0003C]/10 px-2.5 py-1 text-xs font-medium text-[#D0003C] hover:bg-[#D0003C]/20"
											>
												<LinkIcon size={12} />
												Generer lien
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
