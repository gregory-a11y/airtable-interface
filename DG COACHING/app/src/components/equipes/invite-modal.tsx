"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { X, Send, Mail, UserPlus, ChevronDown } from "lucide-react";

interface InviteModalProps {
	onClose: () => void;
}

export function InviteModal({ onClose }: InviteModalProps) {
	const invite = useMutation(api.users.invite);
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"admin" | "sales" | "coach">("sales");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleInvite = async () => {
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
			await invite({ email: email.trim(), role });
			setSuccess(true);
			setTimeout(() => onClose(), 1500);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Erreur lors de l'invitation");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={() => {}}
				role="presentation"
			/>
			<div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
					<div className="flex items-center gap-2">
						<UserPlus size={20} className="text-[#D0003C]" />
						<h2 className="text-lg font-bold text-slate-800">Inviter un membre</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="space-y-4 px-6 py-5">
					{success ? (
						<div className="flex flex-col items-center gap-3 py-6">
							<div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
								<Send size={20} className="text-green-600" />
							</div>
							<p className="text-sm font-medium text-green-700">
								Invitation envoyee avec succes !
							</p>
							<p className="text-xs text-slate-500">{email}</p>
						</div>
					) : (
						<>
							{/* Email */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
									Adresse email
								</label>
								<div className="relative">
									<Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
									<input
										type="email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setError("");
										}}
										placeholder="nom@exemple.com"
										className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
										autoFocus
									/>
								</div>
							</div>

							{/* Role */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
									Role
								</label>
								<div className="relative">
									<select
										value={role}
										onChange={(e) => setRole(e.target.value as "admin" | "sales" | "coach")}
										className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									>
										<option value="admin">Admin</option>
										<option value="sales">Sales</option>
										<option value="coach">Coach</option>
									</select>
									<ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
								</div>
								<p className="mt-1.5 text-xs text-slate-400">
									{role === "admin" && "Acces complet a toutes les fonctionnalites"}
									{role === "sales" && "Acces au CRM, closing et setting"}
									{role === "coach" && "Acces aux fiches clients et bilans"}
								</p>
							</div>

							{/* Error */}
							{error && (
								<p className="text-sm text-red-600">{error}</p>
							)}
						</>
					)}
				</div>

				{/* Footer */}
				{!success && (
					<div className="border-t border-slate-200 px-6 py-4">
						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={onClose}
								className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
							>
								Annuler
							</button>
							<button
								type="button"
								onClick={handleInvite}
								disabled={loading}
								className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00032] disabled:opacity-50"
							>
								{loading ? (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								) : (
									<Send size={14} />
								)}
								Envoyer l&apos;invitation
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
