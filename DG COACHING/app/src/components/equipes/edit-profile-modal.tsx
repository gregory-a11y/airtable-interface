"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import {
	X,
	Save,
	User,
	Mail,
	Phone,
	Percent,
	DollarSign,
	Hash,
	FileText,
	Sparkles,
	ChevronDown,
	Shield,
} from "lucide-react";

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

export function EditProfileModal({ member, isAdmin, onClose }: EditProfileModalProps) {
	const updateProfile = useMutation(api.users.updateProfile);

	const [name, setName] = useState(member.name || "");
	const [phone, setPhone] = useState(member.phone || "");
	const [bio, setBio] = useState(member.bio || "");
	const [specialty, setSpecialty] = useState(member.specialty || "");
	const [role, setRole] = useState<"admin" | "sales" | "coach">(
		(member.role as "admin" | "sales" | "coach") || "coach",
	);
	const [status, setStatus] = useState<"active" | "invited" | "disabled">(
		(member.status as "active" | "invited" | "disabled") || "active",
	);
	const [commissionPercent, setCommissionPercent] = useState(
		member.commissionPercent?.toString() || "",
	);
	const [pricePerStudent, setPricePerStudent] = useState(
		member.pricePerStudent?.toString() || "",
	);
	const [maxCapacity, setMaxCapacity] = useState(
		member.maxCapacity?.toString() || "",
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
				if (pricePerStudent) data.pricePerStudent = Number.parseFloat(pricePerStudent);
				if (maxCapacity) data.maxCapacity = Number.parseInt(maxCapacity);
			}

			await updateProfile(data as Parameters<typeof updateProfile>[0]);
			setSaved(true);
			setTimeout(() => {
				setSaved(false);
				onClose();
			}, 1000);
		} finally {
			setLoading(false);
		}
	};

	const initials = name
		? name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={() => {}}
				role="presentation"
			/>
			<div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
					<div className="flex items-center gap-3">
						{member.image ? (
							<img
								src={member.image}
								alt={name}
								className="h-10 w-10 rounded-full object-cover"
							/>
						) : (
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D0003C] text-sm font-bold text-white">
								{initials}
							</div>
						)}
						<div>
							<h2 className="text-lg font-bold text-slate-800">Modifier le profil</h2>
							<p className="text-xs text-slate-500">{member.email}</p>
						</div>
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
				<div className="space-y-5 px-6 py-5">
					{/* Name */}
					<div>
						<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<User size={12} />
							Nom complet
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							placeholder="Prenom Nom"
						/>
					</div>

					{/* Email (readonly) */}
					<div>
						<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<Mail size={12} />
							Email
						</label>
						<input
							type="email"
							value={member.email || ""}
							readOnly
							className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
						/>
					</div>

					{/* Phone */}
					<div>
						<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<Phone size={12} />
							Telephone
						</label>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							placeholder="+33 6 12 34 56 78"
						/>
					</div>

					{/* Bio */}
					<div>
						<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<FileText size={12} />
							Bio
						</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={2}
							className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							placeholder="Une courte bio..."
						/>
					</div>

					{/* Specialty */}
					<div>
						<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
							<Sparkles size={12} />
							Specialite
						</label>
						<input
							type="text"
							value={specialty}
							onChange={(e) => setSpecialty(e.target.value)}
							className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							placeholder="Ex: Perte de poids, Prise de masse..."
						/>
					</div>

					{/* Admin-only fields */}
					{isAdmin && (
						<>
							<div className="border-t border-slate-100 pt-4">
								<p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
									<Shield size={12} />
									Administration
								</p>

								{/* Role */}
								<div className="mb-4">
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
								</div>

								{/* Status toggle */}
								<div>
									<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
										Statut
									</label>
									<div className="flex gap-2">
										{(["active", "disabled"] as const).map((s) => (
											<button
												key={s}
												type="button"
												onClick={() => setStatus(s)}
												className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
													status === s
														? s === "active"
															? "border-green-500 bg-green-50 text-green-700"
															: "border-slate-400 bg-slate-100 text-slate-600"
														: "border-slate-200 text-slate-400 hover:border-slate-300"
												}`}
											>
												{s === "active" ? "In Team" : "Off Team"}
											</button>
										))}
									</div>
								</div>
							</div>
						</>
					)}

					{/* Role-specific fields */}
					{role === "sales" && (
						<div>
							<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
								<Percent size={12} />
								Commission (%)
							</label>
							<input
								type="number"
								value={commissionPercent}
								onChange={(e) => setCommissionPercent(e.target.value)}
								className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
								placeholder="Ex: 10"
								min={0}
								max={100}
							/>
						</div>
					)}

					{role === "coach" && (
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
									<DollarSign size={12} />
									Prix / eleve (EUR)
								</label>
								<input
									type="number"
									value={pricePerStudent}
									onChange={(e) => setPricePerStudent(e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="Ex: 150"
									min={0}
								/>
							</div>
							<div>
								<label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
									<Hash size={12} />
									Max capacite
								</label>
								<input
									type="number"
									value={maxCapacity}
									onChange={(e) => setMaxCapacity(e.target.value)}
									className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
									placeholder="Ex: 20"
									min={0}
								/>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
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
							onClick={handleSave}
							disabled={loading}
							className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00032] disabled:opacity-50"
						>
							{loading ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
							) : saved ? (
								"Sauvegarde !"
							) : (
								<>
									<Save size={14} />
									Sauvegarder
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
