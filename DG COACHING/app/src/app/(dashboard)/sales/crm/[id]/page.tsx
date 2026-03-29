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
	MessageSquare,
	History,
} from "lucide-react";

const ETAPES = [
	{ id: "appel_a_venir", label: "Appel a venir", color: "bg-blue-100 text-blue-700" },
	{ id: "appel_du_jour", label: "Appel du jour", color: "bg-amber-100 text-amber-700" },
	{ id: "follow_up", label: "Follow up", color: "bg-violet-100 text-violet-700" },
	{ id: "no_show", label: "No show", color: "bg-orange-100 text-orange-700" },
	{ id: "en_attente", label: "En attente", color: "bg-slate-100 text-slate-700" },
	{ id: "close", label: "Close", color: "bg-emerald-100 text-emerald-700" },
	{ id: "perdu", label: "Perdu", color: "bg-red-100 text-red-700" },
];

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-100 text-pink-700",
	facebook: "bg-blue-100 text-blue-700",
	tiktok: "bg-slate-100 text-slate-700",
	google: "bg-green-100 text-green-700",
	referral: "bg-amber-100 text-amber-700",
	organique: "bg-emerald-100 text-emerald-700",
};

const QUAL_COLORS: Record<string, string> = {
	qualifie: "bg-emerald-100 text-emerald-700",
	non_qualifie: "bg-red-100 text-red-700",
	pending: "bg-amber-100 text-amber-700",
};

const TYPE_COLORS: Record<string, string> = {
	prospect: "bg-blue-100 text-blue-700",
	client: "bg-emerald-100 text-emerald-700",
	ancien_client: "bg-slate-100 text-slate-700",
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
			m[u._id] = u.name ?? u.email ?? "—";
		}
		return m;
	}, [team]);

	// Parse history from noteInterne
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
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D0003C] border-t-transparent" />
			</div>
		);
	}

	if (lead === null) {
		return (
			<div className="flex flex-col items-center justify-center py-16">
				<p className="text-base font-medium text-slate-500">Lead introuvable</p>
				<button
					type="button"
					onClick={() => router.push("/sales/crm")}
					className="mt-4 text-sm text-[#D0003C] hover:underline"
				>
					Retour au CRM
				</button>
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
		<div className="mx-auto max-w-6xl space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => router.push("/sales/crm")}
						className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					>
						<ArrowLeft size={20} />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
						<p className="text-sm text-slate-500">
							Cree le {formatDateTime(lead.createdAt)}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{/* Etape dropdown */}
					<div className="relative">
						<select
							value={lead.etapeClosing}
							onChange={(e) => updateEtape({ id, etape: e.target.value })}
							className={`appearance-none rounded-lg border-0 py-2 pr-8 pl-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D0003C] ${currentEtape?.color ?? "bg-slate-100 text-slate-700"}`}
						>
							{ETAPES.map((e) => (
								<option key={e.id} value={e.id}>
									{e.label}
								</option>
							))}
						</select>
						<ChevronDown
							size={14}
							className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2"
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main content - 2 cols */}
				<div className="space-y-6 lg:col-span-2">
					{/* Contact Section */}
					<Section title="Contact" icon={<User size={16} />}>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<EditableField
								label="Nom"
								icon={<User size={14} />}
								value={lead.name}
								field="name"
								editingField={editingField}
								editValue={editValue}
								onStartEdit={startEdit}
								onSave={saveEdit}
								onCancel={cancelEdit}
								onChange={setEditValue}
							/>
							<EditableField
								label="Email"
								icon={<Mail size={14} />}
								value={lead.email ?? ""}
								field="email"
								editingField={editingField}
								editValue={editValue}
								onStartEdit={startEdit}
								onSave={saveEdit}
								onCancel={cancelEdit}
								onChange={setEditValue}
							/>
							<EditableField
								label="Telephone"
								icon={<Phone size={14} />}
								value={lead.phone ?? ""}
								field="phone"
								editingField={editingField}
								editValue={editValue}
								onStartEdit={startEdit}
								onSave={saveEdit}
								onCancel={cancelEdit}
								onChange={setEditValue}
							/>
							<EditableField
								label="Instagram"
								icon={<Instagram size={14} />}
								value={lead.instagram ?? ""}
								field="instagram"
								editingField={editingField}
								editValue={editValue}
								onStartEdit={startEdit}
								onSave={saveEdit}
								onCancel={cancelEdit}
								onChange={setEditValue}
							/>
							<div className="sm:col-span-2">
								<EditableField
									label="Adresse"
									icon={<MapPin size={14} />}
									value={lead.address ?? ""}
									field="address"
									editingField={editingField}
									editValue={editValue}
									onStartEdit={startEdit}
									onSave={saveEdit}
									onCancel={cancelEdit}
									onChange={setEditValue}
								/>
							</div>
						</div>
					</Section>

					{/* Qualification Section */}
					<Section title="Qualification" icon={<FileText size={16} />}>
						<div className="flex flex-wrap gap-3">
							<div>
								<p className="mb-1 text-xs font-medium text-slate-500">Source</p>
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${SOURCE_COLORS[lead.source.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
								>
									{lead.source}
								</span>
							</div>
							<div>
								<p className="mb-1 text-xs font-medium text-slate-500">Type</p>
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${TYPE_COLORS[lead.type] ?? "bg-gray-100 text-gray-600"}`}
								>
									{lead.type}
								</span>
							</div>
							<div>
								<p className="mb-1 text-xs font-medium text-slate-500">Qualification</p>
								<span
									className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${QUAL_COLORS[lead.qualification] ?? "bg-gray-100 text-gray-600"}`}
								>
									{lead.qualification}
								</span>
							</div>
						</div>

						{/* Questionnaire Answers */}
						{lead.questionnaireAnswers && (
							<div className="mt-4">
								<p className="mb-2 text-xs font-medium text-slate-500">
									Reponses questionnaire
								</p>
								<QuestionnaireAccordion data={lead.questionnaireAnswers} />
							</div>
						)}
					</Section>

					{/* Appel de vente Section */}
					<Section title="Appel de vente" icon={<Phone size={16} />}>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<InfoField
								label="Date booking"
								value={lead.dateBookingCall ? formatDateTime(lead.dateBookingCall) : "—"}
								icon={<Calendar size={14} />}
							/>
							<InfoField
								label="Date appel"
								value={lead.dateAppelVente ? formatDateTime(lead.dateAppelVente) : "—"}
								icon={<Calendar size={14} />}
							/>
							<InfoField
								label="Meeting URL"
								value={lead.meetingUrl ?? "—"}
								icon={<ExternalLink size={14} />}
								isLink={!!lead.meetingUrl}
							/>
							<InfoField
								label="Video call"
								value={lead.videoCallUrl ?? "—"}
								icon={<Video size={14} />}
								isLink={!!lead.videoCallUrl}
							/>
						</div>

						{/* Loom embed */}
						{lead.videoCallUrl && lead.videoCallUrl.includes("loom.com") && (
							<div className="mt-4">
								<p className="mb-2 text-xs font-medium text-slate-500">Video Loom</p>
								<div className="aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
									<iframe
										src={lead.videoCallUrl.replace("/share/", "/embed/")}
										className="h-full w-full"
										allowFullScreen
										title="Loom video"
									/>
								</div>
							</div>
						)}

						{/* Transcript */}
						{lead.transcriptCall && (
							<div className="mt-4">
								<p className="mb-2 text-xs font-medium text-slate-500">Transcript</p>
								<div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
									{lead.transcriptCall}
								</div>
							</div>
						)}

						{/* Notes internes (editable) */}
						<div className="mt-4">
							<p className="mb-2 text-xs font-medium text-slate-500">Notes internes</p>
							<NoteEditor
								leadId={id}
								currentNote={lead.noteInterne ?? ""}
								onSave={updateLead}
							/>
						</div>
					</Section>

					{/* Commercial Section */}
					<Section title="Commercial" icon={<Users size={16} />}>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<p className="mb-1 text-xs font-medium text-slate-500">Setter</p>
								<div className="relative">
									<select
										value={lead.setterId ?? ""}
										onChange={(e) => {
											if (e.target.value) {
												assignSetter({
													id,
													setterId: e.target.value as Id<"users">,
												});
											}
										}}
										className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
									>
										<option value="">Non assigne</option>
										{salesTeam.map((u) => (
											<option key={u._id} value={u._id}>
												{u.name ?? u.email}
											</option>
										))}
									</select>
									<ChevronDown
										size={14}
										className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
									/>
								</div>
							</div>
							<div>
								<p className="mb-1 text-xs font-medium text-slate-500">Closer</p>
								<div className="relative">
									<select
										value={lead.closerId ?? ""}
										onChange={(e) => {
											if (e.target.value) {
												assignCloser({
													id,
													closerId: e.target.value as Id<"users">,
												});
											}
										}}
										className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
									>
										<option value="">Non assigne</option>
										{salesTeam.map((u) => (
											<option key={u._id} value={u._id}>
												{u.name ?? u.email}
											</option>
										))}
									</select>
									<ChevronDown
										size={14}
										className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
									/>
								</div>
							</div>
							<InfoField
								label="Montant contracte"
								value={
									lead.montantContracte ? formatEUR(lead.montantContracte) : "—"
								}
								icon={<LinkIcon size={14} />}
							/>
						</div>
					</Section>

					{/* History Section */}
					<Section title="Historique" icon={<History size={16} />}>
						{history.length === 0 ? (
							<p className="text-sm text-slate-400">Aucun changement d'etape enregistre</p>
						) : (
							<div className="space-y-3">
								{history.map((entry: any, i: number) => {
									const fromLabel =
										ETAPES.find((e) => e.id === entry.from)?.label ?? entry.from;
									const toLabel =
										ETAPES.find((e) => e.id === entry.to)?.label ?? entry.to;
									const toColor =
										ETAPES.find((e) => e.id === entry.to)?.color ?? "bg-slate-100 text-slate-700";
									const userName = entry.userId ? (userMap[entry.userId] ?? "Systeme") : "Systeme";

									return (
										<div key={`${entry.timestamp}-${i}`} className="flex gap-3">
											<div className="flex flex-col items-center">
												<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
													<Clock size={12} className="text-slate-500" />
												</div>
												{i < history.length - 1 && (
													<div className="mt-1 w-px flex-1 bg-slate-200" />
												)}
											</div>
											<div className="min-w-0 flex-1 pb-3">
												<p className="text-sm text-slate-700">
													<span className="font-medium">{userName}</span> a change l'etape
												</p>
												<div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
													<span className="text-slate-500">{fromLabel}</span>
													<span className="text-slate-400">→</span>
													<span
														className={`inline-flex rounded-full px-2 py-0.5 font-medium ${toColor}`}
													>
														{toLabel}
													</span>
												</div>
												<p className="mt-0.5 text-[11px] text-slate-400">
													{formatDateTime(entry.timestamp)}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</Section>
				</div>

				{/* Sidebar - Actions */}
				<div className="space-y-4">
					<div className="sticky top-4 space-y-4">
						{/* Quick Info */}
						<div className="rounded-xl border border-slate-200 bg-white p-5">
							<h3 className="mb-3 text-sm font-semibold text-slate-900">Informations</h3>
							<div className="space-y-2.5">
								<div className="flex items-center justify-between text-sm">
									<span className="text-slate-500">Etape</span>
									<span
										className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${currentEtape?.color ?? "bg-slate-100 text-slate-700"}`}
									>
										{currentEtape?.label ?? lead.etapeClosing}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-slate-500">Source</span>
									<span
										className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[lead.source.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
									>
										{lead.source}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-slate-500">Setter</span>
									<span className="text-slate-700">
										{lead.setterId ? (userMap[lead.setterId] ?? "—") : "—"}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-slate-500">Closer</span>
									<span className="text-slate-700">
										{lead.closerId ? (userMap[lead.closerId] ?? "—") : "—"}
									</span>
								</div>
								{lead.montantContracte !== undefined && lead.montantContracte > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-slate-500">Montant</span>
										<span className="font-semibold text-emerald-600">
											{formatEUR(lead.montantContracte)}
										</span>
									</div>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className="rounded-xl border border-slate-200 bg-white p-5">
							<h3 className="mb-3 text-sm font-semibold text-slate-900">Actions</h3>
							<div className="space-y-2">
								<ActionButton
									icon={<Send size={14} />}
									label="Envoyer lien paiement"
									onClick={() => {
										// TODO: Integrate with payment system
									}}
								/>
								<ActionButton
									icon={<Play size={14} />}
									label="Lancer onboarding"
									onClick={() => {
										// TODO: Integrate with onboarding system
									}}
								/>

								<div className="my-3 border-t border-slate-100" />

								{/* Etape quick switch */}
								<p className="mb-1.5 text-xs font-medium text-slate-500">
									Changer etape
								</p>
								<div className="flex flex-wrap gap-1.5">
									{ETAPES.map((e) => (
										<button
											key={e.id}
											type="button"
											onClick={() => updateEtape({ id, etape: e.id })}
											className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-opacity ${
												lead.etapeClosing === e.id
													? `${e.color} ring-2 ring-offset-1 ring-[#D0003C]`
													: `${e.color} opacity-60 hover:opacity-100`
											}`}
										>
											{e.label}
										</button>
									))}
								</div>

								<div className="my-3 border-t border-slate-100" />

								{/* Delete */}
								{!showDeleteConfirm ? (
									<button
										type="button"
										onClick={() => setShowDeleteConfirm(true)}
										className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
									>
										<Trash2 size={14} />
										Supprimer le lead
									</button>
								) : (
									<div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3">
										<p className="text-sm font-medium text-red-700">
											Confirmer la suppression ?
										</p>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={handleDelete}
												className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
											>
												Supprimer
											</button>
											<button
												type="button"
												onClick={() => setShowDeleteConfirm(false)}
												className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
											>
												Annuler
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================================
// Sub-components
// ============================================================

function Section({
	title,
	icon,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-5">
			<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
				{icon}
				{title}
			</h2>
			{children}
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
			<p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
			{isEditing ? (
				<div className="flex items-center gap-1.5">
					<input
						type="text"
						value={editValue}
						onChange={(e) => onChange(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") onSave();
							if (e.key === "Escape") onCancel();
						}}
						className="flex-1 rounded-lg border border-[#D0003C] bg-white px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
						autoFocus
					/>
					<button
						type="button"
						onClick={onSave}
						className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
					>
						<Check size={14} />
					</button>
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
					>
						<X size={14} />
					</button>
				</div>
			) : (
				<div
					className="group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
					onClick={() => onStartEdit(field, value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") onStartEdit(field, value);
					}}
					role="button"
					tabIndex={0}
				>
					<span className="text-slate-400">{icon}</span>
					<span className={value ? "" : "text-slate-400"}>{value || "—"}</span>
					<Edit3
						size={12}
						className="ml-auto text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
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
			<p className="mb-1 text-xs font-medium text-slate-500">{label}</p>
			<div className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-slate-700">
				<span className="text-slate-400">{icon}</span>
				{isLink && value !== "—" ? (
					<a
						href={value}
						target="_blank"
						rel="noopener noreferrer"
						className="truncate text-[#D0003C] underline-offset-2 hover:underline"
					>
						{value}
					</a>
				) : (
					<span className={value === "—" ? "text-slate-400" : ""}>{value}</span>
				)}
			</div>
		</div>
	);
}

function ActionButton({
	icon,
	label,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="inline-flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
		>
			{icon}
			{label}
		</button>
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
	// Don't display JSON history as editable note
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
				className="group min-h-[60px] cursor-pointer rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 transition-colors hover:border-slate-300"
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
					<span className="text-slate-400">Cliquez pour ajouter une note...</span>
				)}
				<Edit3
					size={12}
					className="float-right text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
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
				className="w-full rounded-lg border border-[#D0003C] bg-white p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
				autoFocus
			/>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleSave}
					className="rounded-lg bg-[#D0003C] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#b00033]"
				>
					Sauvegarder
				</button>
				<button
					type="button"
					onClick={() => setIsEditing(false)}
					className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
				>
					Annuler
				</button>
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
		<div className="rounded-lg border border-slate-200">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
			>
				<span>Voir les reponses</span>
				<ChevronDown
					size={14}
					className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{isOpen && (
				<div className="border-t border-slate-200 px-4 py-3">
					{parsedAnswers ? (
						<div className="space-y-2">
							{Object.entries(parsedAnswers).map(([question, answer]) => (
								<div key={question}>
									<p className="text-xs font-medium text-slate-500">{question}</p>
									<p className="text-sm text-slate-700">{String(answer)}</p>
								</div>
							))}
						</div>
					) : (
						<p className="whitespace-pre-wrap text-sm text-slate-600">{data}</p>
					)}
				</div>
			)}
		</div>
	);
}
