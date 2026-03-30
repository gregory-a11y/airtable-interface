"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { formatEUR, formatDate, cn } from "@/lib/utils";
import {
	CreditCard,
	TrendingUp,
	Users,
	DollarSign,
	Loader2,
	Wallet,
	AlertCircle,
	ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const STATUS_STYLES: Record<string, string> = {
	confirmed: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
	pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
	failed: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20",
	refunded: "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20",
};

const STATUS_LABEL: Record<string, string> = {
	confirmed: "Confirme",
	pending: "En attente",
	failed: "Echoue",
	refunded: "Rembourse",
};

export default function PaymentsPage() {
	const payments = useQuery(api.payments.list, {});
	const stats = useQuery(api.payments.getStats);
	const commissions = useQuery(api.payments.getCommissionsByUser);
	const [tab, setTab] = useState<string>("paiements");

	if (payments === undefined || stats === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const kpis = [
		{
			label: "Total Collecte",
			value: formatEUR(stats.totalCollecte),
			icon: <DollarSign size={18} />,
			iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
			iconColor: "text-emerald-600 dark:text-emerald-400",
		},
		{
			label: "Paiements echoues",
			value: String(stats.totalFailed),
			icon: <AlertCircle size={18} />,
			iconBg: "bg-red-50 dark:bg-red-500/10",
			iconColor: "text-red-600 dark:text-red-400",
		},
		{
			label: "Commission Closing",
			value: formatEUR(stats.totalCommissionsClosing),
			icon: <TrendingUp size={18} />,
			iconBg: "bg-blue-50 dark:bg-blue-500/10",
			iconColor: "text-blue-600 dark:text-blue-400",
		},
		{
			label: "Commission Setting",
			value: formatEUR(stats.totalCommissionsSetting),
			icon: <Users size={18} />,
			iconBg: "bg-violet-50 dark:bg-violet-500/10",
			iconColor: "text-violet-600 dark:text-violet-400",
		},
	];

	return (
		<div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-foreground">Suivi des Paiements</h1>
				<p className="mt-0.5 text-sm text-muted-foreground">Paiements et commissions de l'equipe</p>
			</div>

			{/* KPI Stats */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{kpis.map((kpi, index) => (
					<div
						key={kpi.label}
						className="card-premium gradient-border p-5 animate-fade-in"
						style={{ animationDelay: `${index * 80}ms` }}
					>
						<div className="flex items-center gap-3.5">
							<div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", kpi.iconBg)}>
								<span className={kpi.iconColor}>{kpi.icon}</span>
							</div>
							<div>
								<p className="text-xl font-bold text-foreground animate-number">{kpi.value}</p>
								<p className="text-xs text-muted-foreground">{kpi.label}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Tab switcher — pill style */}
			<div className="inline-flex items-center rounded-full bg-muted p-1">
				<button
					onClick={() => setTab("paiements")}
					className={cn(
						"flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
						tab === "paiements"
							? "bg-white dark:bg-[#2A2A28] text-foreground shadow-sm dark:shadow-black/20"
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<Wallet size={15} />
					Paiements
				</button>
				<button
					onClick={() => setTab("commissions")}
					className={cn(
						"flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
						tab === "commissions"
							? "bg-white dark:bg-[#2A2A28] text-foreground shadow-sm dark:shadow-black/20"
							: "text-muted-foreground hover:text-foreground"
					)}
				>
					<ArrowUpRight size={15} />
					Commissions
				</button>
			</div>

			{/* Payments table */}
			{tab === "paiements" && (
				<div className="card-premium overflow-hidden">
					{payments.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
								<CreditCard size={28} className="text-muted-foreground/40" />
							</div>
							<p className="text-base font-medium text-foreground">Aucun paiement enregistre</p>
							<p className="mt-1 text-sm text-muted-foreground">Les paiements apparaitront ici.</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/30 border-b border-border/30 hover:bg-muted/30">
										<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
										<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Montant</TableHead>
										<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source</TableHead>
										<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Echeance</TableHead>
										<TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payments.map((p) => (
										<TableRow key={p._id} className="table-row-hover border-b border-border/30">
											<TableCell className="py-3 px-4">
												<span className={cn(
													"inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
													STATUS_STYLES[p.status] ?? "bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20"
												)}>
													{STATUS_LABEL[p.status] ?? p.status}
												</span>
											</TableCell>
											<TableCell className="py-3 px-4 font-semibold text-foreground">
												{formatEUR(p.amount)}
											</TableCell>
											<TableCell className="py-3 px-4 text-sm text-muted-foreground">
												{p.sourceType || p.provider}
											</TableCell>
											<TableCell className="py-3 px-4 text-sm text-muted-foreground">
												{p.installmentNumber || "--"}
											</TableCell>
											<TableCell className="py-3 px-4 text-xs text-muted-foreground">
												{formatDate(p.createdAt)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</div>
			)}

			{/* Commissions */}
			{tab === "commissions" && (
				<div>
					{!commissions || commissions.length === 0 ? (
						<div className="card-premium flex flex-col items-center justify-center py-20">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
								<Users size={28} className="text-muted-foreground/40" />
							</div>
							<p className="text-base font-medium text-foreground">Aucune commission enregistree</p>
							<p className="mt-1 text-sm text-muted-foreground">Les commissions seront calculees automatiquement.</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{commissions
								.sort((a, b) => b.total - a.total)
								.map((c, index) => (
								<div
									key={c.userId}
									className="card-premium p-5 animate-fade-in"
									style={{ animationDelay: `${index * 70}ms` }}
								>
									{/* User header */}
									<div className="flex items-center gap-3 mb-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
											{c.name?.charAt(0).toUpperCase() || "?"}
										</div>
										<div>
											<h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
											<div className="flex items-center gap-1.5">
												<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
													{c.count} paiement{c.count > 1 ? "s" : ""}
												</span>
											</div>
										</div>
									</div>

									{/* Commission breakdown */}
									<div className="space-y-2.5">
										{c.totalClosing > 0 && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
													<span className="text-xs text-muted-foreground">Closing</span>
												</div>
												<span className="text-sm font-medium text-foreground">{formatEUR(c.totalClosing)}</span>
											</div>
										)}
										{c.totalSetting > 0 && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
													<span className="text-xs text-muted-foreground">Setting</span>
												</div>
												<span className="text-sm font-medium text-foreground">{formatEUR(c.totalSetting)}</span>
											</div>
										)}
										<div className="border-t border-border/30 pt-2.5 flex items-center justify-between">
											<span className="text-xs font-medium text-muted-foreground">Total</span>
											<span className="text-base font-bold text-primary">{formatEUR(c.total)}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
