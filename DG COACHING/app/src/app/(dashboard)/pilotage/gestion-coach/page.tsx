"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR } from "@/lib/utils";
import { Users, Loader2, UserCog } from "lucide-react";

export default function GestionCoachPage() {
	const users = useQuery(api.users.listTeam);
	const clients = useQuery(api.clients.list, {});

	if (users === undefined || clients === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const coaches = users.filter((u) => u.role === "coach" && u.status === "active");
	const activeClients = clients.filter((c) => c.status === "active");

	const coachData = coaches.map((coach) => {
		const coachClients = activeClients.filter((c) => c.coachId === coach._id);
		const maxCap = coach.maxCapacity || 20;
		const occupation = Math.round((coachClients.length / maxCap) * 100);
		const commission = coachClients.length * (coach.pricePerStudent || 0);
		return {
			...coach,
			clientsActifs: coachClients.length,
			maxCapacity: maxCap,
			occupation,
			commissionMensuelle: commission,
		};
	});

	const unassigned = activeClients.filter((c) => !c.coachId);

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Gestion Coach</h1>

			{/* Workload chart */}
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<h2 className="mb-4 text-sm font-semibold text-slate-700">Charge par coach</h2>
				{coachData.length === 0 ? (
					<div className="py-12 text-center">
						<UserCog className="mx-auto h-12 w-12 text-slate-300" />
						<p className="mt-3 text-sm text-slate-500">Aucun coach</p>
					</div>
				) : (
					<div className="space-y-3">
						{coachData.sort((a, b) => b.clientsActifs - a.clientsActifs).map((coach) => (
							<div key={coach._id} className="flex items-center gap-4">
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
									{coach.name?.charAt(0) || "C"}
								</div>
								<div className="w-32">
									<div className="text-sm font-medium text-slate-800">{coach.name}</div>
									<div className="text-xs text-slate-400">{coach.clientsActifs}/{coach.maxCapacity} clients</div>
								</div>
								<div className="flex-1">
									<div className="h-3 rounded-full bg-slate-100">
										<div
											className={`h-3 rounded-full transition-all ${
												coach.occupation > 90 ? "bg-red-500" :
												coach.occupation > 70 ? "bg-amber-500" :
												"bg-emerald-500"
											}`}
											style={{ width: `${Math.min(coach.occupation, 100)}%` }}
										/>
									</div>
								</div>
								<div className="w-16 text-right text-sm font-medium text-slate-600">
									{coach.occupation}%
								</div>
								<div className="w-24 text-right text-sm text-slate-500">
									{formatEUR(coach.commissionMensuelle)}/mois
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Unassigned clients */}
			{unassigned.length > 0 && (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
					<h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-800">
						<Users size={16} />
						{unassigned.length} client(s) sans coach
					</h2>
					<div className="space-y-2">
						{unassigned.map((c) => (
							<div key={c._id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
								<span className="text-sm font-medium text-slate-800">{c.name}</span>
								<span className="text-xs text-slate-400">{c.prestation}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
