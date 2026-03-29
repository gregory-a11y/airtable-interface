"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function LoginPage() {
	const { signIn } = useAuthActions();
	const user = useQuery(api.users.currentUser);
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) router.replace("/overview");
	}, [user, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await signIn("password", { email, password, flow: "signIn" });
			router.replace("/overview");
		} catch {
			setError("Email ou mot de passe incorrect");
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
					<h1 className="mb-1 text-center text-xl font-bold text-slate-800">Connexion</h1>
					<p className="mb-6 text-center text-sm text-slate-500">
						Accedez a votre espace Prime Coaching
					</p>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="mb-1.5 block text-sm font-medium text-slate-700"
							>
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="votre@email.com"
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
								placeholder="••••••••"
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
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
									Connexion...
								</span>
							) : (
								"Se connecter"
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
