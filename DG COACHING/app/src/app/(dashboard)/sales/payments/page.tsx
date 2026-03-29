"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import { CreditCard, TrendingUp, Users, DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";

const paymentStatusColors: Record<string, string> = {
	confirmed: "bg-emerald-100 text-emerald-700",
	pending: "bg-yellow-100 text-yellow-700",
	failed: "bg-red-100 text-red-700",
	refunded: "bg-cyan-100 text-cyan-700",
};

export default function PaymentsPage() {
	const payments = useQuery(api.payments.list, {});
	const stats = useQuery(api.payments.getStats);
	const [tab, setTab] = useState<"paiements" | "commissions">("paiements");

	if (payments === undefined || stats === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Suivi des paiements & commissions</h1>

			{/* Stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
				<StatCard
					label="Total Collecte"
					value={formatEUR(stats.totalCollecte)}
					icon={<DollarSign size={18} />}
					color="emerald"
				/>
				<StatCard
					label="Paiements echoues"
					value={String(stats.totalFailed)}
					icon={<CreditCard size={18} />}
					color="red"
				/>
				<StatCard
					label="Commission Closing"
					value={formatEUR(stats.totalCommissionsClosing)}
					icon={<TrendingUp size={18} />}
					color="blue"
				/>
				<StatCard
					label="Commission Setting"
					value={formatEUR(stats.totalCommissionsSetting)}
					icon={<Users size={18} />}
					color="violet"
				/>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
				<button
					type="button"
					onClick={() => setTab("paiements")}
					className={cn(
						"rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
						tab === "paiements"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					Paiements
				</button>
				<button
					type="button"
					onClick={() => setTab("commissions")}
					className={cn(
						"rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
						tab === "commissions"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					Commissions
				</button>
			</div>

			{/* Payments table */}
			{tab === "paiements" && (
				<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
					{payments.length === 0 ? (
						<div className="py-16 text-center">
							<CreditCard className="mx-auto h-12 w-12 text-slate-300" />
							<p className="mt-3 text-sm text-slate-500">Aucun paiement enregistre</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-slate-50">
									<tr className="text-left text-xs text-slate-500">
										<th className="px-4 py-3 font-medium">Statut</th>
										<th className="px-4 py-3 font-medium">Montant</th>
										<th className="px-4 py-3 font-medium">Source</th>
										<th className="px-4 py-3 font-medium">Echeance</th>
										<th className="px-4 py-3 font-medium">Date</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{payments.map((p) => (
										<tr key={p._id} className="hover:bg-slate-50">
											<td className="px-4 py-3">
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-xs font-medium",
														paymentStatusColors[p.status],
													)}
												>
													{p.status}
												</span>
											</td>
											<td className="px-4 py-3 font-medium text-slate-800">
												{formatEUR(p.amount)}
											</td>
											<td className="px-4 py-3 text-slate-500">
												{p.sourceType || p.provider}
											</td>
											<td className="px-4 py-3 text-slate-500">
												{p.installmentNumber || "—"}
											</td>
											<td className="px-4 py-3 text-slate-500">
												{formatDate(p.createdAt)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{tab === "commissions" && (
				<div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
					<Users className="mx-auto h-12 w-12 text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">
						Les commissions seront calculees automatiquement a chaque paiement recu.
					</p>
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	icon,
	color,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	color: string;
}) {
	const colors: Record<string, string> = {
		emerald: "bg-emerald-50 text-emerald-600",
		red: "bg-red-50 text-red-600",
		blue: "bg-blue-50 text-blue-600",
		violet: "bg-violet-50 text-violet-600",
	};

	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4">
			<div className="flex items-center gap-3">
				<div className={`rounded-lg p-2 ${colors[color]}`}>{icon}</div>
				<div>
					<p className="text-lg font-bold text-slate-800">{value}</p>
					<p className="text-xs text-slate-500">{label}</p>
				</div>
			</div>
		</div>
	);
}
