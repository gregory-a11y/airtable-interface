"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import { Receipt, Loader2 } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
	en_attente: "bg-yellow-100 text-yellow-700",
	paye: "bg-emerald-100 text-emerald-700",
	refuse: "bg-red-100 text-red-700",
};

export default function FacturesPage() {
	const invoices = useQuery(api.invoices.list, {});
	const [tab, setTab] = useState<"all" | "pending">("all");

	if (invoices === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const filtered = tab === "pending" ? invoices.filter((i) => i.status === "en_attente") : invoices;

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Centralisation factures</h1>

			<div className="flex gap-1 rounded-lg bg-slate-100 p-1 w-fit">
				<button type="button" onClick={() => setTab("all")} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", tab === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
					Toutes
				</button>
				<button type="button" onClick={() => setTab("pending")} className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-colors", tab === "pending" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500")}>
					En attente
				</button>
			</div>

			<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
				{filtered.length === 0 ? (
					<div className="py-16 text-center">
						<Receipt className="mx-auto h-12 w-12 text-slate-300" />
						<p className="mt-3 text-sm text-slate-500">Aucune facture</p>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead className="bg-slate-50">
							<tr className="text-left text-xs text-slate-500">
								<th className="px-4 py-3 font-medium">Numero</th>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Montant</th>
								<th className="px-4 py-3 font-medium">Statut</th>
								<th className="px-4 py-3 font-medium">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{filtered.map((inv) => (
								<tr key={inv._id} className="hover:bg-slate-50">
									<td className="px-4 py-3 font-medium text-slate-800">{inv.number || "—"}</td>
									<td className="px-4 py-3">
										<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{inv.type}</span>
									</td>
									<td className="px-4 py-3 font-medium text-slate-800">{formatEUR(inv.amount)}</td>
									<td className="px-4 py-3">
										<span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", statusColors[inv.status])}>
											{inv.status.replace(/_/g, " ")}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-500">{formatDate(inv.createdAt)}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
