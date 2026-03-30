"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/components/convex-provider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
	Users,
	UserPlus,
	Target,
	Dumbbell,
	Shield,
	Search,
	Loader2,
	Settings,
	Pencil,
	Trash2,
} from "lucide-react";
import { InviteModal } from "@/components/equipes/invite-modal";
import { EditProfileModal } from "@/components/equipes/edit-profile-modal";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Member {
	_id: Id<"users">;
	name?: string;
	email?: string;
	phone?: string;
	role?: string;
	status?: string;
	bio?: string;
	specialty?: string;
	image?: string;
	commissionPercent?: number;
	pricePerStudent?: number;
	maxCapacity?: number;
	clientCount?: number;
}

const ROLE_FILTERS = [
	{ value: "all", label: "Tous" },
	{ value: "admin", label: "Admin" },
	{ value: "sales", label: "Sales" },
	{ value: "coach", label: "Coach" },
] as const;

const ROLE_BADGE: Record<string, string> = {
	admin: "bg-primary/10 dark:bg-primary/15 text-primary border border-primary/20",
	sales: "bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
	coach: "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
};

const KPI_CONFIG = [
	{ key: "total", title: "Total utilisateurs", icon: Users, iconColor: "text-primary", ring: "ring-primary/10" },
	{ key: "admins", title: "Actifs", icon: Shield, iconColor: "text-emerald-500", ring: "ring-emerald-500/10" },
	{ key: "admins", title: "Admins", icon: Shield, iconColor: "text-violet-500 dark:text-violet-400", ring: "ring-violet-500/10" },
] as const;

export default function EquipesPage() {
	const { user: currentUser } = useAuth();
	const team = useQuery(api.users.listTeam);
	const stats = useQuery(api.users.getTeamStats);

	const [showInvite, setShowInvite] = useState(false);
	const [editMember, setEditMember] = useState<Member | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	const isAdmin = currentUser?.role === "admin";

	const filteredTeam = (team || []).filter((member) => {
		if (roleFilter !== "all" && member.role !== roleFilter) return false;
		if (searchQuery) {
			const s = searchQuery.toLowerCase();
			const matchName = member.name?.toLowerCase().includes(s);
			const matchEmail = member.email?.toLowerCase().includes(s);
			if (!matchName && !matchEmail) return false;
		}
		return true;
	});

	const activeCount = (team || []).filter((m) => m.status === "active").length;

	return (
		<div className="mx-auto max-w-7xl space-y-7 animate-page-enter">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/10">
						<Settings size={22} className="text-primary" />
					</div>
					<div>
						<h1 className="text-2xl font-bold tracking-tight text-foreground">
							Gestion Utilisateurs
						</h1>
						<p className="mt-0.5 text-sm text-muted-foreground">
							Gerez les comptes et permissions de votre equipe
						</p>
					</div>
				</div>

				{isAdmin && (
					<Button
						onClick={() => setShowInvite(true)}
						className="gap-2 rounded-xl h-10 px-5"
					>
						<UserPlus size={16} />
						Inviter un membre
					</Button>
				)}
			</div>

			{/* KPI Stats — 3 cards */}
			<div className="grid grid-cols-3 gap-4">
				{[
					{ title: "Total utilisateurs", value: stats?.total ?? 0 },
					{ title: "Actifs", value: activeCount, color: "text-emerald-500" },
					{ title: "Admins", value: stats?.admins ?? 0, color: "text-primary" },
				].map((kpi, i) => (
					<div
						key={kpi.title}
						className="card-premium p-5 animate-fade-in"
						style={{ animationDelay: `${i * 0.08}s` }}
					>
						<p className="text-sm text-muted-foreground">{kpi.title}</p>
						<p className={cn("mt-1 text-2xl font-bold tabular-nums", kpi.color || "text-foreground")}>
							{kpi.value}
						</p>
					</div>
				))}
			</div>

			{/* Search bar */}
			<div className="relative max-w-md">
				<Search
					size={16}
					className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
				/>
				<Input
					type="text"
					placeholder="Rechercher un utilisateur..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-10 rounded-xl pl-10 bg-card dark:bg-[#2A2A28]"
				/>
			</div>

			{/* Users Table */}
			{team === undefined ? (
				<div className="flex items-center justify-center py-24">
					<Loader2 className="h-6 w-6 animate-spin text-primary" />
				</div>
			) : filteredTeam.length === 0 ? (
				<div className="card-premium flex flex-col items-center justify-center py-20">
					<Users size={28} className="text-muted-foreground/30 mb-3" />
					<p className="text-sm text-muted-foreground">Aucun utilisateur trouve</p>
				</div>
			) : (
				<div className="card-premium overflow-hidden">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border/30 bg-muted/30">
								<th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Utilisateur</th>
								<th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
								<th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
								<th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Specialite</th>
								<th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
								{isAdmin && (
									<th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
								)}
							</tr>
						</thead>
						<tbody>
							{filteredTeam.map((member, i) => {
								const isActive = member.status === "active";
								const isInvited = member.status === "invited";
								return (
									<tr
										key={member._id}
										className="table-row-hover border-b border-border/20 animate-fade-in"
										style={{ animationDelay: `${i * 0.04}s` }}
									>
										{/* User */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-white">
													{member.name ? `${member.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}` : "?"}
												</div>
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium text-foreground">{member.name}</span>
													{isInvited && (
														<span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
															Invite
														</span>
													)}
												</div>
											</div>
										</td>

										{/* Email */}
										<td className="px-5 py-4 text-sm text-muted-foreground">
											{member.email}
										</td>

										{/* Role */}
										<td className="px-5 py-4">
											<span className={cn(
												"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
												ROLE_BADGE[member.role || ""] || "bg-muted text-muted-foreground"
											)}>
												{member.role === "admin" && <Shield size={12} />}
												{member.role === "sales" && <Target size={12} />}
												{member.role === "coach" && <Dumbbell size={12} />}
												{member.role === "admin" ? "Admin" : member.role === "sales" ? "Sales" : "Coach"}
											</span>
										</td>

										{/* Specialty */}
										<td className="px-5 py-4">
											{member.specialty ? (
												<span className="inline-flex items-center rounded-full bg-muted dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-foreground">
													{member.specialty}
												</span>
											) : (
												<span className="text-xs text-muted-foreground/50">—</span>
											)}
										</td>

										{/* Status */}
										<td className="px-5 py-4">
											<div className="flex items-center gap-2">
												<div className={cn(
													"h-2 w-2 rounded-full",
													isActive ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" : "bg-gray-400"
												)} />
												<span className={cn(
													"text-xs font-medium",
													isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
												)}>
													{isActive ? "Actif" : isInvited ? "Invite" : "Inactif"}
												</span>
											</div>
										</td>

										{/* Actions */}
										{isAdmin && (
											<td className="px-5 py-4">
												<div className="flex items-center justify-end gap-1.5">
													<button
														type="button"
														onClick={() => setEditMember(member as Member)}
														className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
														title="Modifier"
													>
														<Pencil size={15} />
													</button>
												</div>
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{filteredTeam.length > 0 && (
				<p className="text-xs text-muted-foreground">
					{filteredTeam.length} utilisateur{filteredTeam.length > 1 ? "s" : ""}
				</p>
			)}

			{showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
			{editMember && (
				<EditProfileModal
					member={editMember}
					isAdmin={isAdmin}
					onClose={() => setEditMember(null)}
				/>
			)}
		</div>
	);
}
