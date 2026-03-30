"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import {
	ArrowLeft,
	Mail,
	Phone,
	Instagram,
	MapPin,
	Calendar,
	Video,
	FileText,
	ExternalLink,
	ChevronDown,
	Edit3,
	Check,
	X,
	Clock,
	Trash2,
	Link as LinkIcon,
	Send,
	Play,
	User,
	Users,
	History,
	Loader2,
	DollarSign,
	Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";

const ETAPES = [
	{ id: "appel_a_venir", label: "Appel a venir", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20", activeColor: "bg-blue-600 text-white" },
	{ id: "appel_du_jour", label: "Appel du jour", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20", activeColor: "bg-amber-600 text-white" },
	{ id: "follow_up", label: "Follow up", color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20", activeColor: "bg-violet-600 text-white" },
	{ id: "no_show", label: "No show", color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20", activeColor: "bg-orange-600 text-white" },
	{ id: "en_attente", label: "En attente", color: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-500/20", activeColor: "bg-gray-600 text-white" },
	{ id: "close", label: "Close", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20", activeColor: "bg-emerald-600 text-white" },
	{ id: "perdu", label: "Perdu", color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20", activeColor: "bg-red-600 text-white" },
];

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20",
	facebook: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	tiktok: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
	google: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20",
	referral: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	organique: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
};

const QUAL_COLORS: Record<string, string> = {
	qualifie: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	non_qualifie: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
	pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
};

const TYPE_COLORS: Record<string, string> = {
	prospect: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	client: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	ancien_client: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
};

function formatDateTime(ts: number): string {
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(ts));
}

function formatEUR(cents: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

export default function LeadDetailPage() {
	const params = useParams();
	const router = useRouter();
	const id = params.id as Id<"leads">;

	const lead = useQuery(api.leads.getById, { id });
	const team = useQuery(api.users.listTeam);
	const updateLead = useMutation(api.leads.update);
	const updateEtape = useMutation(api.leads.updateEtape);
	const assignSetter = useMutation(api.leads.assignSetter);
	const assignCloser = useMutation(api.leads.assignCloser);
	const deleteLead = useMutation(api.leads.remove);

	const [editingField, setEditingField] = useState<string | null>(null);
	const [editValue, setEditValue] = useState("");
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const salesTeam = useMemo(
		() => (team ?? []).filter((u) => u.role === "sales" || u.role === "admin"),
		[team],
	);

	const userMap = useMemo(() => {
		const m: Record<string, string> = {};
		for (const u of team ?? []) {
			m[u._id] = u.name ?? u.email ?? "--";
		}
		return m;
	}, [team]);

	const history = useMemo(() => {
		if (!lead?.noteInterne) return [];
		try {
			const parsed = JSON.parse(lead.noteInterne);
			if (Array.isArray(parsed)) {
				return parsed
					.filter((e: any) => e.type === "etape_change")
					.sort((a: any, b: any) => b.timestamp - a.timestamp);
			}
		} catch {
			// Not JSON, no history
		}
		return [];
	}, [lead?.noteInterne]);

	if (lead === undefined) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	if (lead === null) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
					<User size={28} className="text-muted-foreground/40" />
				</div>
				<p className="text-base font-medium text-foreground">Lead introuvable</p>
				<Button
					variant="link"
					onClick={() => router.push("/sales/crm")}
					className="mt-3 text-primary"
				>
					Retour au CRM
				</Button>
			</div>
		);
	}

	const startEdit = (field: string, currentValue: string) => {
		setEditingField(field);
		setEditValue(currentValue);
	};

	const saveEdit = async () => {
		if (!editingField) return;
		await updateLead({ id, [editingField]: editValue });
		setEditingField(null);
		setEditValue("");
	};

	const cancelEdit = () => {
		setEditingField(null);
		setEditValue("");
	};

	const handleDelete = async () => {
		await deleteLead({ id });
		router.push("/sales/crm");
	};

	const currentEtape = ETAPES.find((e) => e.id === lead.etapeClosing);

	return (
		<div className="mx-auto max-w-6xl animate-fade-in">
			{/* Header */}
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-3">
					<button
						onClick={() => router.push("/sales/crm")}
						className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						<ArrowLeft size={18} />
					</button>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">{lead.name}</h1>
						<p className="text-sm text-muted-foreground">
							Cree le {formatDateTime(lead.createdAt)}
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${SOURCE_COLORS[lead.source.toLowerCase()] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"}`}>
						{lead.source}
					</span>
					<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${TYPE_COLORS[lead.type] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"}`}>
						{lead.type}
					</span>
					<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${QUAL_COLORS[lead.qualification] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"}`}>
						{lead.qualification}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main content - 2 cols */}
				<div className="space-y-6 lg:col-span-2">
					{/* Contact Section */}
					<div className="card-premium p-5">
						<div className="flex items-center gap-2 mb-4">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
								<User size={14} className="text-primary" />
							</div>
							<h3 className="text-sm font-semibold text-foreground">Contact</h3>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<EditableField
								label="Nom" icon={<User size={14} />} value={lead.name} field="name"
								editingField={editingField} editValue={editValue}
								onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onChange={setEditValue}
							/>
							<EditableField
								label="Email" icon={<Mail size={14} />} value={lead.email ?? ""} field="email"
								editingField={editingField} editValue={editValue}
								onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onChange={setEditValue}
							/>
							<EditableField
								label="Telephone" icon={<Phone size={14} />} value={lead.phone ?? ""} field="phone"
								editingField={editingField} editValue={editValue}
								onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onChange={setEditValue}
							/>
							<EditableField
								label="Instagram" icon={<Instagram size={14} />} value={lead.instagram ?? ""} field="instagram"
								editingField={editingField} editValue={editValue}
								onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onChange={setEditValue}
							/>
							<div className="sm:col-span-2">
								<EditableField
									label="Adresse" icon={<MapPin size={14} />} value={lead.address ?? ""} field="address"
									editingField={editingField} editValue={editValue}
									onStartEdit={startEdit} onSave={saveEdit} onCancel={cancelEdit} onChange={setEditValue}
								/>
							</div>
						</div>
					</div>

					{/* Appel de vente Section */}
					<div className="card-premium p-5">
						<div className="flex items-center gap-2 mb-4">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
								<Phone size={14} className="text-primary" />
							</div>
							<h3 className="text-sm font-semibold text-foreground">Appel de vente</h3>
						</div>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InfoField
								label="Date booking"
								value={lead.dateBookingCall ? formatDateTime(lead.dateBookingCall) : "--"}
								icon={<Calendar size={14} />}
							/>
							<InfoField
								label="Date appel"
								value={lead.dateAppelVente ? formatDateTime(lead.dateAppelVente) : "--"}
								icon={<Calendar size={14} />}
							/>
							<InfoField
								label="Meeting URL"
								value={lead.meetingUrl ?? "--"}
								icon={<ExternalLink size={14} />}
								isLink={!!lead.meetingUrl}
							/>
							<InfoField
								label="Video call"
								value={lead.videoCallUrl ?? "--"}
								icon={<Video size={14} />}
								isLink={!!lead.videoCallUrl}
							/>
						</div>

						{lead.videoCallUrl && lead.videoCallUrl.includes("loom.com") && (
							<div className="mt-5">
								<p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Video Loom</p>
								<div className="aspect-video overflow-hidden rounded-xl border border-border/50 bg-muted">
									<iframe
										src={lead.videoCallUrl.replace("/share/", "/embed/")}
										className="h-full w-full"
										allowFullScreen
										title="Loom video"
									/>
								</div>
							</div>
						)}

						{lead.transcriptCall && (
							<div className="mt-5">
								<p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Transcript</p>
								<div className="max-h-48 overflow-y-auto rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground leading-relaxed">
									{lead.transcriptCall}
								</div>
							</div>
						)}

						<div className="mt-5">
							<p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Notes internes</p>
							<NoteEditor
								leadId={id}
								currentNote={lead.noteInterne ?? ""}
								onSave={updateLead}
							/>
						</div>
					</div>

					{/* Questionnaire Section */}
					{lead.questionnaireAnswers && (
						<div className="card-premium p-5">
							<div className="flex items-center gap-2 mb-4">
								<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
									<FileText size={14} className="text-primary" />
								</div>
								<h3 className="text-sm font-semibold text-foreground">Questionnaire</h3>
							</div>
							<QuestionnaireAccordion data={lead.questionnaireAnswers} />
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-5">
					<div className="sticky top-4 space-y-5">
						{/* Actions rapides */}
						<div className="card-premium p-4">
							<div className="flex items-center gap-2 mb-3">
								<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
									<Zap size={12} className="text-primary" />
								</div>
								<h3 className="text-sm font-semibold text-foreground">Actions rapides</h3>
							</div>
							<div className="grid grid-cols-2 gap-1.5">
								{ETAPES.map((e) => (
									<button
										key={e.id}
										type="button"
										onClick={() => updateEtape({ id, etape: e.id })}
										className={`rounded-lg px-3 py-2 text-[11px] font-medium transition-all ${
											lead.etapeClosing === e.id
												? `${e.activeColor} shadow-sm`
												: `bg-muted/50 hover:bg-muted text-foreground`
										}`}
									>
										{e.label}
									</button>
								))}
							</div>
						</div>

						{/* Commercial */}
						<div className="card-premium p-4">
							<div className="flex items-center gap-2 mb-3">
								<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
									<Users size={12} className="text-primary" />
								</div>
								<h3 className="text-sm font-semibold text-foreground">Commercial</h3>
							</div>
							<div className="space-y-3">
								<div>
									<p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Setter</p>
									<Select
										value={lead.setterId ?? "none"}
										onValueChange={(v) => {
											if (v !== "none") {
												assignSetter({ id, setterId: v as Id<"users"> });
											}
										}}
									>
										<SelectTrigger className="rounded-lg h-9 text-sm">
											<SelectValue placeholder="Non assigne" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Non assigne</SelectItem>
											{salesTeam.map((u) => (
												<SelectItem key={u._id} value={u._id}>
													{u.name ?? u.email}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Closer</p>
									<Select
										value={lead.closerId ?? "none"}
										onValueChange={(v) => {
											if (v !== "none") {
												assignCloser({ id, closerId: v as Id<"users"> });
											}
										}}
									>
										<SelectTrigger className="rounded-lg h-9 text-sm">
											<SelectValue placeholder="Non assigne" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">Non assigne</SelectItem>
											{salesTeam.map((u) => (
												<SelectItem key={u._id} value={u._id}>
													{u.name ?? u.email}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Montant contracte</p>
									<div className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
										<DollarSign size={14} className="text-muted-foreground" />
										<span className={`text-sm ${lead.montantContracte ? "font-semibold text-primary" : "text-muted-foreground"}`}>
											{lead.montantContracte ? formatEUR(lead.montantContracte) : "--"}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Historique */}
						<div className="card-premium p-4">
							<div className="flex items-center gap-2 mb-3">
								<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
									<History size={12} className="text-primary" />
								</div>
								<h3 className="text-sm font-semibold text-foreground">Historique</h3>
							</div>
							{history.length === 0 ? (
								<p className="text-xs text-muted-foreground">Aucun changement d'etape enregistre</p>
							) : (
								<div className="relative ml-1">
									{history.map((entry: any, i: number) => {
										const fromLabel = ETAPES.find((e) => e.id === entry.from)?.label ?? entry.from;
										const toLabel = ETAPES.find((e) => e.id === entry.to)?.label ?? entry.to;
										const userName = entry.userId ? (userMap[entry.userId] ?? "Systeme") : "Systeme";

										return (
											<div key={`${entry.timestamp}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
												{/* Timeline line */}
												{i < history.length - 1 && (
													<div className="absolute left-[3px] top-4 h-[calc(100%-8px)] w-px bg-border" />
												)}
												{/* Timeline dot */}
												<div className="relative z-10 mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
												<div className="min-w-0 flex-1">
													<p className="text-xs text-foreground">
														<span className="font-medium">{userName}</span>
													</p>
													<div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
														<span>{fromLabel}</span>
														<span>-&gt;</span>
														<span className="font-medium text-foreground">{toLabel}</span>
													</div>
													<p className="mt-0.5 text-[10px] text-muted-foreground">
														{formatDateTime(entry.timestamp)}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Quick actions */}
						<div className="card-premium p-4 space-y-2">
							<Button variant="outline" className="w-full justify-start rounded-lg h-9 text-sm" onClick={() => {}}>
								<Send size={14} className="mr-2" />
								Envoyer lien paiement
							</Button>
							<Button variant="outline" className="w-full justify-start rounded-lg h-9 text-sm" onClick={() => {}}>
								<Play size={14} className="mr-2" />
								Lancer onboarding
							</Button>
						</div>

						{/* Delete */}
						<button
							onClick={() => setShowDeleteConfirm(true)}
							className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
						>
							<Trash2 size={14} />
							Supprimer le lead
						</button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirmer la suppression</DialogTitle>
						<DialogDescription>
							Cette action est irreversible. Le lead sera supprime definitivement.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
							Annuler
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Supprimer
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function EditableField({
	label,
	icon,
	value,
	field,
	editingField,
	editValue,
	onStartEdit,
	onSave,
	onCancel,
	onChange,
}: {
	label: string;
	icon: React.ReactNode;
	value: string;
	field: string;
	editingField: string | null;
	editValue: string;
	onStartEdit: (field: string, value: string) => void;
	onSave: () => void;
	onCancel: () => void;
	onChange: (v: string) => void;
}) {
	const isEditing = editingField === field;

	return (
		<div>
			<p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
			{isEditing ? (
				<div className="flex items-center gap-1.5">
					<Input
						type="text"
						value={editValue}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") onSave();
							if (e.key === "Escape") onCancel();
						}}
						className="flex-1 rounded-lg h-9"
						autoFocus
					/>
					<Button variant="ghost" size="sm" onClick={onSave} className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
						<Check size={14} />
					</Button>
					<Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
						<X size={14} />
					</Button>
				</div>
			) : (
				<div
					className="group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted/50"
					onClick={() => onStartEdit(field, value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") onStartEdit(field, value);
					}}
					role="button"
					tabIndex={0}
				>
					<span className="text-muted-foreground">{icon}</span>
					<span className={value ? "" : "text-muted-foreground"}>{value || "--"}</span>
					<Edit3
						size={12}
						className="ml-auto text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
					/>
				</div>
			)}
		</div>
	);
}

function InfoField({
	label,
	value,
	icon,
	isLink,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	isLink?: boolean;
}) {
	return (
		<div>
			<p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
			<div className="flex items-center gap-2 px-3 py-2 text-sm text-foreground">
				<span className="text-muted-foreground">{icon}</span>
				{isLink && value !== "--" ? (
					<a
						href={value}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate text-primary underline-offset-2 hover:underline"
					>
						{value}
					</a>
				) : (
					<span className={value === "--" ? "text-muted-foreground" : ""}>{value}</span>
				)}
			</div>
		</div>
	);
}

function NoteEditor({
	leadId,
	currentNote,
	onSave,
}: {
	leadId: Id<"leads">;
	currentNote: string;
	onSave: (args: { id: Id<"leads">; noteInterne: string }) => Promise<unknown>;
}) {
	let displayNote = currentNote;
	try {
		const parsed = JSON.parse(currentNote);
		if (Array.isArray(parsed)) {
			displayNote = "";
		}
	} catch {
		// It's plain text, display as-is
	}

	const [isEditing, setIsEditing] = useState(false);
	const [draft, setDraft] = useState(displayNote);

	const handleSave = async () => {
		await onSave({ id: leadId, noteInterne: draft });
		setIsEditing(false);
	};

	if (!isEditing) {
		return (
			<div
				className="group min-h-[60px] cursor-pointer rounded-xl border border-border/50 bg-muted/30 p-4 text-sm text-muted-foreground transition-colors hover:border-border"
				onClick={() => {
					setDraft(displayNote);
					setIsEditing(true);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						setDraft(displayNote);
						setIsEditing(true);
					}
				}}
				role="button"
				tabIndex={0}
			>
				{displayNote || (
					<span className="text-muted-foreground/60">Cliquez pour ajouter une note...</span>
				)}
				<Edit3
					size={12}
					className="float-right text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100"
				/>
			</div>
		);
	}

	return (
		<div className="space-y-2">
			<textarea
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				rows={4}
				className="w-full rounded-xl border border-border/50 bg-card dark:bg-[#2A2A28] p-4 text-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
				autoFocus
			/>
			<div className="flex gap-2">
				<Button size="sm" onClick={handleSave} className="rounded-lg">
					Sauvegarder
				</Button>
				<Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="rounded-lg">
					Annuler
				</Button>
			</div>
		</div>
	);
}

function QuestionnaireAccordion({ data }: { data: string }) {
	const [isOpen, setIsOpen] = useState(false);

	let parsedAnswers: Record<string, string> | null = null;
	try {
		parsedAnswers = JSON.parse(data);
	} catch {
		// Not JSON
	}

	return (
		<div className="rounded-xl border border-border/50 overflow-hidden">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/30"
			>
				<span>Voir les reponses</span>
				<ChevronDown
					size={14}
					className={`text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{isOpen && (
				<div className="border-t border-border/50 px-4 py-4">
					{parsedAnswers ? (
						<div className="space-y-3">
							{Object.entries(parsedAnswers).map(([question, answer]) => (
								<div key={question}>
									<p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{question}</p>
									<p className="text-sm text-foreground">{String(answer)}</p>
								</div>
							))}
						</div>
					) : (
						<p className="whitespace-pre-wrap text-sm text-muted-foreground">{data}</p>
					)}
				</div>
			)}
		</div>
	);
}
