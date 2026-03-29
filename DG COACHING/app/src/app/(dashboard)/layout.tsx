"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { Sidebar } from "@/components/sidebar";
import { useAuthActions } from "@convex-dev/auth/react";
import { Menu, LogOut, User } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const user = useQuery(api.users.currentUser);
	const router = useRouter();
	const { signOut } = useAuthActions();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		if (user === null) {
			router.replace("/login");
		}
	}, [user, router]);

	if (user === undefined) {
		return (
			<div className="flex h-screen items-center justify-center bg-slate-50">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-[#D0003C] border-t-transparent" />
			</div>
		);
	}

	if (user === null) return null;

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Desktop sidebar */}
			<div className="hidden lg:flex">
				<Sidebar userRole={user.role} />
			</div>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-black/50"
						onClick={() => setSidebarOpen(false)}
						onKeyDown={() => {}}
						role="presentation"
					/>
					<div className="relative h-full w-64">
						<Sidebar userRole={user.role} onClose={() => setSidebarOpen(false)} />
					</div>
				</div>
			)}

			{/* Main content */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Header */}
				<header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
					<button
						type="button"
						onClick={() => setSidebarOpen(true)}
						className="lg:hidden"
					>
						<Menu size={22} className="text-slate-600" />
					</button>

					<div className="flex-1" />

					<div className="flex items-center gap-3">
						<div className="text-right">
							<div className="text-sm font-medium text-slate-800">{user.name}</div>
							<div className="text-[11px] capitalize text-slate-400">{user.role}</div>
						</div>
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D0003C] text-xs font-bold text-white">
							{user.name?.charAt(0).toUpperCase() || <User size={14} />}
						</div>
						<button
							type="button"
							onClick={() => signOut().then(() => router.replace("/login"))}
							className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							title="Deconnexion"
						>
							<LogOut size={18} />
						</button>
					</div>
				</header>

				{/* Page content */}
				<main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
}
