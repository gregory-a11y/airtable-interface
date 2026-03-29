"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useMemo } from "react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
	BarChart3,
	Phone,
	TrendingUp,
	DollarSign,
	Target,
	Users,
	AlertTriangle,
	ChevronDown,
} from "lucide-react";
import {
	AreaChart,
	Area,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";

const ETAPE_LABELS: Record<string, string> = {
	appel_a_venir: "Appel a venir",
	appel_du_jour: "Appel du jour",
	follow_up: "Follow up",
	no_show: "No show",
	en_attente: "En attente",
	close: "Close",
	perdu: "Perdu",
};

function formatEUR(cents: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

export default function SalesDashboardPage() {
	const [selectedCloser, setSelectedCloser] = useState<string>("");
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
		from: "",
		to: "",
	});

	const team = useQuery(api.users.listTeam);
	const salesTeam = useMemo(
		() => (team ?? []).filter((u) => u.role === "sales" || u.role === "admin"),
		[team],
	);

	const statsArgs = useMemo(() => {
		const args: {
			closerId?: Id<"users">;
			dateFrom?: number;
			dateTo?: number;
		} = {};
		if (selectedCloser) args.closerId = selectedCloser as Id<"users">;
		if (dateRange.from) args.dateFrom = new Date(dateRange.from).getTime();
		if (dateRange.to) args.dateTo = new Date(dateRange.to).setHours(23, 59, 59, 999);
		return args;
	}, [selectedCloser, dateRange]);

	const stats = useQuery(api.leads.getStats, statsArgs);

	if (stats === undefined) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D0003C] border-t-transparent" />
			</div>
		);
	}

	const funnelColors = ["#D0003C", "#E63E6D", "#F07A9E", "#F9B5CC"];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Dashboard Sales</h1>
					<p className="text-sm text-slate-500">
						KPIs en temps reel — {stats.totalLeads} lead{stats.totalLeads > 1 ? "s" : ""} au total
					</p>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative">
						<select
							value={selectedCloser}
							onChange={(e) => setSelectedCloser(e.target.value)}
							className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pr-8 pl-3 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
						>
							<option value="">Tous les closers</option>
							{salesTeam.map((u) => (
								<option key={u._id} value={u._id}>
									{u.name}
								</option>
							))}
						</select>
						<ChevronDown
							size={14}
							className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
						/>
					</div>
					<input
						type="date"
						value={dateRange.from}
						onChange={(e) => setDateRange((r) => ({ ...r, from: e.target.value }))}
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					/>
					<input
						type="date"
						value={dateRange.to}
						onChange={(e) => setDateRange((r) => ({ ...r, to: e.target.value }))}
						className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#D0003C] focus:outline-none focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>
			</div>

			{/* Primary KPI Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiCard
					icon={<Phone size={20} />}
					label="Calls programmes"
					value={String(stats.callsProgrammes)}
					sub={`${stats.callsEffectues} effectues`}
					color="bg-blue-50 text-blue-600"
				/>
				<KpiCard
					icon={<Target size={20} />}
					label="Show Rate"
					value={`${stats.showRate}%`}
					sub={`${stats.callsEffectues} / ${stats.callsProgrammes + stats.callsEffectues}`}
					color="bg-amber-50 text-amber-600"
				/>
				<KpiCard
					icon={<TrendingUp size={20} />}
					label="Close Rate"
					value={`${stats.closeRate}%`}
					sub={`${stats.closeCount} closes`}
					color="bg-emerald-50 text-emerald-600"
				/>
				<KpiCard
					icon={<DollarSign size={20} />}
					label="CA contracte"
					value={formatEUR(stats.caContracte)}
					sub="Total closes"
					color="bg-[#D0003C]/10 text-[#D0003C]"
				/>
			</div>

			{/* Secondary KPI Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<KpiCard
					icon={<BarChart3 size={20} />}
					label="CA / Call"
					value={formatEUR(stats.caParCall)}
					sub="Revenu par call effectue"
					color="bg-violet-50 text-violet-600"
				/>
				<KpiCard
					icon={<DollarSign size={20} />}
					label="Panier moyen"
					value={formatEUR(stats.panierMoyen)}
					sub="Par close"
					color="bg-indigo-50 text-indigo-600"
				/>
			</div>

			{/* Funnel Chart */}
			<div className="rounded-xl border border-slate-200 bg-white p-6">
				<h2 className="mb-4 text-base font-semibold text-slate-900">Entonnoir de conversion</h2>
				<div className="flex items-end justify-center gap-4">
					{stats.funnel.map((step, i) => {
						const maxVal = stats.funnel[0].value || 1;
						const height = Math.max(40, (step.value / maxVal) * 200);
						const convRate =
							i > 0 && stats.funnel[i - 1].value > 0
								? Math.round((step.value / stats.funnel[i - 1].value) * 100)
								: null;

						return (
							<div key={step.name} className="flex flex-col items-center gap-2">
								{convRate !== null && (
									<span className="text-xs font-medium text-slate-500">{convRate}%</span>
								)}
								<div
									className="flex w-20 items-end justify-center rounded-t-lg sm:w-28"
									style={{
										height: `${height}px`,
										backgroundColor: funnelColors[i],
									}}
								>
									<span className="mb-2 text-sm font-bold text-white">{step.value}</span>
								</div>
								<span className="text-center text-xs font-medium text-slate-600">
									{step.name}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Two columns: Top Closers + Loss Reasons */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Top Closers */}
				<div className="rounded-xl border border-slate-200 bg-white p-6">
					<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
						<Users size={18} />
						Top Closers
					</h2>
					{stats.topClosers.length === 0 ? (
						<p className="text-sm text-slate-400">Aucune donnee</p>
					) : (
						<div className="space-y-3">
							{stats.topClosers.map((closer, i) => (
								<div
									key={closer.closerId}
									className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
								>
									<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D0003C] text-xs font-bold text-white">
										{i + 1}
									</span>
									<div className="min-w-0 flex-1">
										<div className="truncate text-sm font-medium text-slate-800">
											{closer.name}
										</div>
										<div className="text-xs text-slate-500">
											{closer.closes} closes / {closer.calls} calls
										</div>
									</div>
									<div className="text-right">
										<div className="text-sm font-semibold text-[#D0003C]">
											{Math.round(closer.closeRate)}%
										</div>
										<div className="text-xs text-slate-500">{formatEUR(closer.ca)}</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Loss Reasons */}
				<div className="rounded-xl border border-slate-200 bg-white p-6">
					<h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
						<AlertTriangle size={18} />
						Raisons de perte
					</h2>
					{stats.raisonsPerte.length === 0 ? (
						<p className="text-sm text-slate-400">Aucune perte enregistree</p>
					) : (
						<div className="space-y-3">
							{stats.raisonsPerte.map((r) => {
								const totalPerdu = stats.raisonsPerte.reduce((s, x) => s + x.count, 0);
								const pct = totalPerdu > 0 ? Math.round((r.count / totalPerdu) * 100) : 0;
								return (
									<div key={r.raison} className="space-y-1">
										<div className="flex items-center justify-between text-sm">
											<span className="text-slate-700">{r.raison}</span>
											<span className="font-medium text-slate-900">
												{r.count} ({pct}%)
											</span>
										</div>
										<div className="h-2 overflow-hidden rounded-full bg-slate-100">
											<div
												className="h-full rounded-full bg-[#D0003C]"
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Revenue Chart */}
			<div className="rounded-xl border border-slate-200 bg-white p-6">
				<h2 className="mb-4 text-base font-semibold text-slate-900">
					Evolution du CA (12 mois)
				</h2>
				{stats.monthlyRevenue.length > 0 ? (
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart data={stats.monthlyRevenue}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
							<YAxis
								tick={{ fontSize: 12 }}
								stroke="#94a3b8"
								tickFormatter={(v) => `${Math.round(v / 100)}€`}
							/>
							<Tooltip
								formatter={(value: number) => formatEUR(value)}
								contentStyle={{
									borderRadius: "8px",
									border: "1px solid #e2e8f0",
									fontSize: "13px",
								}}
							/>
							<Area
								type="monotone"
								dataKey="contracte"
								name="CA contracte"
								stroke="#D0003C"
								fill="#D0003C"
								fillOpacity={0.15}
								strokeWidth={2}
							/>
							<Area
								type="monotone"
								dataKey="collecte"
								name="CA collecte"
								stroke="#10b981"
								fill="#10b981"
								fillOpacity={0.1}
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				) : (
					<p className="py-8 text-center text-sm text-slate-400">Aucune donnee</p>
				)}
			</div>
		</div>
	);
}

function KpiCard({
	icon,
	label,
	value,
	sub,
	color,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub: string;
	color: string;
}) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-5">
			<div className="flex items-center gap-3">
				<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
					{icon}
				</div>
				<div>
					<p className="text-xs font-medium text-slate-500">{label}</p>
					<p className="text-xl font-bold text-slate-900">{value}</p>
					<p className="text-xs text-slate-400">{sub}</p>
				</div>
			</div>
		</div>
	);
}
