"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useMemo } from "react";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
	Phone,
	TrendingUp,
	DollarSign,
	Target,
	AlertTriangle,
	Loader2,
	BarChart3,
	ArrowRight,
	Trophy,
	PhoneCall,
	CheckCircle2,
	Calendar,
	Zap,
} from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

function formatEUR(cents: number): string {
	return new Intl.NumberFormat("fr-FR", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	}).format(cents / 100);
}

/* ================================================================
   Custom Tooltip for Recharts
   ================================================================ */

function ChartTooltip({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{ name: string; value: number; color: string }>;
	label?: string;
}) {
	if (!active || !payload || payload.length === 0) return null;
	return (
		<div className="rounded-2xl bg-card border border-border/50 shadow-2xl p-4 min-w-[180px]">
			<p className="text-[11px] font-medium text-muted-foreground mb-2.5 uppercase tracking-wider">
				{label}
			</p>
			<div className="space-y-1.5">
				{payload.map((entry) => (
					<div
						key={entry.name}
						className="flex items-center justify-between gap-4"
					>
						<div className="flex items-center gap-2">
							<span
								className="h-2.5 w-2.5 rounded-full shrink-0"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-xs text-muted-foreground">
								{entry.name}
							</span>
						</div>
						<span className="text-sm font-semibold text-foreground tabular-nums">
							{formatEUR(entry.value)}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/* ================================================================
   Page
   ================================================================ */

export default function SalesDashboardPage() {
	const [selectedCloser, setSelectedCloser] = useState<string>("all");
	const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
		from: "",
		to: "",
	});

	const team = useQuery(api.users.listTeam);
	const salesTeam = useMemo(
		() =>
			(team ?? []).filter((u) => u.role === "sales" || u.role === "admin"),
		[team],
	);

	const statsArgs = useMemo(() => {
		const args: {
			closerId?: Id<"users">;
			dateFrom?: number;
			dateTo?: number;
		} = {};
		if (selectedCloser && selectedCloser !== "all")
			args.closerId = selectedCloser as Id<"users">;
		if (dateRange.from)
			args.dateFrom = new Date(dateRange.from).getTime();
		if (dateRange.to)
			args.dateTo = new Date(dateRange.to).setHours(23, 59, 59, 999);
		return args;
	}, [selectedCloser, dateRange]);

	const stats = useQuery(api.leads.getStats, statsArgs);

	if (stats === undefined) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const funnelConversions = stats.funnel.map((step, i) => {
		if (i === 0) return null;
		const prev = stats.funnel[i - 1].value;
		return prev > 0 ? Math.round((step.value / prev) * 100) : 0;
	});

	const globalConversion =
		stats.funnel.length >= 2 && stats.funnel[0].value > 0
			? Math.round(
					(stats.funnel[stats.funnel.length - 1].value /
						stats.funnel[0].value) *
						100,
				)
			: 0;

	const disqualifiedRate =
		stats.funnel.length >= 2 && stats.funnel[0].value > 0
			? Math.round(
					((stats.funnel[0].value -
						stats.funnel[stats.funnel.length - 1].value) /
						stats.funnel[0].value) *
						100,
				)
			: 0;

	const funnelIcons = [
		<Calendar key="f0" size={18} />,
		<PhoneCall key="f1" size={18} />,
		<CheckCircle2 key="f2" size={18} />,
		<Trophy key="f3" size={18} />,
	];

	const funnelLabels = [
		"Appels Planifies",
		"Appels Realises",
		"Appels Qualifies",
		"Closings",
	];

	const funnelSubs = ["Total", "Presents", "Opportunites", "Clients"];

	const funnelColors = [
		"text-blue-500 bg-blue-500/10 ring-blue-500/15",
		"text-amber-500 bg-amber-500/10 ring-amber-500/15",
		"text-emerald-500 bg-emerald-500/10 ring-emerald-500/15",
		"text-primary bg-primary/10 ring-primary/15",
	];

	const sortedRaisons = [...stats.raisonsPerte].sort(
		(a, b) => b.count - a.count,
	);

	return (
		<div className="space-y-8 animate-page-enter">
			{/* ── Header ─────────────────────────────────────────── */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Dashboard Sales
					</h1>
					<div className="flex items-center gap-2.5 mt-2">
						<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<span className="relative flex h-2 w-2">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
								<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
							</span>
							Temps reel
						</span>
						<span className="text-sm text-muted-foreground">
							<span className="font-semibold text-foreground tabular-nums">
								{stats.totalLeads}
							</span>{" "}
							lead{stats.totalLeads > 1 ? "s" : ""} au total
						</span>
					</div>
				</div>

				<div className="card-premium flex items-center gap-3 p-3">
					<Select
						value={selectedCloser}
						onValueChange={setSelectedCloser}
					>
						<SelectTrigger className="w-[180px] h-10 rounded-xl bg-card dark:bg-[#1A1A19] shadow-sm border-border/50">
							<SelectValue placeholder="Tous les closers" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tous les closers</SelectItem>
							{salesTeam.map((u) => (
								<SelectItem key={u._id} value={u._id}>
									{u.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="relative">
						<Calendar
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						/>
						<Input
							type="date"
							value={dateRange.from}
							onChange={(e) =>
								setDateRange((r) => ({
									...r,
									from: e.target.value,
								}))
							}
							className="w-[150px] h-10 pl-9 rounded-xl bg-card dark:bg-[#1A1A19] shadow-sm border-border/50"
						/>
					</div>
					<div className="relative">
						<Calendar
							size={14}
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						/>
						<Input
							type="date"
							value={dateRange.to}
							onChange={(e) =>
								setDateRange((r) => ({
									...r,
									to: e.target.value,
								}))
							}
							className="w-[150px] h-10 pl-9 rounded-xl bg-card dark:bg-[#1A1A19] shadow-sm border-border/50"
						/>
					</div>
				</div>
			</div>

			{/* ── Primary KPI Cards ─────────────────────────────── */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<PremiumKpiCard
					icon={<Phone size={22} />}
					label="Calls programmes"
					value={String(stats.callsProgrammes)}
					sub={`${stats.callsEffectues} effectues`}
					variant="blue"
					delay={0}
				/>
				<PremiumKpiCard
					icon={<Target size={22} />}
					label="Show Rate"
					value={`${stats.showRate}%`}
					sub={`${stats.callsEffectues} / ${stats.callsProgrammes + stats.callsEffectues}`}
					variant="amber"
					delay={1}
				/>
				<PremiumKpiCard
					icon={<TrendingUp size={22} />}
					label="Close Rate"
					value={`${stats.closeRate}%`}
					sub={`${stats.closeCount} closes`}
					variant="emerald"
					delay={2}
				/>
				<PremiumKpiCard
					icon={<DollarSign size={22} />}
					label="CA contracte"
					value={formatEUR(stats.caContracte)}
					sub="Total closes"
					variant="primary"
					delay={3}
				/>
			</div>

			{/* ── Secondary KPI Cards ──────────────────────────── */}
			<div
				className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-fade-in"
				style={{ animationDelay: "200ms" }}
			>
				<PremiumKpiCard
					icon={<BarChart3 size={22} />}
					label="CA / Call"
					value={formatEUR(stats.caParCall)}
					sub="Revenu par call effectue"
					variant="violet"
					delay={4}
				/>
				<PremiumKpiCard
					icon={<Zap size={22} />}
					label="Panier moyen"
					value={formatEUR(stats.panierMoyen)}
					sub="Par close"
					variant="indigo"
					delay={5}
				/>
			</div>

			{/* ── Funnel — Premium Flow Visualization ─────────── */}
			<div
				className="card-premium p-6 animate-fade-in dot-pattern"
				style={{ animationDelay: "300ms" }}
			>
				<div className="flex items-center justify-between mb-8">
					<h2 className="text-lg font-semibold text-foreground tracking-tight">
						Pipeline de Vente
					</h2>
					<div className="flex items-center gap-6 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<span className="inline-block h-2.5 w-2.5 rounded-full bg-primary/70" />
							Conversion globale :{" "}
							<span className="font-semibold text-foreground tabular-nums">
								{globalConversion}%
							</span>
						</span>
						<span className="flex items-center gap-1.5">
							<span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
							Leads disqualifies :{" "}
							<span className="font-semibold text-foreground tabular-nums">
								{disqualifiedRate}%
							</span>
						</span>
					</div>
				</div>

				{/* Flow Stages */}
				<div className="flex items-center gap-0 mb-8">
					{stats.funnel.map((step, i) => (
						<div
							key={step.name}
							className="flex items-center flex-1 min-w-0"
						>
							{/* Stage Card */}
							<div
								className={`
									relative flex-1 bg-card dark:bg-[#1A1A19] rounded-2xl p-5
									border border-border/50
									${i === 0 ? "border-l-4 border-l-primary" : ""}
									animate-fade-in
								`}
								style={{
									animationDelay: `${400 + i * 100}ms`,
								}}
							>
								<div className="flex items-center gap-2 mb-3">
									<div
										className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${funnelColors[i]}`}
									>
										{funnelIcons[i] ?? (
											<Target size={18} />
										)}
									</div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
										{funnelLabels[i] ?? step.name}
									</span>
								</div>
								<p
									className="text-3xl font-bold text-foreground tracking-tight tabular-nums animate-number"
									style={{
										animationDelay: `${500 + i * 100}ms`,
									}}
								>
									{step.value}
								</p>
								<p className="text-xs text-muted-foreground mt-1.5">
									{funnelSubs[i] ?? ""}
								</p>
							</div>

							{/* Connector Arrow */}
							{i < stats.funnel.length - 1 && (
								<div
									className="flex flex-col items-center gap-1 px-2 shrink-0 animate-scale-in"
									style={{
										animationDelay: `${600 + i * 120}ms`,
									}}
								>
									<span className="bg-primary/10 dark:bg-primary/15 text-primary text-xs font-semibold rounded-full px-3 py-1 tabular-nums whitespace-nowrap">
										{funnelConversions[i + 1] ?? 0}%
									</span>
									<div className="flex items-center gap-0.5 text-muted-foreground/40">
										<div className="w-4 h-px border-t border-dashed border-muted-foreground/30" />
										<ArrowRight
											size={12}
											className="text-muted-foreground/40"
										/>
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				{/* SVG Funnel Shape */}
				<div className="relative">
					<svg
						viewBox="0 0 800 180"
						className="w-full animate-funnel-glow"
						preserveAspectRatio="none"
					>
						<defs>
							<linearGradient
								id="funnelGradMain"
								x1="0"
								y1="0"
								x2="1"
								y2="0"
							>
								<stop
									offset="0%"
									stopColor="rgba(208,0,60,0.20)"
								/>
								<stop
									offset="50%"
									stopColor="rgba(208,0,60,0.10)"
								/>
								<stop
									offset="100%"
									stopColor="rgba(208,0,60,0.04)"
								/>
							</linearGradient>
							<linearGradient
								id="funnelGradHighlight"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="rgba(255,255,255,0.06)"
								/>
								<stop
									offset="40%"
									stopColor="rgba(255,255,255,0.02)"
								/>
								<stop
									offset="100%"
									stopColor="rgba(255,255,255,0)"
								/>
							</linearGradient>
							<linearGradient
								id="funnelGradShadow"
								x1="0"
								y1="0"
								x2="0"
								y2="1"
							>
								<stop
									offset="0%"
									stopColor="rgba(0,0,0,0)"
								/>
								<stop
									offset="60%"
									stopColor="rgba(0,0,0,0.02)"
								/>
								<stop
									offset="100%"
									stopColor="rgba(0,0,0,0.06)"
								/>
							</linearGradient>
							<linearGradient
								id="funnelStrokeGrad"
								x1="0"
								y1="0"
								x2="1"
								y2="0"
							>
								<stop
									offset="0%"
									stopColor="rgba(208,0,60,0.30)"
								/>
								<stop
									offset="100%"
									stopColor="rgba(208,0,60,0.08)"
								/>
							</linearGradient>
						</defs>

						{/* Main fill */}
						<path
							d="M10,8 Q0,8 0,18 L0,162 Q0,172 10,172 L790,150 Q800,149 800,139 L800,41 Q800,31 790,30 Z"
							fill="url(#funnelGradMain)"
						/>
						{/* Highlight glass layer */}
						<path
							d="M10,8 Q0,8 0,18 L0,90 L800,80 L800,41 Q800,31 790,30 Z"
							fill="url(#funnelGradHighlight)"
						/>
						{/* Shadow depth layer */}
						<path
							d="M0,90 L0,162 Q0,172 10,172 L790,150 Q800,149 800,139 L800,80 Z"
							fill="url(#funnelGradShadow)"
						/>
						{/* Stroke outline */}
						<path
							d="M10,8 Q0,8 0,18 L0,162 Q0,172 10,172 L790,150 Q800,149 800,139 L800,41 Q800,31 790,30 Z"
							fill="none"
							stroke="url(#funnelStrokeGrad)"
							strokeWidth="1.5"
							className="animate-funnel-draw"
						/>

						{/* Vertical grid lines at stage boundaries */}
						{[200, 400, 600].map((x) => (
							<line
								key={x}
								x1={x}
								y1="18"
								x2={x}
								y2="162"
								stroke="currentColor"
								className="text-border"
								strokeOpacity="0.3"
								strokeWidth="1"
								strokeDasharray="4 6"
							/>
						))}
					</svg>
				</div>
			</div>

			{/* ── Revenue Chart ─────────────────────────────────── */}
			<div
				className="card-premium p-6 animate-fade-in"
				style={{ animationDelay: "400ms" }}
			>
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 ring-1 ring-emerald-500/15">
							<TrendingUp
								size={17}
								className="text-emerald-500 dark:text-emerald-400"
							/>
						</div>
						<h3 className="text-base font-semibold text-foreground tracking-tight">
							Evolution du CA (12 mois)
						</h3>
					</div>

					{/* Legend */}
					<div className="flex items-center gap-5">
						<div className="flex items-center gap-2">
							<span className="h-2.5 w-2.5 rounded-full bg-primary" />
							<span className="text-xs text-muted-foreground">
								CA contracte
							</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
							<span className="text-xs text-muted-foreground">
								CA collecte
							</span>
						</div>
					</div>
				</div>

				{stats.monthlyRevenue.length > 0 ? (
					<div
						className="animate-fade-in"
						style={{ animationDelay: "500ms" }}
					>
						<ResponsiveContainer width="100%" height={350}>
							<AreaChart
								data={stats.monthlyRevenue}
								margin={{
									top: 8,
									right: 8,
									left: -10,
									bottom: 0,
								}}
							>
								<defs>
									<linearGradient
										id="gradCA2"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#D0003C"
											stopOpacity={0.2}
										/>
										<stop
											offset="100%"
											stopColor="#D0003C"
											stopOpacity={0.02}
										/>
									</linearGradient>
									<linearGradient
										id="gradCollecte2"
										x1="0"
										y1="0"
										x2="0"
										y2="1"
									>
										<stop
											offset="0%"
											stopColor="#10b981"
											stopOpacity={0.15}
										/>
										<stop
											offset="100%"
											stopColor="#10b981"
											stopOpacity={0.02}
										/>
									</linearGradient>
								</defs>
								<CartesianGrid
									strokeDasharray="4 4"
									stroke="var(--color-border)"
									vertical={false}
								/>
								<XAxis
									dataKey="month"
									axisLine={false}
									tickLine={false}
									tick={{
										fontSize: 11,
										fill: "var(--color-muted-foreground)",
									}}
									dy={8}
								/>
								<YAxis hide />
								<Tooltip
									content={<ChartTooltip />}
									cursor={{
										stroke: "rgba(208,0,60,0.12)",
										strokeWidth: 1,
									}}
								/>
								<Area
									type="monotone"
									dataKey="contracte"
									name="CA contracte"
									stroke="#D0003C"
									fill="url(#gradCA2)"
									strokeWidth={2.5}
									dot={false}
									activeDot={{
										r: 5,
										fill: "#D0003C",
										stroke: "var(--color-card)",
										strokeWidth: 2.5,
									}}
								/>
								<Area
									type="monotone"
									dataKey="collecte"
									name="CA collecte"
									stroke="#10b981"
									fill="url(#gradCollecte2)"
									strokeWidth={2}
									dot={false}
									activeDot={{
										r: 4,
										fill: "#10b981",
										stroke: "var(--color-card)",
										strokeWidth: 2,
									}}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="bg-muted/20 dark:bg-muted/10 rounded-xl h-[350px] flex flex-col items-center justify-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 dark:bg-muted/20">
							<BarChart3
								size={22}
								className="text-muted-foreground/50"
							/>
						</div>
						<div className="text-center">
							<p className="text-sm font-medium text-muted-foreground">
								Aucune donnee de revenus
							</p>
							<p className="text-xs text-muted-foreground/70 mt-1">
								Les donnees apparaitront avec les premiers
								closes
							</p>
						</div>
					</div>
				)}
			</div>

			{/* ── Top Closers + Loss Reasons ───────────────────── */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* Top Closers — Leaderboard */}
				<div
					className="card-premium p-6 animate-fade-in"
					style={{ animationDelay: "500ms" }}
				>
					<div className="flex items-center gap-2.5 mb-6">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-500/15 ring-1 ring-amber-500/15">
							<Trophy
								size={17}
								className="text-amber-500 dark:text-amber-400"
							/>
						</div>
						<h3 className="text-base font-semibold text-foreground tracking-tight">
							Classement Closers
						</h3>
					</div>

					{stats.topClosers.length === 0 ? (
						<div className="bg-muted/20 dark:bg-muted/10 rounded-xl h-[200px] flex flex-col items-center justify-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 dark:bg-muted/20">
								<Trophy
									size={22}
									className="text-muted-foreground/50"
								/>
							</div>
							<p className="text-sm text-muted-foreground">
								Aucun closer pour la periode
							</p>
						</div>
					) : (
						<div className="space-y-2.5">
							{stats.topClosers.map((closer, i) => {
								const maxCa = Math.max(
									...stats.topClosers.map((c) => c.ca),
									1,
								);
								const barPct = Math.round(
									(closer.ca / maxCa) * 100,
								);

								const rankStyles: Record<number, string> = {
									0: "bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20",
									1: "bg-gray-100 dark:bg-gray-500/5 border border-gray-300/20 dark:border-gray-500/15",
									2: "bg-amber-600/10 dark:bg-amber-600/5 border border-amber-600/20",
								};

								const rankBadgeStyles: Record<number, string> =
									{
										0: "bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950 shadow-sm shadow-amber-400/30",
										1: "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-sm shadow-gray-300/30",
										2: "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-100 shadow-sm shadow-amber-600/30",
									};

								const rowClass =
									i < 3
										? rankStyles[i]
										: "bg-muted/30 dark:bg-muted/15 border border-transparent";

								const badgeClass =
									i < 3
										? rankBadgeStyles[i]
										: "bg-muted dark:bg-muted/50 text-muted-foreground";

								return (
									<div
										key={closer.closerId}
										className={`rounded-xl p-4 flex items-center gap-4 animate-slide-in ${rowClass}`}
										style={{
											animationDelay: `${600 + i * 80}ms`,
										}}
									>
										<span
											className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeClass}`}
										>
											{i + 1}
										</span>

										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-foreground">
												{closer.name}
											</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												{closer.closes} closes /{" "}
												{closer.calls} calls
											</p>
											{/* Progress bar */}
											<div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted/50 dark:bg-muted/30">
												<div
													className="h-full rounded-full transition-all duration-700 ease-out"
													style={{
														width: `${barPct}%`,
														background:
															i === 0
																? "linear-gradient(90deg, #f59e0b, #d97706)"
																: i === 1
																	? "linear-gradient(90deg, #9ca3af, #6b7280)"
																	: i === 2
																		? "linear-gradient(90deg, #d97706, #92400e)"
																		: "linear-gradient(90deg, #D0003C, #E84B5E)",
													}}
												/>
											</div>
										</div>

										<div className="text-right shrink-0">
											<span className="inline-flex items-center rounded-lg bg-primary/10 dark:bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
												{Math.round(closer.closeRate)}%
											</span>
											<p className="text-xs font-medium text-muted-foreground mt-1.5 tabular-nums">
												{formatEUR(closer.ca)}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				{/* Loss Reasons */}
				<div
					className="card-premium p-6 animate-fade-in"
					style={{ animationDelay: "550ms" }}
				>
					<div className="flex items-center gap-2.5 mb-6">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 dark:bg-red-500/15 ring-1 ring-red-500/15">
							<AlertTriangle
								size={17}
								className="text-red-500 dark:text-red-400"
							/>
						</div>
						<h3 className="text-base font-semibold text-foreground tracking-tight">
							Raisons de perte
						</h3>
					</div>

					{sortedRaisons.length === 0 ? (
						<div className="bg-muted/20 dark:bg-muted/10 rounded-xl h-[200px] flex flex-col items-center justify-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/40 dark:bg-muted/20">
								<AlertTriangle
									size={22}
									className="text-muted-foreground/50"
								/>
							</div>
							<p className="text-sm text-muted-foreground">
								Aucune perte enregistree
							</p>
						</div>
					) : (
						<div className="space-y-5">
							{sortedRaisons.map((r, i) => {
								const totalPerdu = sortedRaisons.reduce(
									(s, x) => s + x.count,
									0,
								);
								const pct =
									totalPerdu > 0
										? Math.round(
												(r.count / totalPerdu) * 100,
											)
										: 0;
								return (
									<div
										key={r.raison}
										className="space-y-2 animate-fade-in"
										style={{
											animationDelay: `${650 + i * 60}ms`,
										}}
									>
										<div className="flex items-center justify-between text-sm">
											<span className="text-foreground font-medium">
												{r.raison}
											</span>
											<div className="flex items-center gap-2">
												<span className="text-xs text-muted-foreground tabular-nums">
													{r.count}
												</span>
												<span className="text-sm font-semibold text-foreground tabular-nums">
													{pct}%
												</span>
											</div>
										</div>
										<div className="h-2 overflow-hidden rounded-full bg-muted/50 dark:bg-muted/30">
											<div
												className="h-full rounded-full transition-all duration-700 ease-out"
												style={{
													width: `${pct}%`,
													background:
														"linear-gradient(90deg, #D0003C, #E84B5E)",
												}}
											/>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/* ================================================================
   Premium KPI Card
   ================================================================ */

type KpiVariant =
	| "blue"
	| "amber"
	| "emerald"
	| "primary"
	| "violet"
	| "indigo";

const variantConfig: Record<
	KpiVariant,
	{ iconBg: string; accentVia: string }
> = {
	blue: {
		iconBg: "bg-gradient-to-br from-blue-500/20 to-blue-400/5 ring-1 ring-blue-500/15 text-blue-500 dark:from-blue-500/25 dark:to-blue-400/10 dark:text-blue-400",
		accentVia: "via-blue-500/30",
	},
	amber: {
		iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-400/5 ring-1 ring-amber-500/15 text-amber-500 dark:from-amber-500/25 dark:to-amber-400/10 dark:text-amber-400",
		accentVia: "via-amber-500/30",
	},
	emerald: {
		iconBg: "bg-gradient-to-br from-emerald-500/20 to-emerald-400/5 ring-1 ring-emerald-500/15 text-emerald-500 dark:from-emerald-500/25 dark:to-emerald-400/10 dark:text-emerald-400",
		accentVia: "via-emerald-500/30",
	},
	primary: {
		iconBg: "bg-gradient-to-br from-primary/20 to-primary-light/5 ring-1 ring-primary/15 text-primary dark:from-primary/25 dark:to-primary-light/10 dark:text-primary-light",
		accentVia: "via-primary/30",
	},
	violet: {
		iconBg: "bg-gradient-to-br from-violet-500/20 to-violet-400/5 ring-1 ring-violet-500/15 text-violet-500 dark:from-violet-500/25 dark:to-violet-400/10 dark:text-violet-400",
		accentVia: "via-violet-500/30",
	},
	indigo: {
		iconBg: "bg-gradient-to-br from-indigo-500/20 to-indigo-400/5 ring-1 ring-indigo-500/15 text-indigo-500 dark:from-indigo-500/25 dark:to-indigo-400/10 dark:text-indigo-400",
		accentVia: "via-indigo-500/30",
	},
};

function PremiumKpiCard({
	icon,
	label,
	value,
	sub,
	variant,
	delay,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub: string;
	variant: KpiVariant;
	delay: number;
}) {
	const config = variantConfig[variant];
	const isPrimary = variant === "primary";

	return (
		<div
			className={`group relative card-premium gradient-border p-5 animate-fade-in ${isPrimary ? "glow-primary-sm" : ""}`}
			style={{ animationDelay: `${delay * 80}ms` }}
		>
			{/* Hover bottom accent line */}
			<div
				className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${config.accentVia} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
			/>

			<div className="flex items-start gap-4">
				<div
					className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconBg}`}
				>
					{icon}
				</div>
				<div className="min-w-0">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
						{label}
					</p>
					<p
						className={`text-2xl font-bold tracking-tight tabular-nums animate-number ${
							isPrimary
								? "bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent"
								: "text-foreground"
						}`}
						style={{
							animationDelay: `${delay * 80 + 150}ms`,
						}}
					>
						{value}
					</p>
					<p className="text-xs text-muted-foreground mt-1">
						{sub}
					</p>
				</div>
			</div>
		</div>
	);
}
