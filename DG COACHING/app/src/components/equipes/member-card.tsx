"use client";

import { cn } from "@/lib/utils";
import { Mail, Phone, Percent, DollarSign, Users } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

const ROLE_BADGE: Record<
	string,
	{ label: string; className: string }
> = {
	admin: {
		label: "Admin",
		className: "bg-primary/10 text-primary border border-primary/20",
	},
	sales: {
		label: "Sales",
		className: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
	},
	coach: {
		label: "Coach",
		className:
			"bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
	},
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
	index: number;
	onClick: () => void;
}

export function MemberCard({ member, index, onClick }: MemberCardProps) {
	const role = ROLE_BADGE[member.role || "coach"];
	const isActive = member.status === "active";
	const initial = member.name
		? member.name.charAt(0).toUpperCase()
		: "?";

	return (
		<div
			className="card-premium gradient-border animate-fade-in cursor-pointer"
			style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => {
				if (e.key === "Enter") onClick();
			}}
		>
			<div className="relative p-5">
				{/* Status dot */}
				<div className="absolute top-4 right-4">
					<div
						className={cn(
							"h-2.5 w-2.5 rounded-full",
							isActive
								? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]"
								: "bg-muted-foreground/40"
						)}
					/>
				</div>

				{/* Avatar + Name + Role — centered */}
				<div className="flex flex-col items-center">
					{member.image ? (
						<img
							src={member.image}
							alt={member.name || ""}
							className="h-14 w-14 rounded-full object-cover"
						/>
					) : (
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-white shadow-sm shadow-primary/20">
							{initial}
						</div>
					)}

					<h3 className="mt-3 text-base font-semibold text-foreground text-center truncate max-w-full">
						{member.name || "Sans nom"}
					</h3>

					<span
						className={cn(
							"mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
							role?.className
						)}
					>
						{role?.label || "Coach"}
					</span>
				</div>

				{/* Divider */}
				<div className="mx-0 my-3 border-t border-border/50" />

				{/* Info section */}
				<div className="space-y-2">
					{member.email && (
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Email</span>
							<span className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate max-w-[60%]">
								<Mail size={12} className="flex-shrink-0 text-muted-foreground/60" />
								<span className="truncate">{member.email}</span>
							</span>
						</div>
					)}

					{member.phone && (
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Telephone</span>
							<span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
								<Phone size={12} className="flex-shrink-0 text-muted-foreground/60" />
								{member.phone}
							</span>
						</div>
					)}

					{member.role === "sales" &&
						member.commissionPercent !== undefined && (
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Commission
								</span>
								<span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
									<Percent size={12} className="flex-shrink-0 text-blue-500/60" />
									{member.commissionPercent}%
								</span>
							</div>
						)}

					{member.role === "coach" &&
						member.pricePerStudent !== undefined && (
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">
									Prix / eleve
								</span>
								<span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
									<DollarSign size={12} className="flex-shrink-0 text-emerald-500/60" />
									{member.pricePerStudent} EUR
								</span>
							</div>
						)}

					{member.role === "coach" && (
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">Clients</span>
							<span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
								<Users size={12} className="flex-shrink-0 text-muted-foreground/60" />
								{member.clientCount ?? 0} actif
								{(member.clientCount ?? 0) !== 1 ? "s" : ""}
							</span>
						</div>
					)}
				</div>

				{/* Specialty / Bio */}
				{(member.specialty || member.bio) && (
					<p className="mt-3 text-xs text-muted-foreground italic line-clamp-2">
						{member.specialty || member.bio}
					</p>
				)}
			</div>
		</div>
	);
}
