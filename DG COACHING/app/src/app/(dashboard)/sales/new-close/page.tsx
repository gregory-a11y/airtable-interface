"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Sparkles, User, CreditCard, ArrowRight } from "lucide-react";

const onboardingColors: Record<string, string> = {
	en_attente: "bg-yellow-100 text-yellow-700",
	en_cours: "bg-blue-100 text-blue-700",
	groupe_cree: "bg-violet-100 text-violet-700",
	onboarding_valide: "bg-emerald-100 text-emerald-700",
};

export default function NewClosePage() {
	const clients = useQuery(api.clients.list, { status: "nouveau_client" });

	if (clients === undefined) {
		return (
			<div className="mx-auto max-w-5xl">
				<h1 className="mb-6 text-xl font-bold text-slate-800">New Close</h1>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="h-40 animate-pulse rounded-xl border border-slate-200 bg-white"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl">
			<div className="mb-6 flex items-center gap-2">
				<Sparkles className="text-[#D0003C]" size={22} />
				<h1 className="text-xl font-bold text-slate-800">New Close</h1>
				<span className="rounded-full bg-[#D0003C] px-2 py-0.5 text-xs font-bold text-white">
					{clients.length}
				</span>
			</div>

			{clients.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
					<Sparkles className="mx-auto h-12 w-12 text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">Aucun nouveau close pour le moment</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{clients.map((client) => (
						<div
							key={client._id}
							className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D0003C]/10 text-[#D0003C]">
										<User size={16} />
									</div>
									<div>
										<div className="text-sm font-semibold text-slate-800">
											{client.name}
										</div>
										<div className="text-xs text-slate-400">
											{client.prestation}
										</div>
									</div>
								</div>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-[10px] font-medium",
										onboardingColors[client.onboardingStatus || "en_attente"],
									)}
								>
									{(client.onboardingStatus || "en_attente").replace(/_/g, " ")}
								</span>
							</div>

							<div className="mt-4 flex items-center gap-1.5 text-lg font-bold text-[#D0003C]">
								<CreditCard size={16} />
								{formatEUR(client.montantContracteTTC)}
							</div>

							{client.dateClosing && (
								<p className="mt-1 text-xs text-slate-400">
									Close le {formatDate(client.dateClosing)}
								</p>
							)}

							<Link
								href={`/operationnel/clients/${client._id}`}
								className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
							>
								Voir la fiche <ArrowRight size={14} />
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
