"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Filter } from "lucide-react";
import { useState } from "react";

const statusColors: Record<string, string> = {
	acompte: "bg-orange-100 text-orange-700",
	nouveau_client: "bg-yellow-100 text-yellow-700",
	en_attente_programme: "bg-blue-100 text-blue-700",
	active: "bg-emerald-100 text-emerald-700",
	paused: "bg-slate-100 text-slate-600",
	renew: "bg-violet-100 text-violet-700",
	fin_proche: "bg-red-100 text-red-700",
	termine: "bg-slate-200 text-slate-600",
	archived: "bg-slate-100 text-slate-400",
};

const statusLabels: Record<string, string> = {
	acompte: "Acompte",
	nouveau_client: "Nouveau client",
	en_attente_programme: "En attente de programme",
	active: "Active",
	paused: "Paused",
	renew: "Renew",
	fin_proche: "Fin proche",
	termine: "Termine",
	archived: "Archived",
};

export default function ListingClientsPage() {
	const grouped = useQuery(api.clients.listGrouped);
	const [search, setSearch] = useState("");
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

	if (grouped === undefined) {
		return (
			<div className="mx-auto max-w-7xl">
				<h1 className="mb-6 text-xl font-bold text-slate-800">Listing clients</h1>
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white"
						/>
					))}
				</div>
			</div>
		);
	}

	const toggleCollapse = (key: string) => {
		setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	return (
		<div className="mx-auto max-w-7xl">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-bold text-slate-800">Listing clients</h1>
				<div className="flex items-center gap-3">
					<div className="relative">
						<Search size={16} className="absolute top-2.5 left-3 text-slate-400" />
						<input
							type="text"
							placeholder="Rechercher..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-[#D0003C]"
						/>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{Object.entries(grouped).map(([coachKey, group]) => {
					const coachName = group.coach?.name || "(Vide)";
					const totalClients = Object.values(group.byStatus).reduce(
						(sum, arr) => sum + arr.length,
						0,
					);

					return (
						<div
							key={coachKey}
							className="rounded-xl border border-slate-200 bg-white overflow-hidden"
						>
							{/* Coach header */}
							<button
								type="button"
								onClick={() => toggleCollapse(coachKey)}
								className="flex w-full items-center gap-2 bg-slate-50 px-4 py-3 text-left"
							>
								{collapsed[coachKey] ? (
									<ChevronRight size={16} className="text-slate-400" />
								) : (
									<ChevronDown size={16} className="text-slate-400" />
								)}
								<span className="text-sm font-semibold text-slate-700">
									Coach attitré :
								</span>
								<span className="text-sm font-bold text-slate-800">{coachName}</span>
								<span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
									{totalClients}
								</span>
							</button>

							{!collapsed[coachKey] && (
								<div className="divide-y divide-slate-100">
									{Object.entries(group.byStatus).map(([status, clients]) => {
										const filtered = search
											? clients.filter(
													(c: any) =>
														c.name.toLowerCase().includes(search.toLowerCase()) ||
														c.email?.toLowerCase().includes(search.toLowerCase()),
												)
											: clients;

										if (filtered.length === 0) return null;

										return (
											<div key={status} className="px-4 py-2">
												<div className="mb-2 flex items-center gap-2">
													<span
														className={cn(
															"rounded-full px-2 py-0.5 text-xs font-medium",
															statusColors[status] || "bg-slate-100 text-slate-600",
														)}
													>
														{statusLabels[status] || status}
													</span>
													<span className="text-xs text-slate-400">
														{filtered.length}
													</span>
												</div>

												<div className="overflow-x-auto">
													<table className="w-full text-sm">
														<thead>
															<tr className="text-left text-xs text-slate-400">
																<th className="pb-1 font-medium">Clients</th>
																<th className="pb-1 font-medium">Fichier coaching</th>
																<th className="pb-1 font-medium">E-mail</th>
																<th className="pb-1 font-medium">Telephone</th>
																<th className="pb-1 font-medium">Statut Client</th>
																<th className="pb-1 font-medium">Date de fin</th>
															</tr>
														</thead>
														<tbody>
															{filtered.map((client: any) => (
																<tr
																	key={client._id}
																	className="border-t border-slate-50 hover:bg-slate-50"
																>
																	<td className="py-2">
																		<Link
																			href={`/operationnel/clients/${client._id}`}
																			className="font-medium text-slate-800 hover:text-[#D0003C]"
																		>
																			{client.name}
																		</Link>
																	</td>
																	<td className="py-2">
																		{client.trainingLogUrl ? (
																			<a
																				href={client.trainingLogUrl}
																				target="_blank"
																				rel="noopener noreferrer"
																				className="text-blue-500 hover:underline"
																			>
																				Google Sheets
																			</a>
																		) : (
																			<span className="text-slate-300">—</span>
																		)}
																	</td>
																	<td className="py-2 text-slate-600">
																		{client.email || "—"}
																	</td>
																	<td className="py-2 text-slate-600">
																		{client.phone || "—"}
																	</td>
																	<td className="py-2">
																		<span
																			className={cn(
																				"rounded-full px-2 py-0.5 text-xs font-medium",
																				statusColors[client.status] ||
																					"bg-slate-100 text-slate-600",
																			)}
																		>
																			{statusLabels[client.status] || client.status}
																		</span>
																	</td>
																	<td className="py-2 text-slate-500">
																		{client.dateFinReelle
																			? formatDateShort(client.dateFinReelle)
																			: "—"}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
