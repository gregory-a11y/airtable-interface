"use client";

import { useAuth } from "@/components/convex-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, Check, X, Shield, ArrowRight } from "lucide-react";
import { validatePassword, getPasswordStrength } from "@/lib/password-validation";

export default function ChangePasswordPage() {
	const { user, changePassword, isLoading } = useAuth();
	const router = useRouter();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!isLoading && !user) router.replace("/login");
		if (user && !user.mustChangePassword) router.replace("/sales/dashboard");
	}, [user, isLoading, router]);

	if (isLoading || !user) return null;

	const validation = validatePassword(newPassword);
	const strength = getPasswordStrength(newPassword);
	const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!validation.isValid) { setError("Le mot de passe ne respecte pas les criteres"); return; }
		if (!passwordsMatch) { setError("Les mots de passe ne correspondent pas"); return; }
		if (newPassword === currentPassword) { setError("Le nouveau doit etre different du temporaire"); return; }
		setLoading(true);
		try {
			await changePassword(currentPassword, newPassword);
			setDone(true);
			setTimeout(() => router.replace("/sales/dashboard"), 1500);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Erreur lors du changement");
		} finally {
			setLoading(false);
		}
	};

	if (done) {
		return (
			<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] dark:bg-[#0A0A0F]">
				<div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
					<div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] animate-pulse rounded-full bg-emerald-500/[0.07] blur-[120px]" style={{ animationDuration: "8s" }} />
				</div>
				<div className="relative z-10 text-center">
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
						<Check className="h-7 w-7 text-emerald-400" />
					</div>
					<h2 className="text-lg font-bold text-foreground dark:text-white">Mot de passe mis a jour !</h2>
					<p className="mt-1 text-sm text-muted-foreground dark:text-white/40">Redirection...</p>
				</div>
			</div>
		);
	}

	const rules = [
		{ test: newPassword.length >= 8, label: "8 caracteres minimum" },
		{ test: /[A-Z]/.test(newPassword), label: "1 majuscule" },
		{ test: /[a-z]/.test(newPassword), label: "1 minuscule" },
		{ test: /[0-9]/.test(newPassword), label: "1 chiffre" },
		{ test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword), label: "1 caractere special" },
	];

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] px-4 dark:bg-[#0A0A0F]">
			{/* Animated gradient orbs — dark mode only */}
			<div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
				<div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] animate-pulse rounded-full bg-primary/[0.07] blur-[120px]" style={{ animationDuration: "8s" }} />
				<div className="absolute -right-[20%] -bottom-[40%] h-[70vh] w-[70vh] animate-pulse rounded-full bg-primary/[0.05] blur-[120px]" style={{ animationDuration: "12s", animationDelay: "2s" }} />
			</div>

			{/* Red glow effect — dark mode only */}
			<div className="pointer-events-none fixed inset-0 hidden overflow-hidden dark:block">
				<div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[120px]" />
				<div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-primary/[0.04] blur-[100px]" />
			</div>

			{/* Subtle grid pattern — dark mode only */}
			<div
				className="pointer-events-none fixed inset-0 hidden opacity-[0.02] dark:block"
				style={{
					backgroundImage: "linear-gradient(rgba(208,0,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(208,0,60,0.3) 1px, transparent 1px)",
					backgroundSize: "40px 40px",
				}}
			/>

			{/* Light mode subtle background */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.4] dark:hidden"
				style={{
					backgroundImage: "radial-gradient(circle at 50% 50%, rgba(208,0,60,0.03) 0%, transparent 70%)",
				}}
			/>

			{/* Content */}
			<div
				className="relative z-10 w-full max-w-[420px]"
				style={{
					opacity: mounted ? 1 : 0,
					transform: mounted ? "translateY(0)" : "translateY(12px)",
					transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
				}}
			>
				{/* Logo */}
				<div className="mb-10 flex justify-center">
					<Image src="/logo-complet-rouge.png" alt="Prime Coaching" width={200} height={56} priority className="dark:drop-shadow-[0_0_30px_rgba(208,0,60,0.3)]" />
				</div>

				{/* Card */}
				<div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-xl shadow-black/[0.04] dark:border-white/[0.06] dark:bg-[#1A1A19] dark:shadow-2xl dark:shadow-black/40 dark:ring-1 dark:ring-white/[0.06] dark:backdrop-blur-xl">
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
							<Shield className="h-5 w-5 text-amber-400" />
						</div>
						<div>
							<h1 className="text-lg font-semibold tracking-tight text-foreground dark:text-white">Nouveau mot de passe</h1>
							<p className="text-xs text-muted-foreground dark:text-white/40">Securisez votre compte</p>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-white/50">
								Mot de passe temporaire
							</label>
							<div className="relative">
								<input
									type={showCurrent ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Mot de passe recu par email"
									required
									className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 dark:focus:border-primary/50 dark:focus:ring-primary/20"
								/>
								<button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground dark:text-white/25 dark:hover:text-white/50" tabIndex={-1}>
									{showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>

						<div>
							<label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-white/50">
								Nouveau mot de passe
							</label>
							<div className="relative">
								<input
									type={showNew ? "text" : "password"}
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder="Choisissez un mot de passe fort"
									required
									className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 dark:focus:border-primary/50 dark:focus:ring-primary/20"
								/>
								<button type="button" onClick={() => setShowNew(!showNew)} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground dark:text-white/25 dark:hover:text-white/50" tabIndex={-1}>
									{showNew ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>

							{newPassword.length > 0 && (
								<>
									{/* Strength bar */}
									<div className="mt-3 mb-2 flex gap-1">
										{[1, 2, 3, 4, 5, 6].map((n) => (
											<div key={n} className={`h-1 flex-1 rounded-full transition-colors ${n <= strength.score ? strength.color : "bg-muted dark:bg-white/10"}`} />
										))}
									</div>

									{/* Rules */}
									<div className="space-y-1.5">
										{rules.map((r) => (
											<div key={r.label} className="flex items-center gap-2 text-xs">
												{r.test ? (
													<Check size={12} className="text-emerald-400" />
												) : (
													<X size={12} className="text-muted-foreground/30 dark:text-white/20" />
												)}
												<span className={r.test ? "text-emerald-400" : "text-muted-foreground/50 dark:text-white/30"}>
													{r.label}
												</span>
											</div>
										))}
									</div>
								</>
							)}
						</div>

						<div>
							<label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-white/50">
								Confirmer le mot de passe
							</label>
							<input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Repetez le mot de passe"
								required
								className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-200 focus:ring-1 dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 ${
									confirmPassword.length > 0
										? passwordsMatch
											? "border-emerald-500/40 focus:border-emerald-500/60 focus:ring-emerald-500/30"
											: "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/30"
										: "border-border focus:border-primary/40 focus:ring-primary/20 dark:border-white/[0.08] dark:focus:border-primary/50 dark:focus:ring-primary/20"
								}`}
							/>
						</div>

						{error && (
							<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading || !validation.isValid || !passwordsMatch}
							className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 dark:shadow-lg dark:shadow-primary/25 dark:hover:shadow-xl dark:hover:shadow-primary/30"
						>
							{loading ? (
								<span className="flex items-center gap-2.5">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Mise a jour...
								</span>
							) : (
								<>
									Changer mon mot de passe
									<ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
								</>
							)}
						</button>
					</form>
				</div>

				{/* Footer */}
				<p className="mt-8 text-center text-xs text-muted-foreground/40 dark:text-white/15">
					Prime Coaching &mdash; Espace Equipe
				</p>
			</div>
		</div>
	);
}
