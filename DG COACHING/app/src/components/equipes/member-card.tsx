"use client";

import { cn } from "@/lib/utils";
import { Mail, Phone, Percent, DollarSign, Users } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

const ROLE_BADGE: Record<string, { label: string; color: string }> = {
	admin: { label: "Admin", color: "bg-violet-100 text-violet-700" },
	sales: { label: "Sales", color: "bg-blue-100 text-blue-700" },
	coach: { label: "Coach", color: "bg-green-100 text-green-700" },
};

const STATUS_DOT: Record<string, { label: string; color: string }> = {
	active: { label: "In Team", color: "bg-green-500" },
	invited: { label: "Invite", color: "bg-amber-500" },
	disabled: { label: "Off Team", color: "bg-slate-400" },
};

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
	clientCount?: number;
}

interface MemberCardProps {
	member: Member;
	onClick: () => void;
}

export function MemberCard({ member, onClick }: MemberCardProps) {
	const role = ROLE_BADGE[member.role || "coach"];
	const status = STATUS_DOT[member.status || "active"];
	const initials = member.name
		? member.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<button
			type="button"
			onClick={onClick}
			className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-slate-300 hover:shadow-md"
		>
			{/* Top section */}
			<div className="flex items-start gap-3">
				{member.image ? (
					<img
						src={member.image}
						alt={member.name || ""}
						className="h-12 w-12 rounded-full object-cover"
					/>
				) : (
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#D0003C] text-sm font-bold text-white">
						{initials}
					</div>
				)}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="truncate text-sm font-semibold text-slate-800">
							{member.name || "Sans nom"}
						</h3>
						<div className={cn("h-2 w-2 rounded-full flex-shrink-0", status.color)} title={status.label} />
					</div>
					<div className="mt-1 flex items-center gap-2">
						<span
							className={cn(
								"inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
								role.color,
							)}
						>
							{role.label}
						</span>
						<span className="text-[11px] text-slate-400">{status.label}</span>
					</div>
				</div>
			</div>

			{/* Bio */}
			{(member.bio || member.specialty) && (
				<p className="mt-3 line-clamp-2 text-xs text-slate-500">
					{member.bio || member.specialty}
				</p>
			)}

			{/* Separator */}
			<div className="my-3 border-t border-slate-100" />

			{/* Contact & stats */}
			<div className="space-y-1.5">
				{member.email && (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<Mail size={12} className="text-slate-400 flex-shrink-0" />
						<span className="truncate">{member.email}</span>
					</div>
				)}
				{member.phone && (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<Phone size={12} className="text-slate-400 flex-shrink-0" />
						{member.phone}
					</div>
				)}
				{member.role === "sales" && member.commissionPercent !== undefined && (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<Percent size={12} className="text-blue-400 flex-shrink-0" />
						Commission : {member.commissionPercent}%
					</div>
				)}
				{member.role === "coach" && member.pricePerStudent !== undefined && (
					<div className="flex items-center gap-2 text-xs text-slate-500">
						<DollarSign size={12} className="text-green-400 flex-shrink-0" />
						{member.pricePerStudent} EUR / eleve
					</div>
				)}
				<div className="flex items-center gap-2 text-xs text-slate-500">
					<Users size={12} className="text-slate-400 flex-shrink-0" />
					{member.clientCount ?? 0} client{(member.clientCount ?? 0) !== 1 ? "s" : ""} actif{(member.clientCount ?? 0) !== 1 ? "s" : ""}
				</div>
			</div>
		</button>
	);
}
