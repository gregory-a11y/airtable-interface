"use client";

import { useAuth } from "@/components/convex-provider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
	const { user, signIn, isLoading } = useAuth();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (user) {
			if (user.mustChangePassword) {
				router.replace("/change-password");
			} else {
				router.replace("/sales/dashboard");
			}
		}
	}, [user, router]);

	if (isLoading) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const result = await signIn(email, password);
			if (result.user.mustChangePassword) {
				router.replace("/change-password");
			} else {
				router.replace("/sales/dashboard");
			}
		} catch (err: any) {
			setError(err?.message || "Email ou mot de passe incorrect");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFA] px-4 dark:bg-[#0A0A0F]">
			{/* Animated gradient orbs — dark mode only */}
			<div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
				<div className="absolute -top-[40%] -left-[20%] h-[80vh] w-[80vh] animate-pulse rounded-full bg-primary/[0.07] blur-[120px]" style={{ animationDuration: "8s" }} />
				<div className="absolute -right-[20%] -bottom-[40%] h-[70vh] w-[70vh] animate-pulse rounded-full bg-primary/[0.05] blur-[120px]" style={{ animationDuration: "12s", animationDelay: "2s" }} />
				<div className="absolute top-[20%] right-[10%] h-[40vh] w-[40vh] animate-pulse rounded-full bg-primary/[0.04] blur-[100px]" style={{ animationDuration: "10s", animationDelay: "4s" }} />
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

			{/* Light mode subtle background pattern */}
			<div
				className="pointer-events-none absolute inset-0 opacity-[0.4] dark:hidden"
				style={{
					backgroundImage: "radial-gradient(circle at 50% 50%, rgba(208,0,60,0.03) 0%, transparent 70%)",
				}}
			/>

			{/* Content */}
			<div
				className="relative z-10 w-full max-w-[400px]"
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
					<div className="mb-8">
						<h1 className="text-[22px] font-semibold tracking-tight text-foreground dark:text-white">Connexion</h1>
						<p className="mt-1.5 text-sm text-muted-foreground dark:text-white/40">Accedez a votre espace de gestion</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label htmlFor="email" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-white/50">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="votre@email.com"
								required
								autoComplete="email"
								className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 dark:focus:border-primary/50 dark:focus:ring-primary/20"
							/>
						</div>
						<div>
							<label htmlFor="password" className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground dark:text-white/50">
								Mot de passe
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Votre mot de passe"
									required
									autoComplete="current-password"
									className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-11 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all duration-200 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 dark:focus:border-primary/50 dark:focus:ring-primary/20"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground/40 transition-colors hover:text-muted-foreground dark:text-white/25 dark:hover:text-white/50"
									tabIndex={-1}
								>
									{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
								</button>
							</div>
						</div>

						{error && (
							<div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 dark:shadow-lg dark:shadow-primary/25 dark:hover:shadow-xl dark:hover:shadow-primary/30"
						>
							{loading ? (
								<span className="flex items-center gap-2.5">
									<span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
									Connexion...
								</span>
							) : (
								<>
									Se connecter
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
