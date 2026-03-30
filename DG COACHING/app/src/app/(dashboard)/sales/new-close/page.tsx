"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { User, CreditCard, ArrowRight, Loader2, UserCheck, CalendarCheck } from "lucide-react";

const onboardingColors: Record<string, string> = {
	en_attente: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	en_cours: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
	groupe_cree: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20",
	onboarding_valide: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
};

export default function NewClosePage() {
	const clients = useQuery(api.clients.list, { status: "nouveau_client" });

	if (clients === undefined) {
		return (
			<div className="mx-auto max-w-6xl animate-fade-in">
				<div className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Nouveaux Closes</h1>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(3)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="h-44 animate-pulse rounded-2xl border border-border/30 bg-card"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl animate-fade-in">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-foreground">Nouveaux Closes</h1>
					<p className="mt-0.5 text-sm text-muted-foreground">
						{clients.length} client{clients.length > 1 ? "s" : ""} nouvellement close{clients.length > 1 ? "s" : ""}
					</p>
				</div>
				<div className="flex h-9 items-center rounded-full bg-primary/10 px-4">
					<span className="text-sm font-semibold text-primary">{clients.length}</span>
				</div>
			</div>

			{clients.length === 0 ? (
				<div className="card-premium flex flex-col items-center justify-center py-20">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
						<UserCheck size={28} className="text-muted-foreground/40" />
					</div>
					<p className="text-base font-medium text-foreground">Aucun nouveau close</p>
					<p className="mt-1 text-sm text-muted-foreground">Les nouveaux clients apparaitront ici apres le closing.</p>
				</div>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{clients.map((client, index) => (
						<div
							key={client._id}
							className="card-premium gradient-border p-5 animate-fade-in"
							style={{ animationDelay: `${index * 70}ms` }}
						>
							{/* Header with avatar and status */}
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<User size={18} className="text-primary" />
									</div>
									<div>
										<h3 className="text-base font-semibold text-foreground">
											{client.name}
										</h3>
										<p className="text-xs text-muted-foreground">
											{client.prestation}
										</p>
									</div>
								</div>
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium",
										onboardingColors[client.onboardingStatus || "en_attente"],
									)}
								>
									{(client.onboardingStatus || "en_attente").replace(/_/g, " ")}
								</span>
							</div>

							{/* Amount */}
							<div className="flex items-center gap-2 mb-2">
								<CreditCard size={15} className="text-primary/60" />
								<span className="text-lg font-bold text-primary">
									{formatEUR(client.montantContracteTTC)}
								</span>
							</div>

							{/* Closing date */}
							{client.dateClosing && (
								<div className="flex items-center gap-1.5 mb-4">
									<CalendarCheck size={12} className="text-muted-foreground" />
									<p className="text-sm text-muted-foreground">
										Close le {formatDate(client.dateClosing)}
									</p>
								</div>
							)}

							{/* CTA */}
							<Link
								href={`/operationnel/clients/${client._id}`}
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
							>
								Voir la fiche
								<ArrowRight size={14} />
							</Link>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
