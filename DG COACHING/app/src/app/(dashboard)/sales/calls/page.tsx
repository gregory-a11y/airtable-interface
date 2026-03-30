"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
	Phone,
	Calendar,
	Plus,
	Copy,
	Pencil,
	Trash2,
	X,
	Clock,
	User,
	XCircle,
	CheckCircle,
	AlertTriangle,
	ExternalLink,
	Loader2,
	PhoneCall,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

export default function CallsPage() {
	const [tab, setTab] = useState<string>("agenda");

	return (
		<div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Gestion des Calls</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						Gerez vos calendriers de booking et vos rendez-vous
					</p>
				</div>
			</div>

			{/* Tab switcher — pill style */}
			<div className="inline-flex items-center rounded-full bg-muted p-1">
				<button
					onClick={() => setTab("agenda")}
					className={cn(
						"flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
						tab === "agenda"
							? "bg-white dark:bg-[#2A2A28] text-foreground shadow-sm dark:shadow-black/20"
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<Phone size={15} />
					Agenda
				</button>
				<button
					onClick={() => setTab("calendriers")}
					className={cn(
						"flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
						tab === "calendriers"
							? "bg-white dark:bg-[#2A2A28] text-foreground shadow-sm dark:shadow-black/20"
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<Calendar size={15} />
					Calendriers
				</button>
			</div>

			{tab === "agenda" ? <AgendaTab /> : <CalendriersTab />}
		</div>
	);
}

const STATUS_DOT_COLORS: Record<string, string> = {
	confirmed: "bg-emerald-500",
	completed: "bg-blue-500",
	no_show: "bg-red-500",
	cancelled: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
	confirmed: "Confirme",
	completed: "Effectue",
	no_show: "No Show",
	cancelled: "Annule",
};

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
			{/* Filter pills */}
			<div className="inline-flex items-center gap-1.5 rounded-full bg-muted p-1">
				{(["today", "upcoming", "all"] as const).map((f) => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={cn(
							"rounded-full px-4 py-1.5 text-sm font-medium transition-all",
							filter === f
								? "bg-white dark:bg-[#2A2A28] text-foreground shadow-sm dark:shadow-black/20"
								: "text-muted-foreground hover:text-foreground"
						)}
					>
						{f === "today" ? "Aujourd'hui" : f === "upcoming" ? "A venir" : "Tous"}
					</button>
				))}
			</div>

			{/* Calls Grid */}
			{calls === undefined ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : calls.length === 0 ? (
				<div className="card-premium flex flex-col items-center justify-center py-20">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
						<PhoneCall size={28} className="text-muted-foreground/40" />
					</div>
					<p className="text-base font-medium text-foreground">Aucun rendez-vous</p>
					<p className="mt-1 text-sm text-muted-foreground">Les prochains calls apparaitront ici.</p>
				</div>
			) : (
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{calls.map((call, index) => {
						const callDate = new Date(call.startTime);
						const endDate = new Date(call.endTime);
						const timeStr = `${callDate.getHours().toString().padStart(2, "0")}:${callDate.getMinutes().toString().padStart(2, "0")}`;
						const endStr = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
						const dateStr = new Intl.DateTimeFormat("fr-FR", {
							weekday: "short",
							day: "numeric",
							month: "short",
						}).format(callDate);

						return (
							<div
								key={call._id}
								className="card-premium p-4 animate-fade-in"
								style={{ animationDelay: `${index * 50}ms` }}
							>
								{/* Status + Name */}
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2.5">
										<div className={cn("h-2.5 w-2.5 rounded-full shrink-0", STATUS_DOT_COLORS[call.status] ?? "bg-gray-400")} />
										<span className="font-semibold text-foreground text-sm">{call.prospectName}</span>
									</div>
									{call.sourceTag && (
										<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
											{call.sourceTag}
										</span>
									)}
								</div>

								{/* Date/time */}
								<div className="flex items-center gap-2 mb-2">
									<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Calendar size={13} />
										<span>{dateStr}</span>
									</div>
									<span className="text-muted-foreground/40">|</span>
									<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
										<Clock size={13} />
										<span>{timeStr} - {endStr}</span>
									</div>
								</div>

								{/* Contact info */}
								<div className="mb-3 space-y-1">
									<p className="text-xs text-muted-foreground truncate">{call.prospectEmail}</p>
									{call.prospectPhone && (
										<p className="text-xs text-muted-foreground">{call.prospectPhone}</p>
									)}
									<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
										<User size={11} />
										<span>{getHostName(call.hostId)}</span>
									</div>
								</div>

								{/* Status badge */}
								<div className="flex items-center justify-between">
									<span className={cn(
										"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
										call.status === "confirmed" && "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
										call.status === "completed" && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
										call.status === "no_show" && "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
										call.status === "cancelled" && "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
									)}>
										{STATUS_LABELS[call.status] ?? call.status}
									</span>

									{/* Actions */}
									{call.status === "confirmed" && (
										<div className="flex items-center gap-0.5">
											{call.googleMeetUrl && (
												<a
													href={call.googleMeetUrl}
													target="_blank"
													rel="noopener noreferrer"
													title="Rejoindre Meet"
													className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/10"
												>
													<ExternalLink size={14} />
												</a>
											)}
											<button
												onClick={() => handleAction("completed", call._id)}
												title="Marquer effectue"
												className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 dark:text-emerald-400 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
											>
												<CheckCircle size={14} />
											</button>
											<button
												onClick={() => handleAction("no_show", call._id)}
												title="Marquer No Show"
												className="flex h-7 w-7 items-center justify-center rounded-lg text-amber-600 dark:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-500/10"
											>
												<AlertTriangle size={14} />
											</button>
											<button
												onClick={() => handleAction("cancel", call._id)}
												title="Annuler"
												className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
											>
												<XCircle size={14} />
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

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
				<Button
					onClick={() => {
						setEditingId(null);
						setShowModal(true);
					}}
					className="rounded-xl h-10 gap-2"
				>
					<Plus size={15} />
					Nouveau calendrier
				</Button>
			</div>

			{calendars === undefined ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : calendars.length === 0 ? (
				<div className="card-premium flex flex-col items-center justify-center py-20">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
						<Calendar size={28} className="text-muted-foreground/40" />
					</div>
					<p className="text-base font-medium text-foreground">Aucun calendrier</p>
					<p className="mt-1 text-sm text-muted-foreground">Creez-en un pour commencer a recevoir des bookings.</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{calendars.map((cal, index) => (
						<div
							key={cal._id}
							className="card-premium overflow-hidden animate-fade-in"
							style={{ animationDelay: `${index * 60}ms` }}
						>
							{/* Color strip */}
							<div
								className="h-1 w-full"
								style={{ backgroundColor: cal.color || "#D0003C" }}
							/>

							<div className="p-5">
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2.5">
										<div
											className="h-3 w-3 rounded-full shrink-0"
											style={{ backgroundColor: cal.color || "#D0003C" }}
										/>
										<h3 className="font-semibold text-foreground">{cal.name}</h3>
									</div>
									<span className={cn(
										"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
										cal.active
											? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
											: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"
									)}>
										{cal.active ? "Actif" : "Inactif"}
									</span>
								</div>

								<div className="space-y-2 text-xs text-muted-foreground">
									<div className="flex items-center gap-1.5">
										<Clock size={12} />
										<span>{cal.duration} min | {cal.startHour}h - {cal.endHour}h</span>
									</div>
									<div className="flex items-center gap-1.5">
										<User size={12} />
										<span>
											{cal.hosts.length} hote{cal.hosts.length > 1 ? "s" : ""} :{" "}
											{cal.hosts.map((h) => getHostName(h.userId)).join(", ")}
										</span>
									</div>
									<div className="flex items-center gap-1.5 font-mono text-[11px]">
										<ExternalLink size={12} />
										<span className="truncate">/booking/{cal.slug}</span>
									</div>
								</div>

								{cal.description && (
									<p className="mt-2 text-xs text-muted-foreground line-clamp-2">
										{cal.description}
									</p>
								)}

								<div className="mt-4 flex items-center gap-1 border-t border-border/30 pt-3">
									<button
										onClick={() => handleCopyLink(cal.slug)}
										className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									>
										<Copy size={12} />
										Copier
									</button>
									<button
										onClick={() => {
											setEditingId(cal._id);
											setShowModal(true);
										}}
										className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
									>
										<Pencil size={12} />
										Modifier
									</button>
									<button
										onClick={() => handleDelete(cal._id)}
										className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
									>
										<Trash2 size={12} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<CalendarModal
				editingId={editingId}
				open={showModal}
				onClose={() => {
					setShowModal(false);
					setEditingId(null);
				}}
			/>
		</div>
	);
}

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
	open: boolean;
	onClose: () => void;
}

function CalendarModal({ editingId, open, onClose }: CalendarModalProps) {
	const existingCalendar = useQuery(
		api.calendars.getById,
		editingId ? { id: editingId } : "skip",
	);
	const teamMembers = useQuery(api.users.listTeam);
	const createCalendar = useMutation(api.calendars.create);
	const updateCalendar = useMutation(api.calendars.update);

	const isEdit = editingId !== null;
	const isLoading = isEdit && existingCalendar === undefined;

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
		setHosts(existingCalendar.hosts);
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
		<Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Modifier le calendrier" : "Nouveau calendrier"}
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-6 w-6 animate-spin text-primary" />
					</div>
				) : (
					<div className="space-y-5">
						{/* Name + Slug */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Nom *</Label>
								<Input
									value={name}
									onChange={(e) => {
										setName(e.target.value);
										if (!isEdit) setSlug(generateSlug(e.target.value));
									}}
									placeholder="Ex: Appel Decouverte"
									className="mt-1.5 rounded-lg"
								/>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Slug *</Label>
								<Input
									value={slug}
									onChange={(e) => setSlug(generateSlug(e.target.value))}
									placeholder="appel-decouverte"
									className="mt-1.5 rounded-lg font-mono"
								/>
								<p className="mt-1 text-[11px] text-muted-foreground">
									/booking/{slug || "..."}
								</p>
							</div>
						</div>

						{/* Description */}
						<div>
							<Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
								placeholder="Description visible sur la page de booking..."
							/>
						</div>

						{/* Color + Source Tag */}
						<div className="grid gap-4 sm:grid-cols-3">
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Couleur</Label>
								<div className="mt-1.5 flex items-center gap-2">
									<input
										type="color"
										value={color}
										onChange={(e) => setColor(e.target.value)}
										className="h-9 w-9 cursor-pointer rounded-lg border border-input"
									/>
									<span className="font-mono text-xs text-muted-foreground">{color}</span>
								</div>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Source Tag</Label>
								<Input
									value={sourceTag}
									onChange={(e) => setSourceTag(e.target.value)}
									placeholder="ex: meta_ads"
									className="mt-1.5 rounded-lg"
								/>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Note interne</Label>
								<Input
									value={internalNote}
									onChange={(e) => setInternalNote(e.target.value)}
									placeholder="Note visible uniquement en admin"
									className="mt-1.5 rounded-lg"
								/>
							</div>
						</div>

						{/* Duration + Hours */}
						<div className="grid gap-4 sm:grid-cols-4">
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Duree *</Label>
								<Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
									<SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
									<SelectContent>
										{DURATION_OPTIONS.map((opt) => (
											<SelectItem key={opt.value} value={String(opt.value)}>
												{opt.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Debut</Label>
								<Select value={String(startHour)} onValueChange={(v) => setStartHour(Number(v))}>
									<SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
									<SelectContent>
										{Array.from({ length: 24 }, (_, i) => (
											<SelectItem key={i} value={String(i)}>
												{i.toString().padStart(2, "0")}:00
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Fin</Label>
								<Select value={String(endHour)} onValueChange={(v) => setEndHour(Number(v))}>
									<SelectTrigger className="mt-1.5 rounded-lg"><SelectValue /></SelectTrigger>
									<SelectContent>
										{Array.from({ length: 24 }, (_, i) => (
											<SelectItem key={i} value={String(i)}>
												{i.toString().padStart(2, "0")}:00
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Max/jour</Label>
								<Input
									type="number"
									min={0}
									value={maxPerDay}
									onChange={(e) => setMaxPerDay(Number(e.target.value))}
									placeholder="0 = illimite"
									className="mt-1.5 rounded-lg"
								/>
							</div>
						</div>

						{/* Buffer */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Buffer avant (min)</Label>
								<Input
									type="number"
									min={0}
									value={bufferBefore}
									onChange={(e) => setBufferBefore(Number(e.target.value))}
									className="mt-1.5 rounded-lg"
								/>
							</div>
							<div>
								<Label className="text-xs uppercase tracking-wider text-muted-foreground">Buffer apres (min)</Label>
								<Input
									type="number"
									min={0}
									value={bufferAfter}
									onChange={(e) => setBufferAfter(Number(e.target.value))}
									className="mt-1.5 rounded-lg"
								/>
							</div>
						</div>

						{/* Available Days */}
						<div>
							<Label className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Jours disponibles *</Label>
							<div className="mt-1.5 flex flex-wrap gap-2">
								{DAYS_LABELS.map((day) => (
									<button
										key={day.value}
										type="button"
										onClick={() => toggleDay(day.value)}
										className={cn(
											"rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
											availableDays.includes(day.value)
												? "bg-primary text-white shadow-sm"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										)}
									>
										{day.label}
									</button>
								))}
							</div>
						</div>

						{/* Hosts */}
						<div>
							<Label className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Hotes (closers) *</Label>
							<Select
								onValueChange={(v) => {
									if (v) addHost(v as Id<"users">);
								}}
							>
								<SelectTrigger className="mt-1.5 rounded-lg">
									<SelectValue placeholder="+ Ajouter un hote..." />
								</SelectTrigger>
								<SelectContent>
									{salesMembers
										?.filter((m) => !hosts.some((h) => h.userId === m._id))
										.map((m) => (
											<SelectItem key={m._id} value={m._id}>
												{m.name} ({m.role})
											</SelectItem>
										))}
								</SelectContent>
							</Select>
							<div className="mt-2 space-y-2">
								{hosts.map((host) => {
									const member = teamMembers?.find((m) => m._id === host.userId);
									return (
										<div
											key={host.userId}
											className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
										>
											<div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
												{member?.name?.charAt(0).toUpperCase() || "?"}
											</div>
											<span className="flex-1 text-sm text-foreground">
												{member?.name || "Inconnu"}
											</span>
											<Select
												value={host.priority}
												onValueChange={(v) =>
													updateHostPriority(host.userId, v as "high" | "medium" | "low")
												}
											>
												<SelectTrigger className="w-[100px] rounded-lg">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="high">Haute</SelectItem>
													<SelectItem value="medium">Moyenne</SelectItem>
													<SelectItem value="low">Basse</SelectItem>
												</SelectContent>
											</Select>
											<button
												onClick={() => removeHost(host.userId)}
												className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-destructive"
											>
												<X size={14} />
											</button>
										</div>
									);
								})}
							</div>
						</div>

						{/* Notifications */}
						<div className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
							<h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Notifications
							</h4>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={confirmationEmailEnabled}
									onChange={(e) => setConfirmationEmailEnabled(e.target.checked)}
									className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
								/>
								<span className="text-sm text-foreground">
									Email de confirmation
								</span>
							</label>
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={reminderEnabled}
									onChange={(e) => setReminderEnabled(e.target.checked)}
									className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
								/>
								<span className="text-sm text-foreground">Rappel</span>
								{reminderEnabled && (
									<>
										<Input
											type="number"
											min={1}
											value={reminderHoursBefore}
											onChange={(e) => setReminderHoursBefore(Number(e.target.value))}
											className="w-14 rounded-lg"
										/>
										<span className="text-xs text-muted-foreground">h avant</span>
									</>
								)}
							</label>
						</div>

						{/* Confirmation Message */}
						<div>
							<Label className="text-xs uppercase tracking-wider text-muted-foreground">Message de confirmation</Label>
							<textarea
								value={confirmationMessage}
								onChange={(e) => setConfirmationMessage(e.target.value)}
								rows={2}
								className="mt-1.5 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
							/>
						</div>

						{/* Active toggle */}
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={active}
								onChange={(e) => setActive(e.target.checked)}
								className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
							/>
							<span className="text-sm font-medium text-foreground">
								Calendrier actif
							</span>
						</label>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onClose} className="rounded-lg">
						Annuler
					</Button>
					<Button onClick={handleSubmit} disabled={saving} className="rounded-lg gap-2">
						{saving && <Loader2 className="h-4 w-4 animate-spin" />}
						{isEdit ? "Mettre a jour" : "Creer"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
