"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	Save,
	User,
	Mail,
	Phone,
	Percent,
	DollarSign,
	Hash,
	FileText,
	Sparkles,
	Shield,
	Loader2,
	CheckCircle2,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
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
		className: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
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
	maxCapacity?: number;
}

interface EditProfileModalProps {
	member: Member;
	isAdmin: boolean;
	onClose: () => void;
}

export function EditProfileModal({
	member,
	isAdmin,
	onClose,
}: EditProfileModalProps) {
	const updateProfile = useMutation(api.users.updateProfile);

	const [name, setName] = useState(member.name || "");
	const [phone, setPhone] = useState(member.phone || "");
	const [bio, setBio] = useState(member.bio || "");
	const [specialty, setSpecialty] = useState(member.specialty || "");
	const [role, setRole] = useState<string>(member.role || "coach");
	const [status, setStatus] = useState<string>(member.status || "active");
	const [commissionPercent, setCommissionPercent] = useState(
		member.commissionPercent?.toString() || ""
	);
	const [pricePerStudent, setPricePerStudent] = useState(
		member.pricePerStudent?.toString() || ""
	);
	const [maxCapacity, setMaxCapacity] = useState(
		member.maxCapacity?.toString() || ""
	);
	const [loading, setLoading] = useState(false);
	const [saved, setSaved] = useState(false);

	const handleSave = async () => {
		setLoading(true);
		try {
			const data: Record<string, unknown> = {
				id: member._id,
				name: name.trim() || undefined,
				phone: phone.trim() || undefined,
				bio: bio.trim() || undefined,
				specialty: specialty.trim() || undefined,
			};

			if (isAdmin) {
				data.role = role;
				data.status = status;
			}

			if (role === "sales" && commissionPercent) {
				data.commissionPercent = Number.parseFloat(commissionPercent);
			}
			if (role === "coach") {
				if (pricePerStudent)
					data.pricePerStudent =
						Number.parseFloat(pricePerStudent);
				if (maxCapacity)
					data.maxCapacity = Number.parseInt(maxCapacity);
			}

			await updateProfile(
				data as Parameters<typeof updateProfile>[0]
			);
			setSaved(true);
			setTimeout(() => {
				setSaved(false);
				onClose();
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	const initial = name
		? name.charAt(0).toUpperCase()
		: "?";
	const roleBadge = ROLE_BADGE[member.role || "coach"];

	return (
		<Dialog
			open
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
		>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				{/* Header with avatar */}
				<DialogHeader>
					<div className="flex items-center gap-3">
						{member.image ? (
							<img
								src={member.image}
								alt={name}
								className="h-12 w-12 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-bold text-white shadow-sm shadow-primary/20">
								{initial}
							</div>
						)}
						<div>
							<DialogTitle className="text-lg font-semibold">
								{member.name || "Sans nom"}
							</DialogTitle>
							<div className="mt-1 flex items-center gap-2">
								<span
									className={cn(
										"inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
										roleBadge?.className
									)}
								>
									{roleBadge?.label}
								</span>
								<DialogDescription className="text-xs">
									{member.email}
								</DialogDescription>
							</div>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Section: Informations */}
					<div className="space-y-4">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Informations
						</p>

						<div className="space-y-3">
							{/* Name */}
							<div className="space-y-1.5">
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<User size={12} />
									Nom complet
								</Label>
								<Input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Prenom Nom"
									className="h-10 rounded-xl"
								/>
							</div>

							{/* Email (readonly) */}
							<div className="space-y-1.5">
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Mail size={12} />
									Email
								</Label>
								<Input
									type="email"
									value={member.email || ""}
									readOnly
									className="h-10 rounded-xl bg-muted cursor-not-allowed"
								/>
							</div>

							{/* Phone */}
							<div className="space-y-1.5">
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Phone size={12} />
									Telephone
								</Label>
								<Input
									type="tel"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+33 6 12 34 56 78"
									className="h-10 rounded-xl"
								/>
							</div>

							{/* Bio */}
							<div className="space-y-1.5">
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<FileText size={12} />
									Bio
								</Label>
								<textarea
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									rows={2}
									className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									placeholder="Une courte bio..."
								/>
							</div>

							{/* Specialty */}
							<div className="space-y-1.5">
								<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
									<Sparkles size={12} />
									Specialite
								</Label>
								<Input
									value={specialty}
									onChange={(e) =>
										setSpecialty(e.target.value)
									}
									placeholder="Ex: Perte de poids, Prise de masse..."
									className="h-10 rounded-xl"
								/>
							</div>
						</div>
					</div>

					{/* Section: Administration (admin only) */}
					{isAdmin && (
						<>
							<div className="border-t border-border/50" />
							<div className="space-y-4">
								<p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
									<Shield size={12} />
									Administration
								</p>

								<div className="space-y-3">
									{/* Role */}
									<div className="space-y-1.5">
										<Label className="text-xs text-muted-foreground">
											Role
										</Label>
										<Select
											value={role}
											onValueChange={setRole}
										>
											<SelectTrigger className="h-10 rounded-xl">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="admin">
													Admin
												</SelectItem>
												<SelectItem value="sales">
													Sales
												</SelectItem>
												<SelectItem value="coach">
													Coach
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Status */}
									<div className="space-y-1.5">
										<Label className="text-xs text-muted-foreground">
											Statut
										</Label>
										<div className="flex gap-2">
											{(
												["active", "disabled"] as const
											).map((s) => (
												<button
													key={s}
													type="button"
													onClick={() =>
														setStatus(s)
													}
													className={cn(
														"flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
														status === s
															? s === "active"
																? "border-emerald-500 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20"
																: "border-primary bg-primary/10 text-primary ring-1 ring-primary/20"
															: "border-border text-muted-foreground hover:border-primary/30"
													)}
												>
													{s === "active"
														? "In Team"
														: "Off Team"}
												</button>
											))}
										</div>
									</div>
								</div>
							</div>
						</>
					)}

					{/* Section: Parametres commerciaux (role-specific) */}
					{(role === "sales" || role === "coach") && (
						<>
							<div className="border-t border-border/50" />
							<div className="space-y-4">
								<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									Parametres commerciaux
								</p>

								<div className="space-y-3">
									{role === "sales" && (
										<div className="space-y-1.5">
											<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
												<Percent size={12} />
												Commission (%)
											</Label>
											<Input
												type="number"
												value={commissionPercent}
												onChange={(e) =>
													setCommissionPercent(
														e.target.value
													)
												}
												placeholder="Ex: 10"
												min={0}
												max={100}
												className="h-10 rounded-xl"
											/>
										</div>
									)}

									{role === "coach" && (
										<div className="grid grid-cols-2 gap-3">
											<div className="space-y-1.5">
												<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<DollarSign size={12} />
													Prix / eleve (EUR)
												</Label>
												<Input
													type="number"
													value={pricePerStudent}
													onChange={(e) =>
														setPricePerStudent(
															e.target.value
														)
													}
													placeholder="Ex: 150"
													min={0}
													className="h-10 rounded-xl"
												/>
											</div>
											<div className="space-y-1.5">
												<Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
													<Hash size={12} />
													Max capacite
												</Label>
												<Input
													type="number"
													value={maxCapacity}
													onChange={(e) =>
														setMaxCapacity(
															e.target.value
														)
													}
													placeholder="Ex: 20"
													min={0}
													className="h-10 rounded-xl"
												/>
											</div>
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>

				{/* Save button */}
				<Button
					onClick={handleSave}
					disabled={loading}
					className="mt-2 h-11 w-full rounded-xl"
				>
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : saved ? (
						<>
							<CheckCircle2 size={14} />
							Sauvegarde
						</>
					) : (
						<>
							<Save size={14} />
							Sauvegarder
						</>
					)}
				</Button>
			</DialogContent>
		</Dialog>
	);
}
