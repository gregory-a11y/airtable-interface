"use client";

import { ChatwootEmbed } from "@/components/setting/chatwoot-embed";
import { Pencil } from "lucide-react";

const CHATWOOT_INSTAGRAM_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL || "";

export default function SettingPage() {
	return (
		<div className="mx-auto max-w-7xl space-y-4">
			<div className="flex items-center gap-3">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D0003C]/10">
					<Pencil size={20} className="text-[#D0003C]" />
				</div>
				<div>
					<h1 className="text-xl font-bold text-slate-800">Setting Instagram</h1>
					<p className="text-sm text-slate-500">
						Gestion des conversations Instagram via Chatwoot
					</p>
				</div>
			</div>

			<ChatwootEmbed url={CHATWOOT_INSTAGRAM_URL} channel="instagram" />
		</div>
	);
}
