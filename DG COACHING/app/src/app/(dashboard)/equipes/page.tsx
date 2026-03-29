"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
	Users,
	UserPlus,
	Target,
	Dumbbell,
	Shield,
	Search,
	Filter,
	ChevronDown,
} from "lucide-react";
import { MemberCard } from "@/components/equipes/member-card";
import { InviteModal } from "@/components/equipes/invite-modal";
import { EditProfileModal } from "@/components/equipes/edit-profile-modal";
import type { Id } from "../../../../convex/_generated/dataModel";

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

export default function EquipesPage() {
	const currentUser = useQuery(api.users.currentUser);
	const team = useQuery(api.users.listTeam);
	const stats = useQuery(api.users.getTeamStats);

	const [showInvite, setShowInvite] = useState(false);
	const [editMember, setEditMember] = useState<Member | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");

	const isAdmin = currentUser?.role === "admin";

	// Filter team members
	const filteredTeam = (team || []).filter((member) => {
		if (roleFilter && member.role !== roleFilter) return false;
		if (statusFilter && member.status !== statusFilter) return false;
		if (searchQuery) {
			const s = searchQuery.toLowerCase();
			const matchName = member.name?.toLowerCase().includes(s);
			const matchEmail = member.email?.toLowerCase().includes(s);
			if (!matchName && !matchEmail) return false;
		}
		return true;
	});

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D0003C]/10">
						<Users size={20} className="text-[#D0003C]" />
					</div>
					<div>
						<h1 className="text-xl font-bold text-slate-800">Equipe</h1>
						<p className="text-sm text-slate-500">Gestion de l&apos;equipe Prime Coaching</p>
					</div>
				</div>

				{isAdmin && (
					<button
						type="button"
						onClick={() => setShowInvite(true)}
						className="flex items-center gap-2 rounded-lg bg-[#D0003C] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B00032]"
					>
						<UserPlus size={16} />
						Inviter un membre
					</button>
				)}
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				<StatCard
					title="Total membres"
					value={stats?.total ?? 0}
					icon={<Users size={18} />}
					color="slate"
				/>
				<StatCard
					title="Admins"
					value={stats?.admins ?? 0}
					icon={<Shield size={18} />}
					color="violet"
				/>
				<StatCard
					title="Sales"
					value={stats?.sales ?? 0}
					icon={<Target size={18} />}
					color="blue"
				/>
				<StatCard
					title="Coaches"
					value={stats?.coaches ?? 0}
					icon={<Dumbbell size={18} />}
					color="green"
				/>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative flex-1 min-w-[200px]">
					<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						placeholder="Rechercher un membre..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					/>
				</div>

				<div className="relative">
					<Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<select
						value={roleFilter}
						onChange={(e) => setRoleFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-300 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					>
						<option value="">Tous les roles</option>
						<option value="admin">Admin</option>
						<option value="sales">Sales</option>
						<option value="coach">Coach</option>
					</select>
					<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
				</div>

				<div className="relative">
					<Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="appearance-none rounded-lg border border-slate-300 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
					>
						<option value="">Tous les statuts</option>
						<option value="active">In Team</option>
						<option value="invited">Invite</option>
						<option value="disabled">Off Team</option>
					</select>
					<ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
				</div>
			</div>

			{/* Team Grid */}
			{team === undefined ? (
				<div className="flex items-center justify-center py-20">
					<div className="flex items-center gap-2">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-[#D0003C] border-t-transparent" />
						<span className="text-sm text-slate-500">Chargement de l&apos;equipe...</span>
					</div>
				</div>
			) : filteredTeam.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16">
					<Users size={40} className="text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">Aucun membre trouve</p>
					{(searchQuery || roleFilter || statusFilter) && (
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setRoleFilter("");
								setStatusFilter("");
							}}
							className="mt-2 text-xs text-[#D0003C] hover:underline"
						>
							Reinitialiser les filtres
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{filteredTeam.map((member) => (
						<MemberCard
							key={member._id}
							member={member as Member}
							onClick={() => setEditMember(member as Member)}
						/>
					))}
				</div>
			)}

			{/* Count */}
			{filteredTeam.length > 0 && (
				<p className="text-xs text-slate-400">
					{filteredTeam.length} membre{filteredTeam.length > 1 ? "s" : ""}
				</p>
			)}

			{/* Modals */}
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

function StatCard({
	title,
	value,
	icon,
	color,
}: {
	title: string;
	value: number;
	icon: React.ReactNode;
	color: "slate" | "violet" | "blue" | "green";
}) {
	const colorMap = {
		slate: "bg-slate-50 text-slate-600",
		violet: "bg-violet-50 text-violet-600",
		blue: "bg-blue-50 text-blue-600",
		green: "bg-green-50 text-green-600",
	};

	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-xs font-medium uppercase tracking-wider text-slate-400">
						{title}
					</p>
					<p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
				</div>
				<div className={cn("rounded-xl p-2.5", colorMap[color])}>{icon}</div>
			</div>
		</div>
	);
}
