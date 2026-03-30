"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
	type DragStartEvent,
	type DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import {
	Search,
	GripVertical,
	Calendar,
	DollarSign,
	Loader2,
	User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const ETAPES = [
	{ id: "appel_a_venir", label: "Appel a venir", dot: "bg-blue-500" },
	{ id: "appel_du_jour", label: "Appel du jour", dot: "bg-amber-500" },
	{ id: "follow_up", label: "Follow up", dot: "bg-violet-500" },
	{ id: "no_show", label: "No show", dot: "bg-red-500" },
	{ id: "en_attente", label: "En attente", dot: "bg-gray-400" },
	{ id: "close", label: "Close", dot: "bg-emerald-500" },
	{ id: "perdu", label: "Perdu", dot: "bg-red-600" },
] as const;

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/10",
	facebook: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/10",
	tiktok: "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-1 ring-gray-500/10",
	google: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 ring-1 ring-green-500/10",
	referral: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/10",
	organique: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/10",
	autre: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 ring-1 ring-gray-500/10",
};

function getSourceBadgeClass(source: string) {
	return (
		SOURCE_COLORS[source.toLowerCase()] ??
		"bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 ring-1 ring-gray-500/10"
	);
}

function formatEUR(cents: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

interface Lead {
	_id: Id<"leads">;
	name: string;
	email?: string;
	phone?: string;
	source: string;
	etapeClosing: string;
	montantContracte?: number;
	dateAppelVente?: number;
	dateBookingCall?: number;
	setterId?: Id<"users">;
	closerId?: Id<"users">;
}

export default function PipelinePage() {
	const [search, setSearch] = useState("");
	const [sourceFilter, setSourceFilter] = useState("all");
	const [qualFilter, setQualFilter] = useState("all");
	const [activeId, setActiveId] = useState<string | null>(null);

	const router = useRouter();
	const updateEtape = useMutation(api.leads.updateEtape);

	const data = useQuery(api.leads.getByEtape, {
		search: search || undefined,
		source: sourceFilter !== "all" ? sourceFilter : undefined,
		qualification: qualFilter !== "all" ? qualFilter : undefined,
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const activeLead = activeId
		? Object.values(data ?? {})
				.flat()
				.find((l) => l._id === activeId)
		: null;

	const handleDragStart = useCallback((event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	}, []);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			setActiveId(null);
			const { active, over } = event;
			if (!over) return;

			const leadId = active.id as Id<"leads">;
			const newEtape = over.id as string;

			const currentLead = Object.values(data ?? {})
				.flat()
				.find((l) => l._id === leadId);
			if (!currentLead || currentLead.etapeClosing === newEtape) return;

			updateEtape({ id: leadId, etape: newEtape });
		},
		[data, updateEtape],
	);

	if (data === undefined) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* ── Header ─────────────────────────────────────────── */}
			<div className="mb-6 flex items-center justify-between animate-fade-in">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Pipeline Vente
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Kanban -- glissez les leads entre les etapes
					</p>
				</div>
			</div>

			{/* ── Filters ────────────────────────────────────────── */}
			<div
				className="mb-5 flex flex-wrap items-center gap-3 animate-fade-in"
				style={{ animationDelay: "80ms" }}
			>
				<div className="relative flex-1 sm:max-w-xs">
					<Search
						size={16}
						className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground pointer-events-none"
					/>
					<Input
						type="text"
						placeholder="Rechercher un lead..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 h-10 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10"
					/>
				</div>

				<Select value={sourceFilter} onValueChange={setSourceFilter}>
					<SelectTrigger className="w-[180px] h-10 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10">
						<SelectValue placeholder="Toutes les sources" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Toutes les sources</SelectItem>
						<SelectItem value="instagram">Instagram</SelectItem>
						<SelectItem value="facebook">Facebook</SelectItem>
						<SelectItem value="tiktok">TikTok</SelectItem>
						<SelectItem value="google">Google</SelectItem>
						<SelectItem value="referral">Referral</SelectItem>
						<SelectItem value="organique">Organique</SelectItem>
						<SelectItem value="autre">Autre</SelectItem>
					</SelectContent>
				</Select>

				<Select value={qualFilter} onValueChange={setQualFilter}>
					<SelectTrigger className="w-[180px] h-10 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10">
						<SelectValue placeholder="Toutes qualifications" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">
							Toutes qualifications
						</SelectItem>
						<SelectItem value="qualifie">Qualifie</SelectItem>
						<SelectItem value="non_qualifie">
							Non qualifie
						</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* ── Kanban Board ────────────────────────────────────── */}
			<DndContext
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<div className="flex flex-1 gap-4 overflow-x-auto pb-4">
					{ETAPES.map((etape) => {
						const leads =
							(data[etape.id] as Lead[] | undefined) ?? [];
						return (
							<KanbanColumn
								key={etape.id}
								etape={etape}
								leads={leads}
								onClickLead={(id) =>
									router.push(`/sales/crm/${id}`)
								}
							/>
						);
					})}
				</div>

				<DragOverlay>
					{activeLead ? (
						<LeadCardOverlay lead={activeLead as Lead} />
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

/* ================================================================
   Kanban Column
   ================================================================ */

function KanbanColumn({
	etape,
	leads,
	onClickLead,
}: {
	etape: { id: string; label: string; dot: string };
	leads: Lead[];
	onClickLead: (id: string) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: etape.id });

	return (
		<div
			ref={setNodeRef}
			className={`flex min-w-[280px] shrink-0 flex-col rounded-2xl p-3 transition-all duration-200 ${
				isOver
					? "bg-primary/5 ring-2 ring-primary/20"
					: "bg-muted/30"
			}`}
		>
			{/* Column Header */}
			<div className="flex items-center gap-2 px-1 pb-3">
				<span
					className={`h-2.5 w-2.5 rounded-full ${etape.dot}`}
				/>
				<span className="text-sm font-semibold text-foreground">
					{etape.label}
				</span>
				<span className="ml-auto inline-flex items-center justify-center bg-foreground/5 text-foreground text-xs font-medium rounded-full px-2 py-0.5 tabular-nums">
					{leads.length}
				</span>
			</div>

			{/* Cards */}
			<div
				className="flex-1 space-y-2.5 overflow-y-auto"
				style={{ maxHeight: "calc(100vh - 280px)" }}
			>
				{leads.length === 0 ? (
					<p className="py-8 text-center text-xs text-muted-foreground">
						Aucun lead
					</p>
				) : (
					leads.map((lead) => (
						<DraggableLeadCard
							key={lead._id}
							lead={lead}
							onClick={() => onClickLead(lead._id)}
						/>
					))
				)}
			</div>
		</div>
	);
}

/* ================================================================
   Draggable Lead Card
   ================================================================ */

function DraggableLeadCard({
	lead,
	onClick,
}: {
	lead: Lead;
	onClick: () => void;
}) {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: lead._id,
		});

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
			}
		: undefined;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`group bg-card rounded-xl p-4 shadow-sm dark:shadow-black/20 border border-border/40 transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer ${
				isDragging ? "opacity-40 scale-[0.98]" : ""
			}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick();
			}}
			role="button"
			tabIndex={0}
		>
			{/* Top row: name + drag handle */}
			<div className="flex items-start justify-between mb-2.5">
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-foreground truncate">
						{lead.name}
					</p>
					{lead.email && (
						<p className="text-xs text-muted-foreground truncate mt-0.5">
							{lead.email}
						</p>
					)}
				</div>
				<div
					{...attributes}
					{...listeners}
					className="ml-2 cursor-grab rounded-lg p-1 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted/50 hover:text-muted-foreground"
				>
					<GripVertical size={14} />
				</div>
			</div>

			{/* Source badge + amount */}
			<div className="flex flex-wrap items-center gap-2">
				<span
					className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceBadgeClass(lead.source)}`}
				>
					{lead.source}
				</span>

				{lead.montantContracte !== undefined &&
					lead.montantContracte > 0 && (
						<span className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary">
							<DollarSign size={12} />
							{formatEUR(lead.montantContracte)}
						</span>
					)}
			</div>

			{/* Date */}
			{(lead.dateAppelVente || lead.dateBookingCall) && (
				<div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
					<Calendar size={11} className="shrink-0" />
					{new Intl.DateTimeFormat("fr-FR", {
						day: "numeric",
						month: "short",
					}).format(
						new Date(
							lead.dateAppelVente ?? lead.dateBookingCall!,
						),
					)}
				</div>
			)}

			{/* Setter/Closer initials */}
			{(lead.setterId || lead.closerId) && (
				<div className="mt-2.5 flex items-center gap-1.5">
					{lead.setterId && (
						<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/10 text-[10px] font-semibold text-blue-600 ring-1 ring-blue-500/10">
							<User size={10} />
						</span>
					)}
					{lead.closerId && (
						<span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary ring-1 ring-primary/10">
							<User size={10} />
						</span>
					)}
				</div>
			)}
		</div>
	);
}

/* ================================================================
   Drag Overlay Card
   ================================================================ */

function LeadCardOverlay({ lead }: { lead: Lead }) {
	return (
		<div className="w-[280px] bg-card rounded-xl p-4 shadow-lg dark:shadow-black/30 border-2 border-primary/30 ring-4 ring-primary/5">
			<p className="text-sm font-semibold text-foreground truncate">
				{lead.name}
			</p>
			{lead.email && (
				<p className="text-xs text-muted-foreground truncate mt-0.5">
					{lead.email}
				</p>
			)}
			<div className="mt-2 flex items-center gap-2">
				<span
					className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceBadgeClass(lead.source)}`}
				>
					{lead.source}
				</span>
				{lead.montantContracte !== undefined &&
					lead.montantContracte > 0 && (
						<span className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary">
							<DollarSign size={12} />
							{formatEUR(lead.montantContracte)}
						</span>
					)}
			</div>
		</div>
	);
}
