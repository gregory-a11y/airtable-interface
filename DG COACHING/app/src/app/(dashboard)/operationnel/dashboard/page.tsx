"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Users, Clock, AlertTriangle, Pause, UserPlus } from "lucide-react";

export default function OperationnelDashboardPage() {
	const stats = useQuery(api.clients.getStats);

	if (stats === undefined) {
		return (
			<div className="mx-auto max-w-7xl space-y-6">
				<h1 className="text-xl font-bold text-slate-800">Dashboard Operationnel</h1>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
					{[...Array(5)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Dashboard Operationnel</h1>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard
					title="Clients actifs"
					value={stats.totalActifs}
					icon={<Users size={20} />}
					color="emerald"
				/>
				<StatCard
					title="En attente programme"
					value={stats.enAttenteProgramme}
					icon={<Clock size={20} />}
					color="blue"
				/>
				<StatCard
					title="Fin proche"
					value={stats.finProche}
					icon={<AlertTriangle size={20} />}
					color="red"
				/>
				<StatCard
					title="En pause"
					value={stats.enPause}
					icon={<Pause size={20} />}
					color="amber"
				/>
				<StatCard
					title="Nouveaux ce mois"
					value={stats.nouveauxCeMois}
					icon={<UserPlus size={20} />}
					color="violet"
				/>
			</div>
		</div>
	);
}

function StatCard({
	title,
	value,
	icon,
	color,
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: string;
}) {
	const colorMap: Record<string, string> = {
		emerald: "bg-emerald-50 text-emerald-600",
		blue: "bg-blue-50 text-blue-600",
		red: "bg-red-50 text-red-600",
		amber: "bg-amber-50 text-amber-600",
		violet: "bg-violet-50 text-violet-600",
	};

	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
			<div className="flex items-center gap-3">
				<div className={`rounded-lg p-2 ${colorMap[color]}`}>{icon}</div>
				<div>
					<p className="text-2xl font-bold text-slate-800">{value}</p>
					<p className="text-xs text-slate-500">{title}</p>
				</div>
			</div>
		</div>
	);
}
