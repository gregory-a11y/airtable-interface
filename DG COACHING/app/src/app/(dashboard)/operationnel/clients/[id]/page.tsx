"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import {
	ArrowLeft,
	ClipboardList,
	Mail,
	Phone,
	FileText,
	MessageCircle,
	Loader2,
	Trash2,
	ExternalLink,
	MapPin,
	StickyNote,
	CreditCard,
	CircleDollarSign,
	Settings,
	Calendar,
	Pause,
	CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogClose,
} from "@/components/ui/dialog";
import Link from "next/link";

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

const statusLabels: Record<string, string> = {
	acompte: "Acompte",
	nouveau_client: "Nouveau client",
	en_attente_programme: "En attente",
	active: "Actif",
	paused: "Pause",
	renew: "Renouvellement",
	fin_proche: "Fin proche",
	termine: "Termine",
	archived: "Archive",
};

const statusColors: Record<string, string> = {
	acompte: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	nouveau_client: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	en_attente_programme: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
	active: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	paused: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
	renew: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20",
	fin_proche: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20",
	termine: "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
	archived: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
};

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

const paymentStatusColors: Record<string, string> = {
	confirmed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	failed: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
	refunded: "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
};

const paymentStatusLabels: Record<string, string> = {
	confirmed: "Confirme",
	pending: "En attente",
	failed: "Echoue",
	refunded: "Rembourse",
};

const onboardingOptions = [
	{ value: "en_attente", label: "En attente" },
	{ value: "en_cours", label: "En cours" },
	{ value: "termine", label: "Termine" },
];

export default function ClientDetailPage() {
	const params = useParams();
	const router = useRouter();
	const clientId = params.id as Id<"clients">;
	const client = useQuery(api.clients.getById, { id: clientId });
	const updateClient = useMutation(api.clients.update);
	const removeClient = useMutation(api.clients.remove);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	if (client === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!client) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<p className="text-sm text-muted-foreground">
					Client introuvable
				</p>
				<Link
					href="/operationnel/clients"
					className="mt-4 text-sm text-primary hover:underline"
				>
					Retour a la liste
				</Link>
			</div>
		);
	}

	const handleUpdate = async (field: string, value: unknown) => {
		try {
			await updateClient({
				id: clientId,
				[field]: value,
			} as Parameters<typeof updateClient>[0]);
			toast.success("Mis a jour");
		} catch {
			toast.error("Erreur lors de la mise a jour");
		}
	};

	const handleDelete = async () => {
		try {
			await removeClient({ id: clientId });
			toast.success("Client supprime");
			router.push("/operationnel/clients");
		} catch {
			toast.error("Erreur");
		}
	};

	const collectedPercentage = Math.min(client.pourcentageAvancement, 100);

	return (
		<div className="mx-auto max-w-6xl animate-page-enter">
			{/* Header */}
			<div className="mb-8">
				<div className="mb-4 flex items-center gap-3">
					<Link
						href="/operationnel/clients"
						className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 dark:border-white/10 bg-card dark:bg-[#2A2A28] text-muted-foreground shadow-sm dark:shadow-black/20 transition-colors hover:text-foreground"
					>
						<ArrowLeft size={16} />
					</Link>
					<div className="flex-1">
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold tracking-tight text-foreground">
								{client.name}
							</h1>
							<span
								className={cn(
									"inline-flex rounded-full px-3 py-1 text-xs font-medium",
									statusColors[client.status] ||
										"bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
								)}
							>
								{statusLabels[client.status] || client.status}
							</span>
							<span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
								{client.prestation}
							</span>
						</div>
						{client.coach && (
							<div className="mt-2 flex items-center gap-2">
								<div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
									{client.coach.name?.charAt(0) || "C"}
								</div>
								<span className="text-sm text-muted-foreground">
									{client.coach.name}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Two column layout */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main content - 2/3 */}
				<div className="space-y-6 lg:col-span-2">
					{/* Coaching card */}
					<div className="card-premium p-6">
						<div className="mb-4 flex items-center gap-2">
							<ClipboardList
								size={18}
								className="text-primary"
							/>
							<h2 className="text-base font-semibold text-foreground">
								Coaching
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<FileText size={13} />
									Training LOG
								</Label>
								<div className="relative">
									<Input
										type="url"
										defaultValue={
											client.trainingLogUrl || ""
										}
										onBlur={(e) =>
											handleUpdate(
												"trainingLogUrl",
												e.target.value,
											)
										}
										placeholder="Lien Google Sheets"
										className="h-9 rounded-lg pr-8"
									/>
									{client.trainingLogUrl && (
										<a
											href={client.trainingLogUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
										>
											<ExternalLink size={14} />
										</a>
									)}
								</div>
							</div>
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<MessageCircle size={13} />
									Groupe Telegram
								</Label>
								<Input
									type="url"
									defaultValue={
										client.telegramGroupUrl || ""
									}
									onBlur={(e) =>
										handleUpdate(
											"telegramGroupUrl",
											e.target.value,
										)
									}
									placeholder="Lien Telegram"
									className="h-9 rounded-lg"
								/>
							</div>
						</div>

						<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Calendar size={13} />
									Date de debut
								</Label>
								<div className="text-sm font-medium text-foreground">
									{client.dateDebut
										? formatDate(client.dateDebut)
										: "--"}
								</div>
							</div>
							<div>
								<Label className="mb-1.5 text-xs text-muted-foreground">
									Date de fin calculee
								</Label>
								<div className="text-sm text-muted-foreground">
									{client.dateFinCalculee
										? formatDate(client.dateFinCalculee)
										: "--"}
								</div>
							</div>
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Pause size={13} />
									Jours de pause
								</Label>
								<Input
									type="number"
									defaultValue={client.nbJoursPause || 0}
									onBlur={(e) =>
										handleUpdate(
											"nbJoursPause",
											parseInt(e.target.value) || 0,
										)
									}
									className="h-9 w-20 rounded-lg"
								/>
							</div>
							<div>
								<Label className="mb-1.5 text-xs text-muted-foreground">
									Date fin reelle
								</Label>
								<div className="text-sm text-muted-foreground">
									{client.dateFinReelle
										? formatDate(client.dateFinReelle)
										: "--"}
								</div>
							</div>
						</div>

						<div className="mt-4">
							<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
								<CheckCircle2 size={13} />
								Onboarding
							</Label>
							<Select
								value={client.onboardingStatus || "en_attente"}
								onValueChange={(v) =>
									handleUpdate("onboardingStatus", v)
								}
							>
								<SelectTrigger className="h-9 w-48 rounded-lg">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{onboardingOptions.map((opt) => (
										<SelectItem
											key={opt.value}
											value={opt.value}
										>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Contact card */}
					<div className="card-premium p-6">
						<div className="mb-4 flex items-center gap-2">
							<Mail size={18} className="text-primary" />
							<h2 className="text-base font-semibold text-foreground">
								Contact
							</h2>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Mail size={13} />
									Email
								</Label>
								<Input
									type="email"
									defaultValue={client.email || ""}
									onBlur={(e) =>
										handleUpdate("email", e.target.value)
									}
									className="h-9 rounded-lg"
								/>
							</div>
							<div>
								<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
									<Phone size={13} />
									Telephone
								</Label>
								<Input
									type="tel"
									defaultValue={client.phone || ""}
									onBlur={(e) =>
										handleUpdate("phone", e.target.value)
									}
									className="h-9 rounded-lg"
								/>
							</div>
						</div>

						<div className="mt-4">
							<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
								<MapPin size={13} />
								Adresse
							</Label>
							<Input
								type="text"
								defaultValue={client.address || ""}
								onBlur={(e) =>
									handleUpdate("address", e.target.value)
								}
								placeholder="Adresse du client"
								className="h-9 rounded-lg"
							/>
						</div>

						<div className="mt-4">
							<Label className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
								<StickyNote size={13} />
								Notes
							</Label>
							<textarea
								defaultValue={client.notes || ""}
								onBlur={(e) =>
									handleUpdate("notes", e.target.value)
								}
								rows={3}
								className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								placeholder="Notes internes..."
							/>
						</div>
					</div>
				</div>

				{/* Sidebar - 1/3 */}
				<div className="space-y-5">
					{/* Facturation card */}
					<div className="card-premium p-5">
						<div className="mb-4 flex items-center gap-2">
							<CircleDollarSign
								size={18}
								className="text-primary"
							/>
							<h2 className="text-base font-semibold text-foreground">
								Facturation
							</h2>
						</div>

						<div className="mb-4">
							<p className="text-xs text-muted-foreground">
								Montant contracte TTC
							</p>
							<p className="text-2xl font-bold text-primary">
								{formatEUR(client.montantContracteTTC)}
							</p>
						</div>

						<div className="mb-2">
							<div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary transition-all duration-500"
									style={{
										width: `${collectedPercentage}%`,
									}}
								/>
							</div>
							<div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
								<span>
									Collecte :{" "}
									{formatEUR(client.totalCollecte)}
								</span>
								<span>
									Restant :{" "}
									{formatEUR(client.restantAPayer)}
								</span>
							</div>
						</div>

						<p className="text-sm font-semibold text-foreground">
							{collectedPercentage}% collecte
						</p>
					</div>

					{/* Paiements card */}
					<div className="card-premium p-5">
						<div className="mb-4 flex items-center gap-2">
							<CreditCard size={18} className="text-primary" />
							<h2 className="text-base font-semibold text-foreground">
								Paiements
							</h2>
						</div>

						{client.payments.length > 0 ? (
							<div className="space-y-0">
								{client.payments.map((p: any) => (
									<div
										key={p._id}
										className="flex items-center justify-between border-b border-border/20 py-2.5 last:border-b-0"
									>
										<div>
											<p className="text-sm font-semibold text-foreground">
												{formatEUR(p.amount)}
											</p>
											<p className="text-xs text-muted-foreground">
												{p.confirmedAt
													? formatDate(p.confirmedAt)
													: formatDate(p.createdAt)}
											</p>
										</div>
										<span
											className={cn(
												"inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
												paymentStatusColors[
													p.status
												] ||
													"bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
											)}
										>
											{paymentStatusLabels[p.status] ||
												p.status}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">
								Aucun paiement enregistre
							</p>
						)}
					</div>

					{/* Actions card */}
					<div className="card-premium p-5">
						<div className="mb-4 flex items-center gap-2">
							<Settings size={18} className="text-primary" />
							<h2 className="text-base font-semibold text-foreground">
								Actions
							</h2>
						</div>

						<div className="space-y-4">
							<div>
								<Label className="mb-1.5 text-xs text-muted-foreground">
									Statut
								</Label>
								<Select
									value={client.status}
									onValueChange={(v) =>
										handleUpdate("status", v)
									}
								>
									<SelectTrigger className="h-9 rounded-lg">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{statusOptions.map((s) => (
											<SelectItem key={s} value={s}>
												{statusLabels[s] ||
													s.replace(/_/g, " ")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label className="mb-1.5 text-xs text-muted-foreground">
									Prestation
								</Label>
								<Select
									value={client.prestation}
									onValueChange={(v) =>
										handleUpdate("prestation", v)
									}
								>
									<SelectTrigger className="h-9 rounded-lg">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{prestationOptions.map((p) => (
											<SelectItem key={p} value={p}>
												{p}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="pt-2">
								<Dialog
									open={deleteDialogOpen}
									onOpenChange={setDeleteDialogOpen}
								>
									<DialogTrigger asChild>
										<button
											type="button"
											className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
										>
											<Trash2 size={14} />
											Supprimer ce client
										</button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Confirmer la suppression
											</DialogTitle>
											<DialogDescription>
												Cette action est irreversible.
												Le client{" "}
												<span className="font-semibold">
													{client.name}
												</span>{" "}
												sera definitivement supprime.
											</DialogDescription>
										</DialogHeader>
										<DialogFooter>
											<DialogClose asChild>
												<Button variant="outline">
													Annuler
												</Button>
											</DialogClose>
											<Button
												variant="destructive"
												onClick={handleDelete}
											>
												<Trash2 size={14} />
												Supprimer
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
