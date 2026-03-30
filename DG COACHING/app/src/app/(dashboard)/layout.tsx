"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/convex-provider";
import { Sidebar } from "@/components/sidebar";
import { Menu, ChevronRight, Sun, Moon } from "lucide-react";

const breadcrumbLabels: Record<string, string> = {
	sales: "Sales / Closing",
	dashboard: "Dashboard",
	pipeline: "Pipeline Vente",
	crm: "CRM",
	calls: "Gestion des Calls",
	"new-close": "New Close",
	payments: "Suivi Paiements",
	operationnel: "Operationnel",
	clients: "Fiches Clients",
	equipes: "Gestion Utilisateurs",
};

function Breadcrumbs() {
	const pathname = usePathname();
	const segments = pathname.split("/").filter(Boolean);

	if (segments.length === 0) return null;

	return (
		<div className="flex items-center gap-1.5 text-sm">
			{segments.map((segment, i) => {
				const isLast = i === segments.length - 1;
				const label =
					breadcrumbLabels[segment] ||
					segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
				return (
					<span key={segment} className="flex items-center gap-1.5">
						{i > 0 && <ChevronRight size={12} className="text-muted-foreground/40" />}
						<span className={isLast ? "font-medium text-foreground" : "text-muted-foreground"}>
							{label}
						</span>
					</span>
				);
			})}
		</div>
	);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const { user, signOut, isLoading } = useAuth();
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		const dark = stored !== "light";
		setIsDark(dark);
		// Sync class in case inline script missed or SSR mismatch
		if (dark) {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, []);

	const toggleTheme = () => {
		const next = !isDark;
		setIsDark(next);
		if (next) {
			document.documentElement.classList.add("dark");
			localStorage.setItem("theme", "dark");
		} else {
			document.documentElement.classList.remove("dark");
			localStorage.setItem("theme", "light");
		}
	};

	useEffect(() => {
		if (!isLoading && !user) {
			router.replace("/login");
		} else if (user?.mustChangePassword) {
			router.replace("/change-password");
		}
	}, [user, isLoading, router]);

	if (isLoading || user === undefined) {
		return (
			<div className="flex h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-3">
					<div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
					<span className="text-xs text-muted-foreground">Chargement...</span>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const handleLogout = async () => {
		await signOut();
		router.replace("/login");
	};

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{/* Desktop sidebar */}
			<div className="hidden lg:block">
				<Sidebar
					userRole={user.role}
					userName={user.name}
					collapsed={collapsed}
					onToggleCollapse={() => setCollapsed(!collapsed)}
					onLogout={handleLogout}
				/>
			</div>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setSidebarOpen(false)}
						onKeyDown={() => {}}
						role="presentation"
					/>
					<div className="relative h-full w-64 shadow-2xl">
						<Sidebar userRole={user.role} userName={user.name} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
					</div>
				</div>
			)}

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Header */}
				<header className="header-blur flex h-16 shrink-0 items-center gap-3 border-b border-border/40 bg-card/80 backdrop-blur-md dark:bg-[#0F0F0E]/80 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:px-6">
					{/* Left: mobile menu */}
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
					>
						<Menu size={20} />
					</button>

					{/* Breadcrumbs */}
					<div className="hidden lg:block">
						<Breadcrumbs />
					</div>

					{/* Spacer */}
					<div className="flex-1" />

					{/* Right: dark mode toggle */}
					<button
						type="button"
						onClick={toggleTheme}
						className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						title={isDark ? "Mode clair" : "Mode sombre"}
					>
						{isDark ? <Sun size={17} /> : <Moon size={17} />}
					</button>
				</header>

				{/* Page content */}
				<main className="dot-pattern flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
			</div>
		</div>
	);
}
