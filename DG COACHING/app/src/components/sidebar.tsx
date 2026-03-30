"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	Target,
	BarChart3,
	Kanban,
	Users,
	Phone,
	Sparkles,
	CreditCard,
	FileText,
	X,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	LogOut,
	User,
	Settings,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
	label: string;
	href: string;
	icon: React.ReactNode;
	roles?: string[];
	children?: NavItem[];
}

const navigation: NavItem[] = [
	{
		label: "Sales / Closing",
		href: "/sales",
		icon: <Target size={20} />,
		roles: ["admin", "sales"],
		children: [
			{ label: "Dashboard", href: "/sales/dashboard", icon: <BarChart3 size={17} /> },
			{ label: "Pipeline Vente", href: "/sales/pipeline", icon: <Kanban size={17} /> },
			{ label: "CRM", href: "/sales/crm", icon: <Users size={17} /> },
			{ label: "Gestion des Calls", href: "/sales/calls", icon: <Phone size={17} /> },
			{ label: "New Close", href: "/sales/new-close", icon: <Sparkles size={17} /> },
			{ label: "Suivi Paiements", href: "/sales/payments", icon: <CreditCard size={17} /> },
		],
	},
	{
		label: "Fiches Clients",
		href: "/operationnel/clients",
		icon: <FileText size={20} />,
	},
	{
		label: "Gestion Utilisateurs",
		href: "/equipes",
		icon: <Settings size={20} />,
		roles: ["admin"],
	},
];

export function Sidebar({
	userRole,
	userName,
	onClose,
	onLogout,
	collapsed = false,
	onToggleCollapse,
}: {
	userRole?: string;
	userName?: string;
	onClose?: () => void;
	onLogout?: () => void;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
}) {
	const pathname = usePathname();
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({
		"/sales": true,
	});

	const toggleSection = (href: string) => {
		setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }));
	};

	const filteredNav = navigation.filter(
		(item) => !item.roles || item.roles.includes(userRole || "admin"),
	);

	return (
		<aside
			className="sidebar-wrapper relative flex h-full flex-col bg-gradient-to-b from-[#D0003C] to-[#B80035] dark:from-[#070706] dark:to-[#070706] transition-all duration-300 ease-in-out"
			style={{ width: collapsed ? 76 : 280, minWidth: collapsed ? 76 : 280 }}
		>
			{/* Collapse toggle button — right edge */}
			{onToggleCollapse && (
				<button
					type="button"
					onClick={onToggleCollapse}
					className="absolute -right-3 top-7 z-50 hidden h-6 w-6 items-center justify-center rounded-full bg-white text-[#D0003C] dark:bg-[#2A2A28] dark:text-primary dark:border dark:border-white/[0.06] shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg lg:flex"
				>
					{collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
				</button>
			)}

			{/* Logo area */}
			<div className="flex items-center justify-between px-5 pt-6 pb-5">
				<div className="flex items-center gap-3.5 overflow-hidden">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center">
						<Image
							src="/logo-blanc.png"
							alt="Prime Coaching"
							width={32}
							height={32}
							className="drop-shadow-sm"
						/>
					</div>
					<span
						className={cn(
							"whitespace-nowrap text-base font-bold text-white transition-all duration-300",
							collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
						)}
					>
						Prime Coaching
					</span>
				</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className="shrink-0 rounded-lg p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
					>
						<X size={18} />
					</button>
				)}
			</div>

			{/* Divider */}
			<div className="mx-5 mb-4 border-t border-white/15 dark:border-white/[0.06]" />

			{/* Navigation */}
			<nav className="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
				{filteredNav.map((item) => {
					const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
					const isOpen = openSections[item.href];

					if (item.children) {
						return (
							<div key={item.href} className="mb-1">
								{/* Section header */}
								<button
									type="button"
									onClick={() => {
										if (collapsed) return;
										toggleSection(item.href);
									}}
									title={collapsed ? item.label : undefined}
									className={cn(
										"flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200",
										collapsed ? "justify-center" : "",
										isActive
											? "bg-white/15 dark:bg-white/[0.06] dark:border-l-[3px] dark:border-primary font-semibold text-white"
											: "text-white/70 dark:text-[#F6F6F6]/50 hover:bg-white/10 dark:hover:bg-white/[0.04] hover:text-white dark:hover:text-[#F6F6F6]",
									)}
								>
									<span className="shrink-0">{item.icon}</span>
									{!collapsed && (
										<>
											<span className="flex-1 text-left text-[12px] font-semibold uppercase tracking-wider dark:text-[#8A8A8A]">
												{item.label}
											</span>
											<ChevronDown
												size={13}
												className={cn(
													"shrink-0 text-white/50 transition-transform duration-200",
													isOpen ? "rotate-0" : "-rotate-90",
												)}
											/>
										</>
									)}
								</button>

								{/* Children — hidden when collapsed */}
								{!collapsed && (
									<div
										className={cn(
											"overflow-hidden transition-all duration-200",
											isOpen ? "mt-0.5 max-h-[500px] opacity-100" : "max-h-0 opacity-0",
										)}
									>
										<div className="ml-5 space-y-0.5 border-l border-white/20 dark:border-white/[0.06] pl-3">
											{item.children.map((child) => {
												const childActive = pathname === child.href;
												return (
													<Link
														key={child.href}
														href={child.href}
														onClick={onClose}
														className={cn(
															"flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all duration-200",
															childActive
																? "bg-white/15 dark:bg-white/[0.06] dark:border-l-[3px] dark:border-primary font-medium text-white"
																: "text-white/60 dark:text-[#F6F6F6]/50 hover:bg-white/10 dark:hover:bg-white/[0.04] hover:text-white dark:hover:text-[#F6F6F6]",
														)}
													>
														<span className={cn("shrink-0", childActive ? "text-white" : "text-white/50 dark:text-[#F6F6F6]/40")}>
															{child.icon}
														</span>
														{child.label}
													</Link>
												);
											})}
										</div>
									</div>
								)}
							</div>
						);
					}

					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onClose}
							title={collapsed ? item.label : undefined}
							className={cn(
								"mb-0.5 flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200",
								collapsed ? "justify-center" : "",
								isActive
									? "bg-white/15 dark:bg-white/[0.06] dark:border-l-[3px] dark:border-primary font-semibold text-white"
									: "text-white/70 dark:text-[#F6F6F6]/50 hover:bg-white/10 dark:hover:bg-white/[0.04] hover:text-white dark:hover:text-[#F6F6F6]",
							)}
						>
							<span className="shrink-0">{item.icon}</span>
							{!collapsed && (
								<span className="text-[12px] font-semibold uppercase tracking-wider dark:text-[#8A8A8A]">
									{item.label}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Bottom — User profile & logout */}
			<div className="mx-4 border-t border-white/15 dark:border-white/[0.06] py-4">
				{collapsed ? (
					<div className="flex flex-col items-center gap-2.5">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 dark:bg-white/[0.06] text-sm font-bold text-white">
							{userName?.charAt(0).toUpperCase() || <User size={16} />}
						</div>
						{onLogout && (
							<button
								type="button"
								onClick={onLogout}
								title="Deconnexion"
								className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
							>
								<LogOut size={16} />
							</button>
						)}
					</div>
				) : (
					<div className="flex items-center gap-3 rounded-xl px-2 py-2">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 dark:bg-white/[0.06] text-sm font-bold text-white">
							{userName?.charAt(0).toUpperCase() || <User size={16} />}
						</div>
						<div className="min-w-0 flex-1">
							<div className="truncate text-sm font-medium text-white">{userName}</div>
							<div className="text-[11px] capitalize text-white/50 dark:text-[#8A8A8A]">{userRole}</div>
						</div>
						{onLogout && (
							<button
								type="button"
								onClick={onLogout}
								title="Deconnexion"
								className="shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white dark:hover:bg-white/[0.06]"
							>
								<LogOut size={16} />
							</button>
						)}
					</div>
				)}
			</div>
		</aside>
	);
}
