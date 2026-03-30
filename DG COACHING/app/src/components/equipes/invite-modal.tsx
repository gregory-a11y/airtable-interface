"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	Send,
	Mail,
	Shield,
	Target,
	Dumbbell,
	Loader2,
	CheckCircle2,
	User,
	Phone,
	Sparkles,
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
import type { Id } from "../../../convex/_generated/dataModel";

interface InviteModalProps {
	onClose: () => void;
}

const ROLE_OPTIONS = [
	{
		value: "admin",
		label: "Admin",
		description: "Acces complet a toutes les fonctionnalites",
		icon: Shield,
		activeColor: "border-violet-500 bg-violet-500/5 ring-1 ring-violet-500/20",
		iconColor: "text-violet-600",
		iconBg: "bg-violet-500/10",
	},
	{
		value: "sales",
		label: "Sales",
		description: "Acces au CRM, closing et setting",
		icon: Target,
		activeColor: "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500/20",
		iconColor: "text-blue-600",
		iconBg: "bg-blue-500/10",
	},
	{
		value: "coach",
		label: "Coach",
		description: "Acces aux fiches clients et bilans",
		icon: Dumbbell,
		activeColor: "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20",
		iconColor: "text-emerald-600",
		iconBg: "bg-emerald-500/10",
	},
] as const;

export function InviteModal({ onClose }: InviteModalProps) {
	const inviteAndSendEmail = useAction(api.auth.inviteAndSendEmail);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [specialty, setSpecialty] = useState("");
	const [role, setRole] = useState<string>("sales");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleInvite = async () => {
		if (!name.trim()) {
			setError("Veuillez entrer un nom");
			return;
		}
		if (!email.trim()) {
			setError("Veuillez entrer un email");
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError("Email invalide");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const siteUrl = window.location.origin;
			await inviteAndSendEmail({
				email: email.trim(),
				name: name.trim(),
				role: role as "admin" | "sales" | "coach",
				siteUrl,
			});

			setSuccess(true);
			setTimeout(() => onClose(), 2500);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Erreur lors de l'invitation"
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open
			onOpenChange={(v) => {
				if (!v) onClose();
			}}
		>
			<DialogContent className="max-w-md p-0 overflow-hidden">
				<div className="p-6">
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold">
							Inviter un membre
						</DialogTitle>
						<DialogDescription>
							Ajoutez un nouveau membre a l&apos;equipe
						</DialogDescription>
					</DialogHeader>

					{success ? (
						<div className="flex flex-col items-center gap-5 py-10 animate-fade-in">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 animate-success-check">
								<CheckCircle2
									size={40}
									className="text-emerald-500"
								/>
							</div>
							<div className="text-center">
								<p className="text-lg font-semibold text-foreground">
									Membre ajoute
								</p>
								<p className="mt-1.5 text-sm text-muted-foreground">
									<span className="font-medium text-foreground">{name}</span> a ete invite avec succes
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{email}
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-6 mt-5 animate-fade-in">
							{/* ── Section: Informations ── */}
							<div className="space-y-4">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Informations
								</p>

								{/* Nom complet */}
								<div className="space-y-1.5">
									<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Nom complet *
									</Label>
									<div className="relative">
										<User
											size={15}
											className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											type="text"
											value={name}
											onChange={(e) => {
												setName(e.target.value);
												setError("");
											}}
											placeholder="Jean Dupont"
											className="h-10 rounded-xl pl-10 border-border"
											autoFocus
										/>
									</div>
								</div>

								{/* Email */}
								<div className="space-y-1.5">
									<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Email *
									</Label>
									<div className="relative">
										<Mail
											size={15}
											className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											type="email"
											value={email}
											onChange={(e) => {
												setEmail(e.target.value);
												setError("");
											}}
											placeholder="nom@exemple.com"
											className="h-10 rounded-xl pl-10 border-border"
										/>
									</div>
								</div>

								{/* Telephone */}
								<div className="space-y-1.5">
									<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Telephone
									</Label>
									<div className="relative">
										<Phone
											size={15}
											className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											type="tel"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											placeholder="+33 6 12 34 56 78"
											className="h-10 rounded-xl pl-10 border-border"
										/>
									</div>
								</div>
							</div>

							{/* ── Section: Role & Specialite ── */}
							<div className="space-y-4">
								<p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Role & Specialite
								</p>

								{/* Role selector — visual cards */}
								<div className="grid grid-cols-3 gap-2">
									{ROLE_OPTIONS.map((opt) => {
										const Icon = opt.icon;
										const isSelected = role === opt.value;
										return (
											<button
												key={opt.value}
												type="button"
												onClick={() => setRole(opt.value)}
												className={cn(
													"flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all",
													isSelected
														? opt.activeColor
														: "border-border hover:border-primary/30"
												)}
											>
												<div
													className={cn(
														"flex h-10 w-10 items-center justify-center rounded-xl",
														isSelected
															? opt.iconBg
															: "bg-muted"
													)}
												>
													<Icon
														size={18}
														className={
															isSelected
																? opt.iconColor
																: "text-muted-foreground"
														}
													/>
												</div>
												<div className="text-center">
													<span
														className={cn(
															"text-xs font-semibold block",
															isSelected
																? "text-foreground"
																: "text-muted-foreground"
														)}
													>
														{opt.label}
													</span>
													<span className="text-[10px] text-muted-foreground leading-tight mt-0.5 block">
														{opt.description}
													</span>
												</div>
											</button>
										);
									})}
								</div>

								{/* Specialite */}
								<div className="space-y-1.5">
									<Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										Specialite
									</Label>
									<div className="relative">
										<Sparkles
											size={15}
											className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground"
										/>
										<Input
											type="text"
											value={specialty}
											onChange={(e) => setSpecialty(e.target.value)}
											placeholder="Closing, Setting, Coaching sportif..."
											className="h-10 rounded-xl pl-10 border-border"
										/>
									</div>
								</div>
							</div>

							{error && (
								<p className="text-sm text-destructive">{error}</p>
							)}

							{/* Submit */}
							<Button
								onClick={handleInvite}
								disabled={loading}
								className="h-11 w-full rounded-xl"
							>
								{loading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send size={14} />
								)}
								Envoyer l&apos;invitation
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
