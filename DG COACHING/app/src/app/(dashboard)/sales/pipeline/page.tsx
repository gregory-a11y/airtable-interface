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
	ChevronDown,
	GripVertical,
	Phone,
	Calendar,
	User,
	DollarSign,
} from "lucide-react";

const ETAPES = [
	{ id: "appel_a_venir", label: "Appel a venir", color: "bg-blue-500" },
	{ id: "appel_du_jour", label: "Appel du jour", color: "bg-amber-500" },
	{ id: "follow_up", label: "Follow up", color: "bg-violet-500" },
	{ id: "no_show", label: "No show", color: "bg-orange-500" },
	{ id: "en_attente", label: "En attente", color: "bg-slate-500" },
	{ id: "close", label: "Close", color: "bg-emerald-500" },
	{ id: "perdu", label: "Perdu", color: "bg-red-500" },
] as const;

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-100 text-pink-700",
	facebook: "bg-blue-100 text-blue-700",
	tiktok: "bg-slate-100 text-slate-700",
	google: "bg-green-100 text-green-700",
	referral: "bg-amber-100 text-amber-700",
	organique: "bg-emerald-100 text-emerald-700",
	autre: "bg-gray-100 text-gray-600",
};

function getSourceBadgeClass(source: string) {
	return SOURCE_COLORS[source.toLowerCase()] ?? "bg-gray-100 text-gray-600";
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
	const [sourceFilter, setSourceFilter] = useState("");
	const [qualFilter, setQualFilter] = useState("");
	const [activeId, setActiveId] = useState<string | null>(null);

	const router = useRouter();
	const updateEtape = useMutation(api.leads.updateEtape);

	const data = useQuery(api.leads.getByEtape, {
		search: search || undefined,
		source: sourceFilter || undefined,
		qualification: qualFilter || undefined,
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

			// Find the lead's current etape
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
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D0003C] border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Pipeline Vente</h1>
					<p className="text-sm text-slate-500">Kanban — glissez les leads entre les etapes</p>
				</div>
			</div>

			{/* Filter Bar */}
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<div className="relative flex-1 sm:max-w-xs">
					<Search
						size={16}
						className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="text"
						placeholder="Rechercher un lead..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>

				<div className="relative">
					<select
						value={sourceFilter}
						onChange={(e) => setSourceFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					>
						<option value="">Toutes les sources</option>
						<option value="instagram">Instagram</option>
						<option value="facebook">Facebook</option>
						<option value="tiktok">TikTok</option>
						<option value="google">Google</option>
						<option value="referral">Referral</option>
						<option value="organique">Organique</option>
						<option value="autre">Autre</option>
					</select>
					<ChevronDown
						size={14}
						className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
					/>
				</div>

				<div className="relative">
					<select
						value={qualFilter}
						onChange={(e) => setQualFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					>
						<option value="">Toutes qualifications</option>
						<option value="qualifie">Qualifie</option>
						<option value="non_qualifie">Non qualifie</option>
						<option value="pending">Pending</option>
					</select>
					<ChevronDown
						size={14}
						className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
					/>
				</div>
			</div>

			{/* Kanban Board */}
			<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
				<div className="flex flex-1 gap-4 overflow-x-auto pb-4">
					{ETAPES.map((etape) => {
						const leads = (data[etape.id] as Lead[] | undefined) ?? [];
						return (
							<KanbanColumn
								key={etape.id}
								etape={etape}
								leads={leads}
								onClickLead={(id) => router.push(`/sales/crm/${id}`)}
							/>
						);
					})}
				</div>

				<DragOverlay>
					{activeLead ? <LeadCardOverlay lead={activeLead as Lead} /> : null}
				</DragOverlay>
			</DndContext>
		</div>
	);
}

function KanbanColumn({
	etape,
	leads,
	onClickLead,
}: {
	etape: { id: string; label: string; color: string };
	leads: Lead[];
	onClickLead: (id: string) => void;
}) {
	const { setNodeRef, isOver } = useDroppable({ id: etape.id });

	return (
		<div
			ref={setNodeRef}
			className={`flex w-72 shrink-0 flex-col rounded-xl border bg-slate-50 transition-colors ${
				isOver ? "border-[#D0003C] bg-red-50/30" : "border-slate-200"
			}`}
		>
			{/* Column Header */}
			<div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
				<div className={`h-2.5 w-2.5 rounded-full ${etape.color}`} />
				<span className="text-sm font-semibold text-slate-800">{etape.label}</span>
				<span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
					{leads.length}
				</span>
			</div>

			{/* Cards */}
			<div className="flex-1 space-y-2 overflow-y-auto p-3" style={{ maxHeight: "calc(100vh - 280px)" }}>
				{leads.length === 0 ? (
					<p className="py-4 text-center text-xs text-slate-400">Aucun lead</p>
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

function DraggableLeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
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
			className={`group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
				isDragging ? "opacity-50" : ""
			}`}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick();
			}}
			role="button"
			tabIndex={0}
		>
			<div className="mb-2 flex items-start justify-between">
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-slate-800">{lead.name}</p>
					{lead.email && (
						<p className="truncate text-xs text-slate-400">{lead.email}</p>
					)}
				</div>
				<div
					{...attributes}
					{...listeners}
					className="ml-2 cursor-grab rounded p-0.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100"
				>
					<GripVertical size={14} />
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-1.5">
				<span
					className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceBadgeClass(lead.source)}`}
				>
					{lead.source}
				</span>

				{lead.montantContracte !== undefined && lead.montantContracte > 0 && (
					<span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-emerald-600">
						<DollarSign size={10} />
						{formatEUR(lead.montantContracte)}
					</span>
				)}
			</div>

			{(lead.dateAppelVente || lead.dateBookingCall) && (
				<div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
					<Calendar size={10} />
					{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
						new Date(lead.dateAppelVente ?? lead.dateBookingCall!),
					)}
				</div>
			)}
		</div>
	);
}

function LeadCardOverlay({ lead }: { lead: Lead }) {
	return (
		<div className="w-72 rounded-lg border border-[#D0003C] bg-white p-3 shadow-lg">
			<p className="truncate text-sm font-medium text-slate-800">{lead.name}</p>
			{lead.email && <p className="truncate text-xs text-slate-400">{lead.email}</p>}
			<div className="mt-2 flex items-center gap-1.5">
				<span
					className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceBadgeClass(lead.source)}`}
				>
					{lead.source}
				</span>
			</div>
		</div>
	);
}
