"use client";

import { useState } from "react";
import { MessageCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatwootEmbed } from "@/components/setting/chatwoot-embed";
import { LeadsTable } from "@/components/setting-wa/leads-table";

const CHATWOOT_WA_URL = process.env.NEXT_PUBLIC_CHATWOOT_WA_URL || "";

type Tab = "conversations" | "leads";

export default function SettingWAPage() {
	const [activeTab, setActiveTab] = useState<Tab>("conversations");

	return (
		<div className="mx-auto max-w-7xl space-y-4">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D0003C]/10">
					<MessageCircle size={20} className="text-[#D0003C]" />
				</div>
				<div>
					<h1 className="text-xl font-bold text-slate-800">Setting WhatsApp</h1>
					<p className="text-sm text-slate-500">
						Conversations et leads WhatsApp
					</p>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 rounded-lg bg-slate-100 p-1">
				<button
					type="button"
					onClick={() => setActiveTab("conversations")}
					className={cn(
						"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
						activeTab === "conversations"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					<MessageCircle size={16} />
					Conversations
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("leads")}
					className={cn(
						"flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
						activeTab === "leads"
							? "bg-white text-slate-800 shadow-sm"
							: "text-slate-500 hover:text-slate-700",
					)}
				>
					<Users size={16} />
					Leads
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === "conversations" ? (
				<ChatwootEmbed url={CHATWOOT_WA_URL} channel="whatsapp" />
			) : (
				<LeadsTable />
			)}
		</div>
	);
}
