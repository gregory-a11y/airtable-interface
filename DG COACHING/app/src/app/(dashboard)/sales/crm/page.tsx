"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Users,
	Download,
	Plus,
} from "lucide-react";

const ETAPE_LABELS: Record<string, { label: string; color: string }> = {
	appel_a_venir: { label: "Appel a venir", color: "bg-blue-100 text-blue-700" },
	appel_du_jour: { label: "Appel du jour", color: "bg-amber-100 text-amber-700" },
	follow_up: { label: "Follow up", color: "bg-violet-100 text-violet-700" },
	no_show: { label: "No show", color: "bg-orange-100 text-orange-700" },
	en_attente: { label: "En attente", color: "bg-slate-100 text-slate-700" },
	close: { label: "Close", color: "bg-emerald-100 text-emerald-700" },
	perdu: { label: "Perdu", color: "bg-red-100 text-red-700" },
};

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-100 text-pink-700",
	facebook: "bg-blue-100 text-blue-700",
	tiktok: "bg-slate-100 text-slate-700",
	google: "bg-green-100 text-green-700",
	referral: "bg-amber-100 text-amber-700",
	organique: "bg-emerald-100 text-emerald-700",
	autre: "bg-gray-100 text-gray-600",
};

const QUAL_COLORS: Record<string, string> = {
	qualifie: "bg-emerald-100 text-emerald-700",
	non_qualifie: "bg-red-100 text-red-700",
	pending: "bg-amber-100 text-amber-700",
};

const TYPE_LABELS: Record<string, string> = {
	prospect: "Prospect",
	client: "Client",
	ancien_client: "Ancien client",
};

function formatEUR(cents: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

function formatDate(ts: number): string {
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "short",
		year: "2-digit",
	}).format(new Date(ts));
}

export default function CrmListPage() {
	const router = useRouter();
	const [search, setSearch] = useState("");
	const [etapeFilter, setEtapeFilter] = useState("");
	const [sourceFilter, setSourceFilter] = useState("");
	const [qualFilter, setQualFilter] = useState("");
	const [setterFilter, setSetterFilter] = useState("");
	const [closerFilter, setCloserFilter] = useState("");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [page, setPage] = useState(0);

	const team = useQuery(api.users.listTeam);
	const salesTeam = useMemo(
		() => (team ?? []).filter((u) => u.role === "sales" || u.role === "admin"),
		[team],
	);

	const queryArgs = useMemo(() => {
		const args: Record<string, unknown> = { page, perPage: 20 };
		if (search) args.search = search;
		if (etapeFilter) args.etape = etapeFilter;
		if (sourceFilter) args.source = sourceFilter;
		if (qualFilter) args.qualification = qualFilter;
		if (setterFilter) args.setterId = setterFilter;
		if (closerFilter) args.closerId = closerFilter;
		if (dateFrom) args.dateFrom = new Date(dateFrom).getTime();
		if (dateTo) args.dateTo = new Date(dateTo).setHours(23, 59, 59, 999);
		return args;
	}, [search, etapeFilter, sourceFilter, qualFilter, setterFilter, closerFilter, dateFrom, dateTo, page]);

	const result = useQuery(api.leads.list, queryArgs as any);

	const userMap = useMemo(() => {
		const m: Record<string, string> = {};
		for (const u of team ?? []) {
			m[u._id] = u.name ?? u.email ?? "—";
		}
		return m;
	}, [team]);

	const handleExportCSV = () => {
		if (!result?.leads) return;
		const headers = [
			"Nom",
			"Email",
			"Telephone",
			"Source",
			"Type",
			"Qualification",
			"Etape",
			"Setter",
			"Closer",
			"Montant",
			"Date creation",
		];
		const rows = result.leads.map((l) => [
			l.name,
			l.email ?? "",
			l.phone ?? "",
			l.source,
			l.type,
			l.qualification,
			l.etapeClosing,
			l.setterId ? (userMap[l.setterId] ?? "") : "",
			l.closerId ? (userMap[l.closerId] ?? "") : "",
			l.montantContracte ? String(l.montantContracte / 100) : "",
			formatDate(l.createdAt),
		]);

		const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `crm_export_${new Date().toISOString().slice(0, 10)}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const totalPages = result ? Math.ceil(result.total / (result.perPage || 20)) : 0;

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">CRM</h1>
					<p className="text-sm text-slate-500">
						{result?.total ?? 0} lead{(result?.total ?? 0) > 1 ? "s" : ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={handleExportCSV}
						className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
					>
						<Download size={14} />
						Export CSV
					</button>
				</div>
			</div>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
				<div className="relative flex-1 sm:max-w-xs">
					<Search
						size={16}
						className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
					/>
					<input
						type="text"
						placeholder="Nom, email, telephone..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(0);
						}}
						className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-sm focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>

				<FilterSelect
					value={etapeFilter}
					onChange={(v) => {
						setEtapeFilter(v);
						setPage(0);
					}}
					placeholder="Etape"
					options={Object.entries(ETAPE_LABELS).map(([k, v]) => ({ value: k, label: v.label }))}
				/>

				<FilterSelect
					value={sourceFilter}
					onChange={(v) => {
						setSourceFilter(v);
						setPage(0);
					}}
					placeholder="Source"
					options={[
						{ value: "instagram", label: "Instagram" },
						{ value: "facebook", label: "Facebook" },
						{ value: "tiktok", label: "TikTok" },
						{ value: "google", label: "Google" },
						{ value: "referral", label: "Referral" },
						{ value: "organique", label: "Organique" },
						{ value: "autre", label: "Autre" },
					]}
				/>

				<FilterSelect
					value={qualFilter}
					onChange={(v) => {
						setQualFilter(v);
						setPage(0);
					}}
					placeholder="Qualification"
					options={[
						{ value: "qualifie", label: "Qualifie" },
						{ value: "non_qualifie", label: "Non qualifie" },
						{ value: "pending", label: "Pending" },
					]}
				/>

				<FilterSelect
					value={setterFilter}
					onChange={(v) => {
						setSetterFilter(v);
						setPage(0);
					}}
					placeholder="Setter"
					options={salesTeam.map((u) => ({ value: u._id, label: u.name ?? u.email ?? "—" }))}
				/>

				<FilterSelect
					value={closerFilter}
					onChange={(v) => {
						setCloserFilter(v);
						setPage(0);
					}}
					placeholder="Closer"
					options={salesTeam.map((u) => ({ value: u._id, label: u.name ?? u.email ?? "—" }))}
				/>

				<input
					type="date"
					value={dateFrom}
					onChange={(e) => {
						setDateFrom(e.target.value);
						setPage(0);
					}}
					className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
				/>
				<input
					type="date"
					value={dateTo}
					onChange={(e) => {
						setDateTo(e.target.value);
						setPage(0);
					}}
					className="rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
				/>
			</div>

			{/* Table */}
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
				{result === undefined ? (
					<div className="flex h-48 items-center justify-center">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D0003C] border-t-transparent" />
					</div>
				) : result.leads.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-16">
						<Users size={48} className="mb-3 text-slate-300" />
						<p className="text-base font-medium text-slate-500">Aucun lead</p>
						<p className="text-sm text-slate-400">Ajustez vos filtres ou creez un nouveau lead.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead>
								<tr className="border-b border-slate-100 bg-slate-50">
									<th className="px-4 py-3 font-medium text-slate-600">Contact</th>
									<th className="px-4 py-3 font-medium text-slate-600">Email</th>
									<th className="px-4 py-3 font-medium text-slate-600">Tel</th>
									<th className="px-4 py-3 font-medium text-slate-600">Source</th>
									<th className="px-4 py-3 font-medium text-slate-600">Type</th>
									<th className="px-4 py-3 font-medium text-slate-600">Qualif.</th>
									<th className="px-4 py-3 font-medium text-slate-600">Etape</th>
									<th className="px-4 py-3 font-medium text-slate-600">Setter</th>
									<th className="px-4 py-3 font-medium text-slate-600">Closer</th>
									<th className="px-4 py-3 font-medium text-slate-600">Date</th>
									<th className="px-4 py-3 text-right font-medium text-slate-600">Montant</th>
								</tr>
							</thead>
							<tbody>
								{result.leads.map((lead) => (
									<tr
										key={lead._id}
										onClick={() => router.push(`/sales/crm/${lead._id}`)}
										className="cursor-pointer border-b border-slate-50 transition-colors hover:bg-slate-50"
									>
										<td className="px-4 py-3 font-medium text-slate-800">{lead.name}</td>
										<td className="px-4 py-3 text-slate-500">{lead.email ?? "—"}</td>
										<td className="px-4 py-3 text-slate-500">{lead.phone ?? "—"}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${SOURCE_COLORS[lead.source.toLowerCase()] ?? "bg-gray-100 text-gray-600"}`}
											>
												{lead.source}
											</span>
										</td>
										<td className="px-4 py-3 text-slate-500">
											{TYPE_LABELS[lead.type] ?? lead.type}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${QUAL_COLORS[lead.qualification] ?? "bg-gray-100 text-gray-600"}`}
											>
												{lead.qualification}
											</span>
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${ETAPE_LABELS[lead.etapeClosing]?.color ?? "bg-gray-100 text-gray-600"}`}
											>
												{ETAPE_LABELS[lead.etapeClosing]?.label ?? lead.etapeClosing}
											</span>
										</td>
										<td className="px-4 py-3 text-slate-500">
											{lead.setterId ? (userMap[lead.setterId] ?? "—") : "—"}
										</td>
										<td className="px-4 py-3 text-slate-500">
											{lead.closerId ? (userMap[lead.closerId] ?? "—") : "—"}
										</td>
										<td className="px-4 py-3 text-slate-500">{formatDate(lead.createdAt)}</td>
										<td className="px-4 py-3 text-right font-medium text-slate-800">
											{lead.montantContracte ? formatEUR(lead.montantContracte) : "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{/* Pagination */}
				{result && result.total > (result.perPage || 20) && (
					<div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
						<p className="text-sm text-slate-500">
							Page {page + 1} sur {totalPages} — {result.total} resultats
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
							>
								<ChevronLeft size={14} />
								Precedent
							</button>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page >= totalPages - 1}
								className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
							>
								Suivant
								<ChevronRight size={14} />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

function FilterSelect({
	value,
	onChange,
	placeholder,
	options,
}: {
	value: string;
	onChange: (v: string) => void;
	placeholder: string;
	options: { value: string; label: string }[];
}) {
	return (
		<div className="relative">
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-7 pl-2.5 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
			>
				<option value="">{placeholder}</option>
				{options.map((o) => (
					<option key={o.value} value={o.value}>
						{o.label}
					</option>
				))}
			</select>
			<ChevronDown
				size={14}
				className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400"
			/>
		</div>
	);
}
