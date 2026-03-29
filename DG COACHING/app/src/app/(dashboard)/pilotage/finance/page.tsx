"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR } from "@/lib/utils";
import {
	DollarSign,
	TrendingUp,
	TrendingDown,
	ArrowDown,
	Loader2,
	BarChart3,
} from "lucide-react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const COLORS = ["#D0003C", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function FinanceDashboardPage() {
	const data = useQuery(api.finance.getDashboard);

	if (data === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Dashboard Finance</h1>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<FinanceCard
					label="CA Collecte"
					value={formatEUR(data.caCollecte)}
					sub={`Ce mois: ${formatEUR(data.ceMois.collecte)}`}
					trend={data.ceMois.trend}
					color="emerald"
				/>
				<FinanceCard
					label="CA Contracte"
					value={formatEUR(data.caContracte)}
					sub={`Taux collecte: ${data.tauxCollecte}%`}
					color="blue"
				/>
				<FinanceCard
					label="Sorties"
					value={formatEUR(data.sorties)}
					color="amber"
				/>
				<FinanceCard
					label="Benefices"
					value={formatEUR(data.benefices)}
					sub={`Ratio: ${data.ratioProfits}%`}
					color={data.benefices >= 0 ? "emerald" : "red"}
				/>
			</div>

			{/* Revenue Chart */}
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<h2 className="mb-4 text-sm font-semibold text-slate-700">
					Evolution du CA (12 mois)
				</h2>
				<ResponsiveContainer width="100%" height={300}>
					<AreaChart data={data.evolution}>
						<CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
						<XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} />
						<YAxis
							tick={{ fontSize: 12, fill: "#94A3B8" }}
							tickFormatter={(v) => `${(v / 100).toFixed(0)}€`}
						/>
						<Tooltip
							formatter={(value: number) => formatEUR(value)}
							contentStyle={{
								borderRadius: "8px",
								border: "1px solid #E2E8F0",
								fontSize: "13px",
							}}
						/>
						<Area
							type="monotone"
							dataKey="contracte"
							stroke="#3B82F6"
							fill="#3B82F6"
							fillOpacity={0.1}
							name="Contracte"
						/>
						<Area
							type="monotone"
							dataKey="collecte"
							stroke="#10B981"
							fill="#10B981"
							fillOpacity={0.15}
							name="Collecte"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>

			{/* Bottom row */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Sources donut */}
				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<h2 className="mb-4 text-sm font-semibold text-slate-700">
						Sources de paiement
					</h2>
					{data.bySource.length > 0 ? (
						<div className="flex items-center gap-6">
							<ResponsiveContainer width={160} height={160}>
								<PieChart>
									<Pie
										data={data.bySource}
										cx="50%"
										cy="50%"
										innerRadius={40}
										outerRadius={70}
										dataKey="value"
									>
										{data.bySource.map((_, i) => (
											<Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
							<div className="space-y-2">
								{data.bySource.map((item, i) => (
									<div key={item.name} className="flex items-center gap-2 text-sm">
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: COLORS[i % COLORS.length] }}
										/>
										<span className="text-slate-600">{item.name}</span>
										<span className="font-medium text-slate-800">
											{formatEUR(item.value)}
										</span>
									</div>
								))}
							</div>
						</div>
					) : (
						<p className="py-8 text-center text-sm text-slate-400">Aucune donnee</p>
					)}
				</div>

				{/* Top prestations */}
				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<h2 className="mb-4 text-sm font-semibold text-slate-700">
						Top Prestations par CA
					</h2>
					{data.byPrestation.length > 0 ? (
						<ResponsiveContainer width="100%" height={200}>
							<BarChart data={data.byPrestation.slice(0, 6)} layout="vertical">
								<XAxis
									type="number"
									tick={{ fontSize: 11, fill: "#94A3B8" }}
									tickFormatter={(v) => `${(v / 100).toFixed(0)}€`}
								/>
								<YAxis
									type="category"
									dataKey="name"
									tick={{ fontSize: 11, fill: "#64748B" }}
									width={100}
								/>
								<Tooltip formatter={(value: number) => formatEUR(value)} />
								<Bar dataKey="value" fill="#D0003C" radius={[0, 4, 4, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<p className="py-8 text-center text-sm text-slate-400">Aucune donnee</p>
					)}
				</div>
			</div>
		</div>
	);
}

function FinanceCard({
	label,
	value,
	sub,
	trend,
	color,
}: {
	label: string;
	value: string;
	sub?: string;
	trend?: number;
	color: string;
}) {
	const bgMap: Record<string, string> = {
		emerald: "from-emerald-500 to-emerald-600",
		blue: "from-blue-500 to-blue-600",
		amber: "from-amber-500 to-amber-600",
		red: "from-red-500 to-red-600",
	};

	return (
		<div
			className={`rounded-xl bg-gradient-to-br ${bgMap[color]} p-5 text-white shadow-sm`}
		>
			<p className="text-xs font-medium uppercase tracking-wider opacity-80">{label}</p>
			<p className="mt-1 text-2xl font-bold">{value}</p>
			{sub && <p className="mt-1 text-xs opacity-70">{sub}</p>}
			{trend !== undefined && trend !== 0 && (
				<div className="mt-2 flex items-center gap-1 text-xs">
					{trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
					<span>
						{trend > 0 ? "+" : ""}
						{trend}% vs mois precedent
					</span>
				</div>
			)}
		</div>
	);
}
