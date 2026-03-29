"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatEUR } from "@/lib/utils";
import {
	DollarSign,
	Users,
	Phone,
	TrendingUp,
	AlertTriangle,
	Clock,
	CreditCard,
} from "lucide-react";

export default function OverviewPage() {
	const user = useQuery(api.users.currentUser);

	const greeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return "Bonjour";
		if (hour < 18) return "Bon apres-midi";
		return "Bonsoir";
	};

	const today = new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date());

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Welcome */}
			<div className="rounded-xl border border-slate-200 bg-white p-6">
				<h1 className="text-2xl font-bold text-slate-800">
					{greeting()}, {user?.name?.split(" ")[0] || ""}
				</h1>
				<p className="mt-1 text-sm capitalize text-slate-500">{today}</p>
			</div>

			{/* KPI Cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KPICard
					title="CA Collecte ce mois"
					value={formatEUR(0)}
					icon={<DollarSign size={20} />}
					color="emerald"
				/>
				<KPICard
					title="Clients actifs"
					value="0"
					icon={<Users size={20} />}
					color="blue"
				/>
				<KPICard
					title="Calls aujourd'hui"
					value="0"
					icon={<Phone size={20} />}
					color="violet"
				/>
				<KPICard
					title="Taux de closing"
					value="0%"
					icon={<TrendingUp size={20} />}
					color="amber"
				/>
			</div>

			{/* Alerts */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
						<AlertTriangle size={16} className="text-amber-500" />
						Actions requises
					</h2>
					<div className="space-y-3">
						<AlertItem label="Clients en attente de programme" count={0} />
						<AlertItem label="Bilans a envoyer" count={0} />
						<AlertItem label="Paiements echoues" count={0} />
					</div>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5">
					<h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
						<Clock size={16} className="text-red-500" />
						Fin proche
					</h2>
					<p className="text-sm text-slate-400">Aucun client en fin proche</p>
				</div>
			</div>
		</div>
	);
}

function KPICard({
	title,
	value,
	icon,
	color,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	color: "emerald" | "blue" | "violet" | "amber";
}) {
	const colorMap = {
		emerald: "bg-emerald-50 text-emerald-600",
		blue: "bg-blue-50 text-blue-600",
		violet: "bg-violet-50 text-violet-600",
		amber: "bg-amber-50 text-amber-600",
	};

	return (
		<div className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						{title}
					</p>
					<p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
				</div>
				<div className={`rounded-xl p-2.5 ${colorMap[color]}`}>{icon}</div>
			</div>
		</div>
	);
}

function AlertItem({ label, count }: { label: string; count: number }) {
	return (
		<div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
			<span className="text-sm text-slate-600">{label}</span>
			<span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
				{count}
			</span>
		</div>
	);
}
