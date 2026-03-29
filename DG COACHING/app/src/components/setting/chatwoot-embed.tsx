"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

const DEFAULT_CHATWOOT_URL = "https://app.chatwoot.com";

interface ChatwootEmbedProps {
	url?: string;
	channel?: "instagram" | "whatsapp";
}

export function ChatwootEmbed({ url, channel }: ChatwootEmbedProps) {
	const [loading, setLoading] = useState(true);

	const baseUrl = url || DEFAULT_CHATWOOT_URL;
	const iframeSrc = channel
		? `${baseUrl}?channel=${channel}`
		: baseUrl;

	return (
		<div className="relative h-[calc(100vh-120px)] w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
			{loading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
					<div className="flex flex-col items-center gap-3">
						<Loader2 size={32} className="animate-spin text-[#D0003C]" />
						<p className="text-sm text-slate-500">Chargement de Chatwoot...</p>
					</div>
				</div>
			)}
			<iframe
				src={iframeSrc}
				title={`Chatwoot - ${channel || "conversations"}`}
				className="h-full w-full border-0"
				onLoad={() => setLoading(false)}
				allow="camera; microphone; clipboard-write"
			/>
		</div>
	);
}
