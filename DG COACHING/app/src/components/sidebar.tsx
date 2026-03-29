"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Pencil,
	MessageCircle,
	Target,
	BarChart3,
	Kanban,
	Users,
	Phone,
	Sparkles,
	CreditCard,
	Activity,
	FileText,
	ClipboardList,
	Star,
	UserCog,
	Megaphone,
	Receipt,
	BookOpen,
	LinkIcon,
	X,
	ChevronDown,
	ChevronRight,
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
		label: "Overview",
		href: "/overview",
		icon: <LayoutDashboard size={18} />,
	},
	{
		label: "SETTING",
		href: "/setting",
		icon: <Pencil size={18} />,
		roles: ["admin", "sales"],
	},
	{
		label: "SETTING WA",
		href: "/setting-wa",
		icon: <MessageCircle size={18} />,
		roles: ["admin", "sales"],
	},
	{
		label: "SALES/CLOSING",
		href: "/sales",
		icon: <Target size={18} />,
		roles: ["admin", "sales"],
		children: [
			{ label: "Dashboard", href: "/sales/dashboard", icon: <BarChart3 size={16} /> },
			{ label: "Pipeline Vente", href: "/sales/pipeline", icon: <Kanban size={16} /> },
			{ label: "CRM", href: "/sales/crm", icon: <Users size={16} /> },
			{ label: "Gestion des Calls", href: "/sales/calls", icon: <Phone size={16} /> },
			{ label: "New close", href: "/sales/new-close", icon: <Sparkles size={16} /> },
			{
				label: "Suivi des paiements & c...",
				href: "/sales/payments",
				icon: <CreditCard size={16} />,
			},
		],
	},
	{
		label: "OPERATIONNEL",
		href: "/operationnel",
		icon: <Activity size={18} />,
		children: [
			{
				label: "Dashboard",
				href: "/operationnel/dashboard",
				icon: <BarChart3 size={16} />,
			},
			{
				label: "Fiches clients",
				href: "/operationnel/clients",
				icon: <FileText size={16} />,
			},
			{
				label: "Listing clients",
				href: "/operationnel/clients",
				icon: <ClipboardList size={16} />,
			},
			{
				label: "Onboarding / Bilan",
				href: "/operationnel/onboarding",
				icon: <BookOpen size={16} />,
			},
			{
				label: "Tracking Coach",
				href: "/operationnel/tracking-coach",
				icon: <Star size={16} />,
			},
		],
	},
	{
		label: "EQUIPES",
		href: "/equipes",
		icon: <Users size={18} />,
		roles: ["admin"],
	},
	{
		label: "PILOTAGE EXECUTIF",
		href: "/pilotage",
		icon: <UserCog size={18} />,
		roles: ["admin"],
		children: [
			{
				label: "Dashboard Finance",
				href: "/pilotage/finance",
				icon: <BarChart3 size={16} />,
			},
			{ label: "ADMANAGER", href: "/pilotage/ads", icon: <Megaphone size={16} /> },
			{
				label: "Centralisation factures",
				href: "/pilotage/factures",
				icon: <Receipt size={16} />,
			},
			{
				label: "Gestion coach",
				href: "/pilotage/gestion-coach",
				icon: <UserCog size={16} />,
			},
			{ label: "SOP's", href: "/pilotage/sops", icon: <BookOpen size={16} /> },
			{
				label: "Lien de paiement NEW",
				href: "/pilotage/liens-paiement",
				icon: <LinkIcon size={16} />,
			},
		],
	},
];

export function Sidebar({
	userRole,
	onClose,
}: {
	userRole?: string;
	onClose?: () => void;
}) {
	const pathname = usePathname();
	const [openSections, setOpenSections] = useState<Record<string, boolean>>({
		"/sales": true,
		"/operationnel": true,
		"/pilotage": true,
	});

	const toggleSection = (href: string) => {
		setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }));
	};

	const filteredNav = navigation.filter(
		(item) => !item.roles || item.roles.includes(userRole || "admin"),
	);

	return (
		<aside className="flex h-full w-64 flex-col bg-[#D0003C] text-white">
			{/* Logo */}
			<div className="flex items-center justify-between px-4 pt-5 pb-4">
				<div className="flex items-center gap-2">
					<Image
						src="/logo-blanc.png"
						alt="Prime Coaching"
						width={28}
						height={28}
						className="h-7 w-7"
					/>
					<div>
						<div className="text-sm font-bold leading-tight">Prime Coaching</div>
						<div className="text-[10px] opacity-70">3.0</div>
					</div>
				</div>
				{onClose && (
					<button type="button" onClick={onClose} className="lg:hidden">
						<X size={20} />
					</button>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto px-2 pb-4">
				{filteredNav.map((item) => {
					const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
					const isOpen = openSections[item.href];

					if (item.children) {
						return (
							<div key={item.href} className="mb-1">
								<button
									type="button"
									onClick={() => toggleSection(item.href)}
									className={cn(
										"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
										isActive ? "bg-white/15" : "hover:bg-white/10",
									)}
								>
									{item.icon}
									<span className="flex-1 text-left">{item.label}</span>
									{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
								</button>
								{isOpen && (
									<div className="mt-0.5 ml-4 space-y-0.5">
										{item.children.map((child) => {
											const childActive = pathname === child.href;
											return (
												<Link
													key={child.href}
													href={child.href}
													onClick={onClose}
													className={cn(
														"flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors",
														childActive
															? "bg-white/20 font-medium"
															: "opacity-80 hover:bg-white/10 hover:opacity-100",
													)}
												>
													{child.icon}
													{child.label}
												</Link>
											);
										})}
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
							className={cn(
								"mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
								isActive ? "bg-white/15" : "hover:bg-white/10",
							)}
						>
							{item.icon}
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
