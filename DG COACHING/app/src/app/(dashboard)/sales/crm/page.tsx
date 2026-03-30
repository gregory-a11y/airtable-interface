"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	Search,
	ChevronLeft,
	ChevronRight,
	Users,
	Download,
	Loader2,
	UserPlus,
	Filter,
	CalendarDays,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const ETAPE_LABELS: Record<string, { label: string; color: string; border: string }> = {
	appel_a_venir: { label: "Appel a venir", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400", border: "border border-blue-200 dark:border-blue-500/20" },
	appel_du_jour: { label: "Appel du jour", color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400", border: "border border-amber-200 dark:border-amber-500/20" },
	follow_up: { label: "Follow up", color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", border: "border border-violet-200 dark:border-violet-500/20" },
	no_show: { label: "No show", color: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400", border: "border border-orange-200 dark:border-orange-500/20" },
	en_attente: { label: "En attente", color: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400", border: "border border-gray-200 dark:border-gray-500/20" },
	close: { label: "Close", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", border: "border border-emerald-200 dark:border-emerald-500/20" },
	perdu: { label: "Perdu", color: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400", border: "border border-red-200 dark:border-red-500/20" },
};

const SOURCE_COLORS: Record<string, string> = {
	instagram: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-500/20",
	facebook: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	tiktok: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
	google: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20",
	referral: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	organique: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	autre: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
};

const QUAL_COLORS: Record<string, string> = {
	qualifie: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	non_qualifie: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
	pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
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
	const [etapeFilter, setEtapeFilter] = useState("all");
	const [sourceFilter, setSourceFilter] = useState("all");
	const [qualFilter, setQualFilter] = useState("all");
	const [setterFilter, setSetterFilter] = useState("all");
	const [closerFilter, setCloserFilter] = useState("all");
	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [page, setPage] = useState(0);

	const team = useQuery(api.users.listTeam);
	const salesTeam = useMemo(
		() => (team ?? []).filter((u) => u.role === "sales" || u.role === "admin"),
		[team],
	);

	const queryArgs = useMemo(() => ({
		page,
		perPage: 20 as const,
		search: search || undefined,
		etape: etapeFilter !== "all" ? etapeFilter : undefined,
		source: sourceFilter !== "all" ? sourceFilter : undefined,
		qualification: qualFilter !== "all" ? qualFilter : undefined,
		setterId: setterFilter !== "all" ? (setterFilter as Id<"users">) : undefined,
		closerId: closerFilter !== "all" ? (closerFilter as Id<"users">) : undefined,
		dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
		dateTo: dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : undefined,
	}), [search, etapeFilter, sourceFilter, qualFilter, setterFilter, closerFilter, dateFrom, dateTo, page]);

	const result = useQuery(api.leads.list, queryArgs);

	const userMap = useMemo(() => {
		const m: Record<string, string> = {};
		for (const u of team ?? []) {
			m[u._id] = u.name ?? u.email ?? "--";
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
		<div className="mx-auto max-w-7xl space-y-5 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">CRM</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						{result?.total ?? 0} lead{(result?.total ?? 0) > 1 ? "s" : ""} au total
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						onClick={handleExportCSV}
						className="rounded-xl h-10 gap-2"
					>
						<Download size={14} />
						Export CSV
					</Button>
					<Button className="rounded-xl h-10 gap-2">
						<UserPlus size={14} />
						Ajouter un lead
					</Button>
				</div>
			</div>

			{/* Filter Bar */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 sm:max-w-xs">
					<Search
						size={15}
						className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="text"
						placeholder="Nom, email, telephone..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
							setPage(0);
						}}
						className="pl-9 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10"
					/>
				</div>

				<Select value={etapeFilter} onValueChange={(v) => { setEtapeFilter(v); setPage(0); }}>
					<SelectTrigger className="w-[140px] rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10">
						<SelectValue placeholder="Etape" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Etape</SelectItem>
						{Object.entries(ETAPE_LABELS).map(([k, v]) => (
							<SelectItem key={k} value={k}>{v.label}</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={sourceFilter} onValueChange={(v) => { setSourceFilter(v); setPage(0); }}>
					<SelectTrigger className="w-[140px] rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10">
						<SelectValue placeholder="Source" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Source</SelectItem>
						<SelectItem value="instagram">Instagram</SelectItem>
						<SelectItem value="facebook">Facebook</SelectItem>
						<SelectItem value="tiktok">TikTok</SelectItem>
						<SelectItem value="google">Google</SelectItem>
						<SelectItem value="referral">Referral</SelectItem>
						<SelectItem value="organique">Organique</SelectItem>
						<SelectItem value="autre">Autre</SelectItem>
					</SelectContent>
				</Select>

				<Select value={qualFilter} onValueChange={(v) => { setQualFilter(v); setPage(0); }}>
					<SelectTrigger className="w-[155px] rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10">
						<SelectValue placeholder="Qualification" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Qualification</SelectItem>
						<SelectItem value="qualifie">Qualifie</SelectItem>
						<SelectItem value="non_qualifie">Non qualifie</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
					</SelectContent>
				</Select>

				<Select value={setterFilter} onValueChange={(v) => { setSetterFilter(v); setPage(0); }}>
					<SelectTrigger className="w-[130px] rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10">
						<SelectValue placeholder="Setter" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Setter</SelectItem>
						{salesTeam.map((u) => (
							<SelectItem key={u._id} value={u._id}>{u.name ?? u.email ?? "--"}</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select value={closerFilter} onValueChange={(v) => { setCloserFilter(v); setPage(0); }}>
					<SelectTrigger className="w-[130px] rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10">
						<SelectValue placeholder="Closer" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Closer</SelectItem>
						{salesTeam.map((u) => (
							<SelectItem key={u._id} value={u._id}>{u.name ?? u.email ?? "--"}</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="relative">
					<CalendarDays size={14} className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground pointer-events-none" />
					<Input
						type="date"
						value={dateFrom}
						onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
						className="w-[150px] pl-9 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10"
					/>
				</div>
				<div className="relative">
					<CalendarDays size={14} className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground pointer-events-none" />
					<Input
						type="date"
						value={dateTo}
						onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
						className="w-[150px] pl-9 rounded-xl bg-card dark:bg-[#2A2A28] shadow-sm dark:shadow-black/20 border-border/50 dark:border-white/10 h-10"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="card-premium overflow-hidden">
				{result === undefined ? (
					<div className="flex h-48 items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : result.leads.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
							<Users size={28} className="text-muted-foreground/40" />
						</div>
						<p className="text-base font-medium text-foreground">Aucun lead trouve</p>
						<p className="mt-1 text-sm text-muted-foreground">Ajustez vos filtres ou creez un nouveau lead.</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/30 border-b border-border/30 hover:bg-muted/30">
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tel</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Type</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qualif.</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Etape</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Setter</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Closer</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
									<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Montant</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{result.leads.map((lead) => (
									<TableRow
										key={lead._id}
										onClick={() => router.push(`/sales/crm/${lead._id}`)}
										className="table-row-hover cursor-pointer border-b border-border/30"
									>
										<TableCell className="py-3 px-4">
											<span className="font-medium text-foreground hover:text-primary transition-colors">
												{lead.name}
											</span>
										</TableCell>
										<TableCell className="py-3 px-4 text-sm text-muted-foreground">{lead.email ?? "--"}</TableCell>
										<TableCell className="py-3 px-4 text-sm text-muted-foreground">{lead.phone ?? "--"}</TableCell>
										<TableCell className="py-3 px-4">
											<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${SOURCE_COLORS[lead.source.toLowerCase()] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"}`}>
												{lead.source}
											</span>
										</TableCell>
										<TableCell className="py-3 px-4 text-sm text-muted-foreground">
											{TYPE_LABELS[lead.type] ?? lead.type}
										</TableCell>
										<TableCell className="py-3 px-4">
											<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${QUAL_COLORS[lead.qualification] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"}`}>
												{lead.qualification}
											</span>
										</TableCell>
										<TableCell className="py-3 px-4">
											<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ETAPE_LABELS[lead.etapeClosing]?.color ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400"} ${ETAPE_LABELS[lead.etapeClosing]?.border ?? "border border-gray-200 dark:border-gray-500/20"}`}>
												{ETAPE_LABELS[lead.etapeClosing]?.label ?? lead.etapeClosing}
											</span>
										</TableCell>
										<TableCell className="py-3 px-4 text-sm text-muted-foreground">
											{lead.setterId ? (userMap[lead.setterId] ?? "--") : "--"}
										</TableCell>
										<TableCell className="py-3 px-4 text-sm text-muted-foreground">
											{lead.closerId ? (userMap[lead.closerId] ?? "--") : "--"}
										</TableCell>
										<TableCell className="py-3 px-4 text-xs text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
										<TableCell className="py-3 px-4 text-right">
											{lead.montantContracte ? (
												<span className="font-semibold text-primary">{formatEUR(lead.montantContracte)}</span>
											) : (
												<span className="text-muted-foreground">--</span>
											)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				{/* Pagination */}
				{result && result.total > (result.perPage || 20) && (
					<div className="flex items-center justify-between border-t border-border/30 px-5 py-3">
						<p className="text-sm text-muted-foreground">
							Page {page + 1} sur {totalPages} -- {result.total} resultats
						</p>
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.max(0, p - 1))}
								disabled={page === 0}
								className="rounded-lg h-8 gap-1"
							>
								<ChevronLeft size={14} />
								Precedent
							</Button>
							{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
								let pageNum: number;
								if (totalPages <= 5) {
									pageNum = i;
								} else if (page < 3) {
									pageNum = i;
								} else if (page > totalPages - 4) {
									pageNum = totalPages - 5 + i;
								} else {
									pageNum = page - 2 + i;
								}
								return (
									<Button
										key={pageNum}
										variant={page === pageNum ? "default" : "outline"}
										size="sm"
										onClick={() => setPage(pageNum)}
										className="rounded-lg h-8 w-8 p-0"
									>
										{pageNum + 1}
									</Button>
								);
							})}
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
								disabled={page >= totalPages - 1}
								className="rounded-lg h-8 gap-1"
							>
								Suivant
								<ChevronRight size={14} />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
