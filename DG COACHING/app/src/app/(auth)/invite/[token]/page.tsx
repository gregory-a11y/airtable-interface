"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function InvitePage() {
	const { signIn } = useAuthActions();
	const router = useRouter();
	const params = useParams();
	const token = params.token as string;

	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas");
			return;
		}
		if (password.length < 8) {
			setError("Le mot de passe doit contenir au moins 8 caracteres");
			return;
		}
		setLoading(true);
		try {
			await signIn("password", {
				email: `invite-${token}@temp.com`,
				password,
				flow: "signUp",
			});
			router.replace("/overview");
		} catch {
			setError("Erreur lors de la creation du compte. Le lien est peut-etre expire.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex justify-center">
					<Image
						src="/logo-complet-rouge.png"
						alt="Prime Coaching"
						width={220}
						height={60}
						priority
					/>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h1 className="mb-1 text-center text-xl font-bold text-slate-800">
						Bienvenue dans l'equipe
					</h1>
					<p className="mb-6 text-center text-sm text-slate-500">
						Creez votre compte pour rejoindre Prime Coaching
					</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="name"
								className="mb-1.5 block text-sm font-medium text-slate-700"
							>
								Nom complet
							</label>
							<input
								id="name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Votre nom"
								required
								className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="mb-1.5 block text-sm font-medium text-slate-700"
							>
								Mot de passe
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Minimum 8 caracteres"
								required
								className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							/>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="mb-1.5 block text-sm font-medium text-slate-700"
							>
								Confirmer le mot de passe
							</label>
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Confirmez votre mot de passe"
								required
								className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							/>
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-[#D0003C] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B80035] disabled:opacity-50"
						>
							{loading ? "Creation..." : "Creer mon compte"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
