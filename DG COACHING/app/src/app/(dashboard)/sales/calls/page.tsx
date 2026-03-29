"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
	Phone,
	Calendar,
	Plus,
	Copy,
	Pencil,
	Trash2,
	X,
	Check,
	Clock,
	User,
	XCircle,
	CheckCircle,
	AlertTriangle,
	ExternalLink,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

// ============================================================
// MAIN PAGE
// ============================================================

export default function CallsPage() {
	const [tab, setTab] = useState<"agenda" | "calendriers">("agenda");

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">Gestion des Calls</h1>
					<p className="mt-1 text-sm text-slate-500">
						Gerez vos calendriers de booking et vos rendez-vous
					</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 rounded-lg bg-slate-100 p-1">
				<button
					type="button"
					onClick={() => setTab("agenda")}
					className={cn(
						"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
						tab === "agenda"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					<Phone size={16} />
					Agenda
				</button>
				<button
					type="button"
					onClick={() => setTab("calendriers")}
					className={cn(
						"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
						tab === "calendriers"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					<Calendar size={16} />
					Calendriers
				</button>
			</div>

			{tab === "agenda" ? <AgendaTab /> : <CalendriersTab />}
		</div>
	);
}

// ============================================================
// AGENDA TAB
// ============================================================

function AgendaTab() {
	const [filter, setFilter] = useState<"today" | "upcoming" | "all">("upcoming");
	const todayCalls = useQuery(api.bookings.getToday, {});
	const upcomingCalls = useQuery(api.bookings.getUpcoming, {});
	const allCalls = useQuery(api.bookings.list, {});
	const teamMembers = useQuery(api.users.listTeam);

	const cancelBooking = useMutation(api.bookings.cancel);
	const markNoShow = useMutation(api.bookings.markNoShow);
	const markCompleted = useMutation(api.bookings.markCompleted);

	const calls =
		filter === "today"
			? todayCalls
			: filter === "upcoming"
				? upcomingCalls
				: allCalls;

	const getHostName = (hostId: Id<"users">) => {
		const host = teamMembers?.find((m) => m._id === hostId);
		return host?.name || "Inconnu";
	};

	const statusConfig = {
		confirmed: {
			label: "Confirme",
			color: "bg-blue-50 text-blue-700 border-blue-200",
			icon: <Clock size={14} />,
		},
		completed: {
			label: "Effectue",
			color: "bg-emerald-50 text-emerald-700 border-emerald-200",
			icon: <CheckCircle size={14} />,
		},
		no_show: {
			label: "No Show",
			color: "bg-red-50 text-red-700 border-red-200",
			icon: <AlertTriangle size={14} />,
		},
		cancelled: {
			label: "Annule",
			color: "bg-slate-50 text-slate-500 border-slate-200",
			icon: <XCircle size={14} />,
		},
	};

	const handleAction = async (
		action: "cancel" | "no_show" | "completed",
		id: Id<"bookings">,
	) => {
		try {
			if (action === "cancel") {
				await cancelBooking({ id });
				toast.success("Rendez-vous annule");
			} else if (action === "no_show") {
				await markNoShow({ id });
				toast.success("Marque comme No Show");
			} else {
				await markCompleted({ id });
				toast.success("Marque comme effectue");
			}
		} catch {
			toast.error("Erreur lors de la mise a jour");
		}
	};

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex items-center gap-2">
				{(["today", "upcoming", "all"] as const).map((f) => (
					<button
						key={f}
						type="button"
						onClick={() => setFilter(f)}
						className={cn(
							"rounded-full px-3 py-1 text-xs font-medium transition-colors",
							filter === f
								? "bg-[#D0003C] text-white"
								: "bg-slate-100 text-slate-600 hover:bg-slate-200",
						)}
					>
						{f === "today" ? "Aujourd'hui" : f === "upcoming" ? "A venir" : "Tous"}
					</button>
				))}
			</div>

			{/* Calls List */}
			{calls === undefined ? (
				<div className="flex items-center justify-center py-12">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D0003C] border-t-transparent" />
				</div>
			) : calls.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
					<Phone size={40} className="mx-auto text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">Aucun rendez-vous</p>
				</div>
			) : (
				<div className="space-y-2">
					{calls.map((call) => {
						const status = statusConfig[call.status];
						const callDate = new Date(call.startTime);
						const endDate = new Date(call.endTime);
						const timeStr = `${callDate.getHours().toString().padStart(2, "0")}:${callDate.getMinutes().toString().padStart(2, "0")}`;
						const endStr = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

						return (
							<div
								key={call._id}
								className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
							>
								{/* Time */}
								<div className="min-w-[100px] text-center">
									<div className="text-lg font-bold text-slate-800">{timeStr}</div>
									<div className="text-xs text-slate-400">{endStr}</div>
									<div className="mt-1 text-[11px] text-slate-400">
										{new Intl.DateTimeFormat("fr-FR", {
											day: "numeric",
											month: "short",
										}).format(callDate)}
									</div>
								</div>

								{/* Divider */}
								<div className="h-12 w-px bg-slate-200" />

								{/* Info */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="font-medium text-slate-800 truncate">
											{call.prospectName}
										</span>
										<span
											className={cn(
												"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
												status.color,
											)}
										>
											{status.icon}
											{status.label}
										</span>
									</div>
									<div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
										<span>{call.prospectEmail}</span>
										{call.prospectPhone && <span>{call.prospectPhone}</span>}
									</div>
									<div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
										<User size={12} />
										<span>{getHostName(call.hostId)}</span>
										{call.sourceTag && (
											<>
												<span className="text-slate-300">|</span>
												<span className="text-slate-400">{call.sourceTag}</span>
											</>
										)}
									</div>
								</div>

								{/* Actions */}
								{call.status === "confirmed" && (
									<div className="flex items-center gap-1">
										{call.googleMeetUrl && (
											<a
												href={call.googleMeetUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="rounded-lg p-2 text-blue-600 transition-colors hover:bg-blue-50"
												title="Rejoindre Meet"
											>
												<ExternalLink size={16} />
											</a>
										)}
										<button
											type="button"
											onClick={() => handleAction("completed", call._id)}
											className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
											title="Marquer effectue"
										>
											<CheckCircle size={16} />
										</button>
										<button
											type="button"
											onClick={() => handleAction("no_show", call._id)}
											className="rounded-lg p-2 text-amber-600 transition-colors hover:bg-amber-50"
											title="Marquer No Show"
										>
											<AlertTriangle size={16} />
										</button>
										<button
											type="button"
											onClick={() => handleAction("cancel", call._id)}
											className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
											title="Annuler"
										>
											<XCircle size={16} />
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

// ============================================================
// CALENDRIERS TAB
// ============================================================

function CalendriersTab() {
	const calendars = useQuery(api.calendars.list);
	const teamMembers = useQuery(api.users.listTeam);
	const removeCalendar = useMutation(api.calendars.remove);

	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState<Id<"calendars"> | null>(null);

	const getHostName = (userId: Id<"users">) => {
		const host = teamMembers?.find((m) => m._id === userId);
		return host?.name || "Inconnu";
	};

	const handleCopyLink = (slug: string) => {
		const url = `${window.location.origin}/booking/${slug}`;
		navigator.clipboard.writeText(url);
		toast.success("Lien copie dans le presse-papier");
	};

	const handleDelete = async (id: Id<"calendars">) => {
		if (!confirm("Supprimer ce calendrier ? Cette action est irreversible.")) return;
		try {
			await removeCalendar({ id });
			toast.success("Calendrier supprime");
		} catch {
			toast.error("Erreur lors de la suppression");
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<button
					type="button"
					onClick={() => {
						setEditingId(null);
						setShowModal(true);
					}}
					className="flex items-center gap-2 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00034]"
				>
					<Plus size={16} />
					Nouveau calendrier
				</button>
			</div>

			{calendars === undefined ? (
				<div className="flex items-center justify-center py-12">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D0003C] border-t-transparent" />
				</div>
			) : calendars.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
					<Calendar size={40} className="mx-auto text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">
						Aucun calendrier. Creez-en un pour commencer.
					</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{calendars.map((cal) => (
						<div
							key={cal._id}
							className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div
										className="h-3 w-3 rounded-full"
										style={{ backgroundColor: cal.color || "#D0003C" }}
									/>
									<h3 className="font-semibold text-slate-800">{cal.name}</h3>
								</div>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-[11px] font-medium",
										cal.active
											? "bg-emerald-50 text-emerald-700"
											: "bg-slate-100 text-slate-500",
									)}
								>
									{cal.active ? "Actif" : "Inactif"}
								</span>
							</div>

							<div className="mt-3 space-y-2 text-xs text-slate-500">
								<div className="flex items-center gap-1.5">
									<Clock size={12} />
									<span>
										{cal.duration} min | {cal.startHour}h - {cal.endHour}h
									</span>
								</div>
								<div className="flex items-center gap-1.5">
									<User size={12} />
									<span>
										{cal.hosts.length} hote{cal.hosts.length > 1 ? "s" : ""} :{" "}
										{cal.hosts
											.map((h) => getHostName(h.userId))
											.join(", ")}
									</span>
								</div>
								<div className="flex items-center gap-1.5 font-mono text-[11px]">
									<ExternalLink size={12} />
									<span className="truncate">/booking/{cal.slug}</span>
								</div>
							</div>

							{cal.description && (
								<p className="mt-2 text-xs text-slate-400 line-clamp-2">
									{cal.description}
								</p>
							)}

							<div className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3">
								<button
									type="button"
									onClick={() => handleCopyLink(cal.slug)}
									className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50"
									title="Copier le lien"
								>
									<Copy size={13} />
									Copier
								</button>
								<button
									type="button"
									onClick={() => {
										setEditingId(cal._id);
										setShowModal(true);
									}}
									className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50"
									title="Modifier"
								>
									<Pencil size={13} />
									Modifier
								</button>
								<button
									type="button"
									onClick={() => handleDelete(cal._id)}
									className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-50"
									title="Supprimer"
								>
									<Trash2 size={13} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{showModal && (
				<CalendarModal
					editingId={editingId}
					onClose={() => {
						setShowModal(false);
						setEditingId(null);
					}}
				/>
			)}
		</div>
	);
}

// ============================================================
// CALENDAR MODAL
// ============================================================

const DAYS_LABELS = [
	{ value: 1, label: "Lun" },
	{ value: 2, label: "Mar" },
	{ value: 3, label: "Mer" },
	{ value: 4, label: "Jeu" },
	{ value: 5, label: "Ven" },
	{ value: 6, label: "Sam" },
	{ value: 0, label: "Dim" },
];

const DURATION_OPTIONS = [
	{ value: 15, label: "15 min" },
	{ value: 30, label: "30 min" },
	{ value: 45, label: "45 min" },
	{ value: 60, label: "1h" },
	{ value: 90, label: "1h30" },
];

interface CalendarModalProps {
	editingId: Id<"calendars"> | null;
	onClose: () => void;
}

function CalendarModal({ editingId, onClose }: CalendarModalProps) {
	const existingCalendar = useQuery(
		api.calendars.getById,
		editingId ? { id: editingId } : "skip",
	);
	const teamMembers = useQuery(api.users.listTeam);
	const createCalendar = useMutation(api.calendars.create);
	const updateCalendar = useMutation(api.calendars.update);

	const isEdit = editingId !== null;
	const isLoading = isEdit && existingCalendar === undefined;

	// Form state
	const [name, setName] = useState("");
	const [slug, setSlug] = useState("");
	const [description, setDescription] = useState("");
	const [color, setColor] = useState("#D0003C");
	const [internalNote, setInternalNote] = useState("");
	const [sourceTag, setSourceTag] = useState("");
	const [duration, setDuration] = useState(30);
	const [bufferBefore, setBufferBefore] = useState(0);
	const [bufferAfter, setBufferAfter] = useState(0);
	const [maxPerDay, setMaxPerDay] = useState(0);
	const [availableDays, setAvailableDays] = useState<number[]>([1, 2, 3, 4, 5]);
	const [startHour, setStartHour] = useState(9);
	const [endHour, setEndHour] = useState(18);
	const [hosts, setHosts] = useState<
		{ userId: Id<"users">; priority: "high" | "medium" | "low" }[]
	>([]);
	const [confirmationEmailEnabled, setConfirmationEmailEnabled] = useState(true);
	const [reminderEnabled, setReminderEnabled] = useState(true);
	const [reminderHoursBefore, setReminderHoursBefore] = useState(1);
	const [confirmationMessage, setConfirmationMessage] = useState(
		"Votre rendez-vous est confirme ! Nous avons hate d'echanger avec vous.",
	);
	const [active, setActive] = useState(true);
	const [initialized, setInitialized] = useState(false);
	const [saving, setSaving] = useState(false);

	// Initialize form with existing data on edit
	if (isEdit && existingCalendar && !initialized) {
		setName(existingCalendar.name);
		setSlug(existingCalendar.slug);
		setDescription(existingCalendar.description || "");
		setColor(existingCalendar.color || "#D0003C");
		setInternalNote(existingCalendar.internalNote || "");
		setSourceTag(existingCalendar.sourceTag || "");
		setDuration(existingCalendar.duration);
		setBufferBefore(existingCalendar.bufferBefore || 0);
		setBufferAfter(existingCalendar.bufferAfter || 0);
		setMaxPerDay(existingCalendar.maxPerDay || 0);
		setAvailableDays(existingCalendar.availableDays);
		setStartHour(existingCalendar.startHour);
		setEndHour(existingCalendar.endHour);
		setHosts(existingCalendar.hosts as any);
		setConfirmationEmailEnabled(existingCalendar.confirmationEmailEnabled);
		setReminderEnabled(existingCalendar.reminderEnabled);
		setReminderHoursBefore(existingCalendar.reminderHoursBefore || 1);
		setConfirmationMessage(
			existingCalendar.confirmationMessage ||
				"Votre rendez-vous est confirme ! Nous avons hate d'echanger avec vous.",
		);
		setActive(existingCalendar.active);
		setInitialized(true);
	}

	const generateSlug = (n: string) => {
		return n
			.toLowerCase()
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
	};

	const toggleDay = (day: number) => {
		setAvailableDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
		);
	};

	const addHost = (userId: Id<"users">) => {
		if (hosts.some((h) => h.userId === userId)) return;
		setHosts([...hosts, { userId, priority: "medium" }]);
	};

	const removeHost = (userId: Id<"users">) => {
		setHosts(hosts.filter((h) => h.userId !== userId));
	};

	const updateHostPriority = (
		userId: Id<"users">,
		priority: "high" | "medium" | "low",
	) => {
		setHosts(hosts.map((h) => (h.userId === userId ? { ...h, priority } : h)));
	};

	const handleSubmit = async () => {
		if (!name.trim() || !slug.trim()) {
			toast.error("Nom et slug sont requis");
			return;
		}
		if (hosts.length === 0) {
			toast.error("Ajoutez au moins un hote");
			return;
		}
		if (availableDays.length === 0) {
			toast.error("Selectionnez au moins un jour");
			return;
		}

		setSaving(true);
		try {
			if (isEdit && editingId) {
				await updateCalendar({
					id: editingId,
					name,
					slug,
					description: description || undefined,
					color,
					internalNote: internalNote || undefined,
					sourceTag: sourceTag || undefined,
					duration,
					bufferBefore,
					bufferAfter,
					maxPerDay: maxPerDay || undefined,
					availableDays,
					startHour,
					endHour,
					timezone: "Europe/Paris",
					hosts,
					confirmationEmailEnabled,
					reminderEnabled,
					reminderHoursBefore,
					confirmationMessage,
					active,
				});
				toast.success("Calendrier mis a jour");
			} else {
				await createCalendar({
					name,
					slug,
					description: description || undefined,
					color,
					internalNote: internalNote || undefined,
					sourceTag: sourceTag || undefined,
					duration,
					bufferBefore,
					bufferAfter,
					maxPerDay: maxPerDay || undefined,
					availableDays,
					startHour,
					endHour,
					timezone: "Europe/Paris",
					hosts,
					confirmationEmailEnabled,
					reminderEnabled,
					reminderHoursBefore,
					confirmationMessage,
					active,
				});
				toast.success("Calendrier cree");
			}
			onClose();
		} catch (err: any) {
			toast.error(err.message || "Erreur");
		} finally {
			setSaving(false);
		}
	};

	const salesMembers = teamMembers?.filter(
		(m) => m.role === "sales" || m.role === "admin",
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={() => {}}
				role="presentation"
			/>
			<div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-100 pb-4">
					<h2 className="text-lg font-bold text-slate-800">
						{isEdit ? "Modifier le calendrier" : "Nouveau calendrier"}
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
					>
						<X size={18} />
					</button>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D0003C] border-t-transparent" />
					</div>
				) : (
					<div className="mt-4 space-y-5">
						{/* Name + Slug */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Nom *
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										if (!isEdit) setSlug(generateSlug(e.target.value));
									}}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="Ex: Appel Decouverte"
								/>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Slug *
								</label>
								<input
									type="text"
									value={slug}
									onChange={(e) => setSlug(generateSlug(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="appel-decouverte"
								/>
								<p className="mt-1 text-[11px] text-slate-400">
									/booking/{slug || "..."}
								</p>
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="mb-1 block text-xs font-medium text-slate-600">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
								placeholder="Description visible sur la page de booking..."
							/>
						</div>

						{/* Color + Source Tag */}
						<div className="grid gap-4 sm:grid-cols-3">
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Couleur
								</label>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={color}
										onChange={(e) => setColor(e.target.value)}
										className="h-9 w-9 cursor-pointer rounded border border-slate-200"
									/>
									<span className="font-mono text-xs text-slate-400">{color}</span>
								</div>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Source Tag
								</label>
								<input
									type="text"
									value={sourceTag}
									onChange={(e) => setSourceTag(e.target.value)}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="ex: meta_ads"
								/>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Note interne
								</label>
								<input
									type="text"
									value={internalNote}
									onChange={(e) => setInternalNote(e.target.value)}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="Note visible uniquement en admin"
								/>
							</div>
						</div>

						{/* Duration + Hours */}
						<div className="grid gap-4 sm:grid-cols-4">
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Duree *
								</label>
								<select
									value={duration}
									onChange={(e) => setDuration(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								>
									{DURATION_OPTIONS.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Debut
								</label>
								<select
									value={startHour}
									onChange={(e) => setStartHour(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								>
									{Array.from({ length: 24 }, (_, i) => (
										<option key={i} value={i}>
											{i.toString().padStart(2, "0")}:00
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Fin
								</label>
								<select
									value={endHour}
									onChange={(e) => setEndHour(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								>
									{Array.from({ length: 24 }, (_, i) => (
										<option key={i} value={i}>
											{i.toString().padStart(2, "0")}:00
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Max/jour
								</label>
								<input
									type="number"
									min={0}
									value={maxPerDay}
									onChange={(e) => setMaxPerDay(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="0 = illimite"
								/>
							</div>
						</div>

						{/* Buffer */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Buffer avant (min)
								</label>
								<input
									type="number"
									min={0}
									value={bufferBefore}
									onChange={(e) => setBufferBefore(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
								/>
							</div>
							<div>
								<label className="mb-1 block text-xs font-medium text-slate-600">
									Buffer apres (min)
								</label>
								<input
									type="number"
									min={0}
									value={bufferAfter}
									onChange={(e) => setBufferAfter(Number(e.target.value))}
									className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
								/>
							</div>
						</div>

						{/* Available Days */}
						<div>
							<label className="mb-2 block text-xs font-medium text-slate-600">
								Jours disponibles *
							</label>
							<div className="flex flex-wrap gap-2">
								{DAYS_LABELS.map((day) => (
									<button
										key={day.value}
										type="button"
										onClick={() => toggleDay(day.value)}
										className={cn(
											"rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
											availableDays.includes(day.value)
												? "border-[#D0003C] bg-[#D0003C] text-white"
												: "border-slate-200 text-slate-500 hover:border-slate-300",
										)}
									>
										{day.label}
									</button>
								))}
							</div>
						</div>

						{/* Hosts */}
						<div>
							<label className="mb-2 block text-xs font-medium text-slate-600">
								Hotes (closers) *
							</label>
							{/* Add host */}
							<select
								onChange={(e) => {
									if (e.target.value) {
										addHost(e.target.value as Id<"users">);
										e.target.value = "";
									}
								}}
								className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								defaultValue=""
							>
								<option value="" disabled>
									+ Ajouter un hote...
								</option>
								{salesMembers
									?.filter((m) => !hosts.some((h) => h.userId === m._id))
									.map((m) => (
										<option key={m._id} value={m._id}>
											{m.name} ({m.role})
										</option>
									))}
							</select>
							{/* Host list */}
							<div className="space-y-2">
								{hosts.map((host) => {
									const member = teamMembers?.find((m) => m._id === host.userId);
									return (
										<div
											key={host.userId}
											className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
										>
											<div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D0003C] text-xs font-bold text-white">
												{member?.name?.charAt(0).toUpperCase() || "?"}
											</div>
											<span className="flex-1 text-sm text-slate-700">
												{member?.name || "Inconnu"}
											</span>
											<select
												value={host.priority}
												onChange={(e) =>
													updateHostPriority(
														host.userId,
														e.target.value as "high" | "medium" | "low",
													)
												}
												className={cn(
													"rounded-md border px-2 py-1 text-[11px] font-medium",
													host.priority === "high"
														? "border-red-200 bg-red-50 text-red-700"
														: host.priority === "medium"
															? "border-amber-200 bg-amber-50 text-amber-700"
															: "border-slate-200 bg-slate-100 text-slate-600",
												)}
											>
												<option value="high">Haute</option>
												<option value="medium">Moyenne</option>
												<option value="low">Basse</option>
											</select>
											<button
												type="button"
												onClick={() => removeHost(host.userId)}
												className="text-slate-400 hover:text-red-500"
											>
												<X size={14} />
											</button>
										</div>
									);
								})}
							</div>
						</div>

						{/* Notifications */}
						<div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
							<h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
								Notifications
							</h4>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={confirmationEmailEnabled}
									onChange={(e) =>
										setConfirmationEmailEnabled(e.target.checked)
									}
									className="h-4 w-4 rounded border-slate-300 text-[#D0003C] focus:ring-[#D0003C]"
								/>
								<span className="text-sm text-slate-600">
									Email de confirmation
								</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={reminderEnabled}
									onChange={(e) => setReminderEnabled(e.target.checked)}
									className="h-4 w-4 rounded border-slate-300 text-[#D0003C] focus:ring-[#D0003C]"
								/>
								<span className="text-sm text-slate-600">
									Rappel
								</span>
								{reminderEnabled && (
									<>
										<input
											type="number"
											min={1}
											value={reminderHoursBefore}
											onChange={(e) =>
												setReminderHoursBefore(Number(e.target.value))
											}
											className="w-14 rounded border border-slate-200 px-2 py-1 text-xs"
										/>
										<span className="text-xs text-slate-500">h avant</span>
									</>
								)}
							</label>
						</div>

						{/* Confirmation Message */}
						<div>
							<label className="mb-1 block text-xs font-medium text-slate-600">
								Message de confirmation
							</label>
							<textarea
								value={confirmationMessage}
								onChange={(e) => setConfirmationMessage(e.target.value)}
								rows={2}
								className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							/>
						</div>

						{/* Active toggle */}
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={active}
								onChange={(e) => setActive(e.target.checked)}
								className="h-4 w-4 rounded border-slate-300 text-[#D0003C] focus:ring-[#D0003C]"
							/>
							<span className="text-sm font-medium text-slate-600">
								Calendrier actif
							</span>
						</label>

						{/* Actions */}
						<div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100"
							>
								Annuler
							</button>
							<button
								type="button"
								onClick={handleSubmit}
								disabled={saving}
								className="flex items-center gap-2 rounded-lg bg-[#D0003C] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00034] disabled:opacity-50"
							>
								{saving ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : (
									<Check size={16} />
								)}
								{isEdit ? "Mettre a jour" : "Creer"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
