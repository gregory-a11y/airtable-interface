"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatDateShort, cn } from "@/lib/utils";
import { useState } from "react";
import {
	Search,
	Filter,
	Calendar,
	AlertCircle,
	ChevronDown,
} from "lucide-react";
import { LeadDetailModal } from "./lead-detail-modal";
import type { Id } from "../../../convex/_generated/dataModel";

const ETAPE_SETTING_LABELS: Record<string, { label: string; color: string }> = {
	new_lead: { label: "Nouveau", color: "bg-blue-100 text-blue-700" },
	msg1_sent: { label: "MSG 1", color: "bg-cyan-100 text-cyan-700" },
	msg2_sent: { label: "MSG 2", color: "bg-teal-100 text-teal-700" },
	msg3_sent: { label: "MSG 3", color: "bg-emerald-100 text-emerald-700" },
	qualified: { label: "Qualifie", color: "bg-green-100 text-green-700" },
	booked: { label: "Call booke", color: "bg-violet-100 text-violet-700" },
	no_answer: { label: "Pas de reponse", color: "bg-slate-100 text-slate-600" },
	not_interested: { label: "Pas interesse", color: "bg-red-100 text-red-700" },
	sent_to_crm: { label: "Envoye CRM", color: "bg-amber-100 text-amber-700" },
};

const LEAD_TYPE_LABELS: Record<string, { label: string; color: string }> = {
	prospect: { label: "Prospect", color: "bg-blue-100 text-blue-700" },
	client: { label: "Client", color: "bg-green-100 text-green-700" },
	ancien_client: { label: "Ancien client", color: "bg-slate-100 text-slate-600" },
};

const SOURCE_OPTIONS = [
	{ value: "", label: "Toutes les sources" },
	{ value: "Setting WA", label: "Setting WA" },
	{ value: "VSL ADS", label: "VSL ADS" },
	{ value: "FORMULAIRE ADS", label: "Formulaire ADS" },
];

const STATUS_OPTIONS = [
	{ value: "", label: "Tous les statuts" },
	{ value: "new_lead", label: "Nouveau" },
	{ value: "msg1_sent", label: "MSG 1 envoye" },
	{ value: "msg2_sent", label: "MSG 2 envoye" },
	{ value: "msg3_sent", label: "MSG 3 envoye" },
	{ value: "qualified", label: "Qualifie" },
	{ value: "booked", label: "Call booke" },
	{ value: "no_answer", label: "Pas de reponse" },
	{ value: "not_interested", label: "Pas interesse" },
	{ value: "sent_to_crm", label: "Envoye CRM" },
];

interface Lead {
	_id: Id<"leads">;
	name: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	source: string;
	type: "prospect" | "client" | "ancien_client";
	leadType?: string;
	etapeSetting?: string;
	noteInterne?: string;
	createdAt: number;
}

export function LeadsTable() {
	const [search, setSearch] = useState("");
	const [etapeFilter, setEtapeFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

	const leads = useQuery(api.settingLeads.listSettingLeads, {
		search: search || undefined,
		etapeSetting: etapeFilter || undefined,
		source: sourceFilter || undefined,
		dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
		dateTo: dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : undefined,
	});

	const isUrgent = (lead: Lead) =>
		lead.etapeSetting === "new_lead" &&
		Date.now() - lead.createdAt > 10 * 60 * 1000;

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-[200px]">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Rechercher un lead..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>

				<div className="relative">
					<Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<select
						value={etapeFilter}
						onChange={(e) => setEtapeFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-300 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					>
						{STATUS_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
					<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
				</div>

				<div className="relative">
					<Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<select
						value={sourceFilter}
						onChange={(e) => setSourceFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-300 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					>
						{SOURCE_OPTIONS.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
					<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
				</div>

				<div className="flex items-center gap-2">
					<Calendar size={14} className="text-slate-400" />
					<input
						type="date"
						value={dateFrom}
						onChange={(e) => setDateFrom(e.target.value)}
						className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					/>
					<span className="text-xs text-slate-400">a</span>
					<input
						type="date"
						value={dateTo}
						onChange={(e) => setDateTo(e.target.value)}
						className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Nom
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Email
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Tel
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Type
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Statut Setting
								</th>
								<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
									Date
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{leads === undefined ? (
								<tr>
									<td colSpan={6} className="px-4 py-12 text-center">
										<div className="flex items-center justify-center gap-2">
											<div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D0003C] border-t-transparent" />
											<span className="text-sm text-slate-500">Chargement...</span>
										</div>
									</td>
								</tr>
							) : leads.length === 0 ? (
								<tr>
									<td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
										Aucun lead trouve
									</td>
								</tr>
							) : (
								leads.map((lead) => {
									const urgent = isUrgent(lead as Lead);
									const etape = ETAPE_SETTING_LABELS[lead.etapeSetting || "new_lead"] || ETAPE_SETTING_LABELS.new_lead;
									const typeInfo = LEAD_TYPE_LABELS[lead.type] || LEAD_TYPE_LABELS.prospect;

									return (
										<tr
											key={lead._id}
											onClick={() => setSelectedLead(lead as Lead)}
											className={cn(
												"cursor-pointer transition-colors hover:bg-slate-50",
												urgent && "bg-red-50/50",
											)}
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-slate-800">
														{lead.name}
													</span>
													{urgent && (
														<AlertCircle size={14} className="text-red-500" />
													)}
												</div>
											</td>
											<td className="px-4 py-3 text-sm text-slate-600">
												{lead.email || "—"}
											</td>
											<td className="px-4 py-3 text-sm text-slate-600">
												{lead.phone || "—"}
											</td>
											<td className="px-4 py-3">
												<span
													className={cn(
														"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
														typeInfo.color,
													)}
												>
													{typeInfo.label}
												</span>
											</td>
											<td className="px-4 py-3">
												<span
													className={cn(
														"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
														etape.color,
													)}
												>
													{etape.label}
												</span>
											</td>
											<td className="px-4 py-3 text-sm text-slate-500">
												{formatDateShort(lead.createdAt)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Lead count */}
			{leads && leads.length > 0 && (
				<p className="text-xs text-slate-400">
					{leads.length} lead{leads.length > 1 ? "s" : ""} affiche{leads.length > 1 ? "s" : ""}
				</p>
			)}

			{/* Detail Modal */}
			{selectedLead && (
				<LeadDetailModal
					lead={selectedLead}
					onClose={() => setSelectedLead(null)}
				/>
			)}
		</div>
	);
}
