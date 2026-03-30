"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatDateShort } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
	ChevronDown,
	ChevronRight,
	Search,
	ExternalLink,
	UserCircle,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const statusColors: Record<string, string> = {
	acompte: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	nouveau_client: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	en_attente_programme: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
	active: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	paused: "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
	en_attente: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20",
	renew: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20",
	fin_proche: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20",
	termine: "bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20",
	archived: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
	resilie: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
};

const statusLabels: Record<string, string> = {
	acompte: "Acompte",
	nouveau_client: "Nouveau client",
	en_attente_programme: "En attente",
	active: "Actif",
	paused: "Pause",
	en_attente: "En attente",
	renew: "Renouvellement",
	fin_proche: "Fin proche",
	termine: "Termine",
	archived: "Archive",
	resilie: "Resilie",
};

function isEndingSoon(dateFinReelle: number | undefined): boolean {
	if (!dateFinReelle) return false;
	const now = Date.now();
	const thirtyDays = 30 * 24 * 60 * 60 * 1000;
	return dateFinReelle > now && dateFinReelle - now < thirtyDays;
}

export default function ListingClientsPage() {
	const grouped = useQuery(api.clients.listGrouped);
	const [search, setSearch] = useState("");
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

	if (grouped === undefined) {
		return (
			<div className="mx-auto max-w-7xl animate-fade-in">
				<div className="mb-8 flex items-end justify-between">
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Fiches Clients
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							Chargement...
						</p>
					</div>
				</div>
				<div className="space-y-4">
					{[...Array(3)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="card-premium h-32 animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	const toggleCollapse = (key: string) => {
		setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const totalClients = Object.values(grouped).reduce(
		(sum, group) =>
			sum +
			Object.values(group.byStatus).reduce(
				(s, arr) => s + arr.length,
				0,
			),
		0,
	);

	return (
		<div className="mx-auto max-w-7xl animate-page-enter">
			{/* Header */}
			<div className="mb-8 flex items-end justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">
						Fiches Clients
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{totalClients} client{totalClients !== 1 ? "s" : ""} au total
					</p>
				</div>
				<div className="relative">
					<Search
						size={16}
						className="absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="text"
						placeholder="Rechercher un client..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="h-10 w-[260px] rounded-xl border-border/50 dark:border-white/10 bg-card dark:bg-[#2A2A28] pl-9 shadow-sm dark:shadow-black/20"
					/>
				</div>
			</div>

			{/* Coach groups */}
			<div className="space-y-6">
				{Object.entries(grouped).map(([coachKey, group]) => {
					const coachName = group.coach?.name || "Non assigne";
					const coachInitial =
						group.coach?.name?.charAt(0)?.toUpperCase() || "?";
					const groupTotalClients = Object.values(
						group.byStatus,
					).reduce((sum, arr) => sum + arr.length, 0);
					const isCollapsed = collapsed[coachKey];

					return (
						<div
							key={coachKey}
							className="animate-fade-in"
						>
							{/* Coach header */}
							<button
								type="button"
								onClick={() => toggleCollapse(coachKey)}
								className="group mb-3 flex w-full items-center gap-3 text-left"
							>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
									{coachInitial}
								</div>
								<span className="text-lg font-semibold text-foreground">
									{coachName}
								</span>
								<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
									{groupTotalClients}
								</span>
								<div className="ml-auto text-muted-foreground transition-transform">
									{isCollapsed ? (
										<ChevronRight size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</div>
							</button>

							{/* Divider */}
							<div className="mb-4 h-px bg-border/60" />

							{!isCollapsed && (
								<div className="space-y-5 pl-[52px]">
									{Object.entries(group.byStatus).map(
										([status, clients]) => {
											const filtered = search
												? clients.filter(
														(c: any) =>
															c.name
																.toLowerCase()
																.includes(
																	search.toLowerCase(),
																) ||
															c.email
																?.toLowerCase()
																.includes(
																	search.toLowerCase(),
																),
													)
												: clients;

											if (filtered.length === 0)
												return null;

											return (
												<div
													key={status}
													className="animate-slide-in"
												>
													{/* Status badge */}
													<div className="mb-3 flex items-center gap-2">
														<span
															className={cn(
																"inline-flex rounded-full px-3 py-1 text-xs font-medium",
																statusColors[
																	status
																] || "bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
															)}
														>
															{statusLabels[
																status
															] || status}
														</span>
														<span className="text-xs text-muted-foreground">
															{filtered.length}{" "}
															client
															{filtered.length !==
															1
																? "s"
																: ""}
														</span>
													</div>

													{/* Table */}
													<div className="card-premium overflow-hidden rounded-xl">
														<Table>
															<TableHeader>
																<TableRow className="border-b border-border/20">
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		Client
																	</TableHead>
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		Fichier coaching
																	</TableHead>
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		E-mail
																	</TableHead>
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		Telephone
																	</TableHead>
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		Statut
																	</TableHead>
																	<TableHead className="bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
																		Date de fin
																	</TableHead>
																</TableRow>
															</TableHeader>
															<TableBody>
																{filtered.map(
																	(
																		client: any,
																	) => (
																		<TableRow
																			key={
																				client._id
																			}
																			className="table-row-hover border-b border-border/20"
																		>
																			<TableCell className="py-3 px-4">
																				<Link
																					href={`/operationnel/clients/${client._id}`}
																					className="font-medium text-foreground transition-colors hover:text-primary"
																				>
																					{
																						client.name
																					}
																				</Link>
																			</TableCell>
																			<TableCell className="py-3 px-4">
																				{client.trainingLogUrl ? (
																					<a
																						href={
																							client.trainingLogUrl
																						}
																						target="_blank"
																						rel="noopener noreferrer"
																						className="inline-flex items-center gap-1 text-sm text-primary/80 transition-colors hover:text-primary"
																					>
																						<span>
																							Ouvrir
																						</span>
																						<ExternalLink
																							size={
																								12
																							}
																						/>
																					</a>
																				) : (
																					<span className="text-sm text-muted-foreground">
																						--
																					</span>
																				)}
																			</TableCell>
																			<TableCell className="py-3 px-4 text-sm text-muted-foreground">
																				{client.email ||
																					"--"}
																			</TableCell>
																			<TableCell className="py-3 px-4 text-sm text-muted-foreground">
																				{client.phone ||
																					"--"}
																			</TableCell>
																			<TableCell className="py-3 px-4">
																				<span
																					className={cn(
																						"inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
																						statusColors[
																							client
																								.status
																						] ||
																							"bg-gray-50 dark:bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
																					)}
																				>
																					{statusLabels[
																						client
																							.status
																					] ||
																						client.status}
																				</span>
																			</TableCell>
																			<TableCell
																				className={cn(
																					"py-3 px-4 text-sm",
																					isEndingSoon(
																						client.dateFinReelle,
																					)
																						? "font-medium text-amber-600 dark:text-amber-400"
																						: "text-muted-foreground",
																				)}
																			>
																				{client.dateFinReelle
																					? formatDateShort(
																							client.dateFinReelle,
																						)
																					: "--"}
																			</TableCell>
																		</TableRow>
																	),
																)}
															</TableBody>
														</Table>
													</div>
												</div>
											);
										},
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Empty state */}
			{totalClients === 0 && (
				<div className="flex flex-col items-center justify-center py-20">
					<UserCircle
						size={48}
						className="mb-4 text-muted-foreground/40"
					/>
					<p className="text-sm text-muted-foreground">
						Aucun client trouve
					</p>
				</div>
			)}
		</div>
	);
}
