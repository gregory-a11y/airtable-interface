"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import {
	User,
	Calendar,
	Phone,
	Mail,
	MapPin,
	FileText,
	MessageCircle,
	ExternalLink,
	Loader2,
	Trash2,
} from "lucide-react";

const statusOptions = [
	"acompte",
	"nouveau_client",
	"en_attente_programme",
	"active",
	"paused",
	"renew",
	"fin_proche",
	"termine",
	"archived",
];

const prestationOptions = [
	"1M_Oneshot",
	"3M_Oneshot",
	"3M_2x",
	"3M_3x",
	"6M_Oneshot",
	"6M_2x",
	"6M_4x",
	"6M_6x",
	"12M_12x",
	"Acompte",
];

const statusColors: Record<string, string> = {
	acompte: "bg-orange-100 text-orange-700",
	nouveau_client: "bg-yellow-100 text-yellow-700",
	active: "bg-emerald-100 text-emerald-700",
	paused: "bg-slate-100 text-slate-600",
	fin_proche: "bg-red-100 text-red-700",
	termine: "bg-slate-200 text-slate-600",
};

const paymentStatusColors: Record<string, string> = {
	confirmed: "bg-emerald-100 text-emerald-700",
	pending: "bg-yellow-100 text-yellow-700",
	failed: "bg-red-100 text-red-700",
	refunded: "bg-cyan-100 text-cyan-700",
};

export default function ClientDetailPage() {
	const params = useParams();
	const router = useRouter();
	const clientId = params.id as Id<"clients">;
	const client = useQuery(api.clients.getById, { id: clientId });
	const updateClient = useMutation(api.clients.update);
	const removeClient = useMutation(api.clients.remove);

	const [editing, setEditing] = useState<Record<string, string>>({});

	if (client === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	if (!client) {
		return (
			<div className="py-20 text-center text-slate-500">Client introuvable</div>
		);
	}

	const handleUpdate = async (field: string, value: unknown) => {
		try {
			await updateClient({ id: clientId, [field]: value } as any);
			toast.success("Mis a jour");
		} catch {
			toast.error("Erreur lors de la mise a jour");
		}
	};

	const handleDelete = async () => {
		if (!confirm("Supprimer ce client ? Cette action est irreversible.")) return;
		try {
			await removeClient({ id: clientId });
			toast.success("Client supprime");
			router.push("/operationnel/clients");
		} catch {
			toast.error("Erreur");
		}
	};

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-slate-800">{client.name}</h1>
				<button
					type="button"
					onClick={handleDelete}
					className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
				>
					<Trash2 size={14} />
					Supprimer client
				</button>
			</div>

			{/* Statut & Prestation */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="mb-1.5 block text-xs font-medium text-slate-500">
							Statut Client
						</label>
						<select
							value={client.status}
							onChange={(e) => handleUpdate("status", e.target.value)}
							className={cn(
								"w-full rounded-lg border px-3 py-2 text-sm font-medium",
								statusColors[client.status] || "border-slate-300",
							)}
						>
							{statusOptions.map((s) => (
								<option key={s} value={s}>
									{s.replace(/_/g, " ")}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="mb-1.5 block text-xs font-medium text-slate-500">
							Prestation
						</label>
						<select
							value={client.prestation}
							onChange={(e) => handleUpdate("prestation", e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
						>
							{prestationOptions.map((p) => (
								<option key={p} value={p}>
									{p}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Coach */}
				{client.coach && (
					<div>
						<label className="mb-1.5 block text-xs font-medium text-slate-500">
							Coach attitré
						</label>
						<div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
								{client.coach.name?.charAt(0) || "C"}
							</div>
							<div>
								<div className="text-sm font-medium text-slate-800">
									{client.coach.name}
								</div>
								<div className="text-xs text-slate-400">
									{client.coach.role} — {client.coach.bio || ""}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Coaching */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
				<h2 className="text-sm font-semibold text-slate-700">Coaching</h2>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Training LOG" icon={<FileText size={14} />}>
						<input
							type="url"
							defaultValue={client.trainingLogUrl || ""}
							onBlur={(e) => handleUpdate("trainingLogUrl", e.target.value)}
							placeholder="Lien Google Sheets"
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
						/>
					</Field>
					<Field label="Groupe Telegram" icon={<MessageCircle size={14} />}>
						<input
							type="url"
							defaultValue={client.telegramGroupUrl || ""}
							onBlur={(e) => handleUpdate("telegramGroupUrl", e.target.value)}
							placeholder="Lien Telegram"
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
						/>
					</Field>
				</div>

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<label className="mb-1 block text-xs text-slate-500">Date de debut</label>
						<div className="text-sm font-medium text-slate-800">
							{client.dateDebut ? formatDate(client.dateDebut) : "—"}
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">Date de fin calculee</label>
						<div className="text-sm text-slate-600">
							{client.dateFinCalculee ? formatDate(client.dateFinCalculee) : "—"}
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">Nb jours pause</label>
						<input
							type="number"
							defaultValue={client.nbJoursPause || 0}
							onBlur={(e) =>
								handleUpdate("nbJoursPause", parseInt(e.target.value) || 0)
							}
							className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-[#D0003C]"
						/>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">
							Date fin reelle
						</label>
						<div className="text-sm text-slate-600">
							{client.dateFinReelle ? formatDate(client.dateFinReelle) : "—"}
						</div>
					</div>
				</div>
			</div>

			{/* Contact */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
				<h2 className="text-sm font-semibold text-slate-700">Contact</h2>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field label="Email" icon={<Mail size={14} />}>
						<input
							type="email"
							defaultValue={client.email || ""}
							onBlur={(e) => handleUpdate("email", e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
						/>
					</Field>
					<Field label="Telephone" icon={<Phone size={14} />}>
						<input
							type="tel"
							defaultValue={client.phone || ""}
							onBlur={(e) => handleUpdate("phone", e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
						/>
					</Field>
				</div>

				<Field label="Notes">
					<textarea
						defaultValue={client.notes || ""}
						onBlur={(e) => handleUpdate("notes", e.target.value)}
						rows={3}
						className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
						placeholder="Notes internes..."
					/>
				</Field>
			</div>

			{/* Paiements */}
			<div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
				<h2 className="text-sm font-semibold text-slate-700">
					Paiements / Facturations
				</h2>

				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<label className="mb-1 block text-xs text-slate-500">
							Montant Contracte (TTC)
						</label>
						<div className="text-lg font-bold text-slate-800">
							{formatEUR(client.montantContracteTTC)}
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">
							Total CA Collecte TTC
						</label>
						<div className="text-lg font-bold text-emerald-600">
							{formatEUR(client.totalCollecte)}
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">
							Restant a payer
						</label>
						<div className="text-lg font-bold text-slate-600">
							{formatEUR(client.restantAPayer)}
						</div>
					</div>
					<div>
						<label className="mb-1 block text-xs text-slate-500">
							% Avancement
						</label>
						<div className="flex items-center gap-2">
							<div className="h-2 flex-1 rounded-full bg-slate-200">
								<div
									className="h-2 rounded-full bg-emerald-500 transition-all"
									style={{
										width: `${Math.min(client.pourcentageAvancement, 100)}%`,
									}}
								/>
							</div>
							<span className="text-sm font-medium text-slate-600">
								{client.pourcentageAvancement}%
							</span>
						</div>
					</div>
				</div>

				{/* Payments table */}
				{client.payments.length > 0 ? (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="text-left text-xs text-slate-400 border-b border-slate-100">
									<th className="pb-2 font-medium">Statut</th>
									<th className="pb-2 font-medium">Montant</th>
									<th className="pb-2 font-medium">Source</th>
									<th className="pb-2 font-medium">Date</th>
								</tr>
							</thead>
							<tbody>
								{client.payments.map((p: any) => (
									<tr key={p._id} className="border-t border-slate-50">
										<td className="py-2">
											<span
												className={cn(
													"rounded-full px-2 py-0.5 text-xs font-medium",
													paymentStatusColors[p.status] || "bg-slate-100",
												)}
											>
												{p.status}
											</span>
										</td>
										<td className="py-2 font-medium text-slate-800">
											{formatEUR(p.amount)}
										</td>
										<td className="py-2 text-slate-500">
											{p.sourceType || p.provider}
										</td>
										<td className="py-2 text-slate-500">
											{p.confirmedAt ? formatDate(p.confirmedAt) : formatDate(p.createdAt)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-sm text-slate-400">Aucun paiement enregistre</p>
				)}
			</div>
		</div>
	);
}

function Field({
	label,
	icon,
	children,
}: {
	label: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
				{icon}
				{label}
			</label>
			{children}
		</div>
	);
}
