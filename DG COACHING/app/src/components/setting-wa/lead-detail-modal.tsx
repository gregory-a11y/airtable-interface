"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
	X,
	User,
	Mail,
	Phone,
	Tag,
	Calendar,
	FileText,
	Save,
	Send,
} from "lucide-react";

const ETAPE_SETTING_OPTIONS = [
	{ value: "new_lead", label: "Nouveau lead" },
	{ value: "msg1_sent", label: "MSG 1 envoye" },
	{ value: "msg2_sent", label: "MSG 2 envoye" },
	{ value: "msg3_sent", label: "MSG 3 envoye" },
	{ value: "qualified", label: "Qualifie" },
	{ value: "booked", label: "Call booke" },
	{ value: "no_answer", label: "Pas de reponse" },
	{ value: "not_interested", label: "Pas interesse" },
	{ value: "sent_to_crm", label: "Envoye au CRM" },
];

interface Lead {
	_id: Id<"leads">;
	name: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	source: string;
	leadType?: string;
	etapeSetting?: string;
	noteInterne?: string;
	createdAt: number;
}

interface LeadDetailModalProps {
	lead: Lead;
	onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
	const updateStatus = useMutation(api.settingLeads.updateSettingStatus);
	const updateNote = useMutation(api.settingLeads.updateLeadNote);

	const [etapeSetting, setEtapeSetting] = useState(lead.etapeSetting || "new_lead");
	const [noteInterne, setNoteInterne] = useState(lead.noteInterne || "");
	const [saving, setSaving] = useState(false);

	const handleSaveStatus = async () => {
		setSaving(true);
		try {
			await updateStatus({ id: lead._id, etapeSetting });
		} finally {
			setSaving(false);
		}
	};

	const handleSaveNote = async () => {
		setSaving(true);
		try {
			await updateNote({ id: lead._id, noteInterne });
		} finally {
			setSaving(false);
		}
	};

	const isUrgent =
		lead.etapeSetting === "new_lead" &&
		Date.now() - lead.createdAt > 10 * 60 * 1000;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50"
				onClick={onClose}
				onKeyDown={() => {}}
				role="presentation"
			/>
			<div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D0003C] text-sm font-bold text-white">
							{lead.name.charAt(0).toUpperCase()}
						</div>
						<div>
							<h2 className="text-lg font-bold text-slate-800">{lead.name}</h2>
							{isUrgent && (
								<span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
									A traiter
								</span>
							)}
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content */}
				<div className="space-y-5 px-6 py-5">
					{/* Contact info */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<Mail size={14} className="text-slate-400" />
							{lead.email || "—"}
						</div>
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<Phone size={14} className="text-slate-400" />
							{lead.phone || "—"}
						</div>
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<Tag size={14} className="text-slate-400" />
							{lead.source}
						</div>
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<Calendar size={14} className="text-slate-400" />
							{formatDate(lead.createdAt)}
						</div>
					</div>

					{lead.leadType && (
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<User size={14} className="text-slate-400" />
							Type : {lead.leadType}
						</div>
					)}

					{/* Statut Setting */}
					<div>
						<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
							Statut Setting
						</label>
						<div className="flex gap-2">
							<select
								value={etapeSetting}
								onChange={(e) => setEtapeSetting(e.target.value)}
								className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							>
								{ETAPE_SETTING_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<button
								type="button"
								onClick={handleSaveStatus}
								disabled={saving}
								className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00032] disabled:opacity-50"
							>
								<Save size={14} />
							</button>
						</div>
					</div>

					{/* Notes */}
					<div>
						<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
							<FileText size={12} className="mr-1 inline" />
							Notes internes
						</label>
						<textarea
							value={noteInterne}
							onChange={(e) => setNoteInterne(e.target.value)}
							rows={3}
							className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-[#D0003C] focus:ring-1 focus:ring-[#D0003C]"
							placeholder="Ajouter des notes..."
						/>
						<button
							type="button"
							onClick={handleSaveNote}
							disabled={saving}
							className="mt-2 flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
						>
							<Save size={12} />
							Sauvegarder les notes
						</button>
					</div>
				</div>

				{/* Footer */}
				<div className="border-t border-slate-200 px-6 py-4">
					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
						>
							Fermer
						</button>
						<button
							type="button"
							onClick={async () => {
								await updateStatus({ id: lead._id, etapeSetting: "sent_to_crm" });
								onClose();
							}}
							className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#B00032]"
						>
							<Send size={14} />
							Envoyer vers CRM
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
