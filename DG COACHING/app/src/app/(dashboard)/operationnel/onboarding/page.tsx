"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, FileText, GripVertical, Trash2, Eye, Loader2, BookOpen } from "lucide-react";

const fieldTypes = [
	{ value: "shortText", label: "Texte court" },
	{ value: "longText", label: "Texte long" },
	{ value: "email", label: "Email" },
	{ value: "phone", label: "Telephone" },
	{ value: "number", label: "Nombre" },
	{ value: "select", label: "Liste deroulante" },
	{ value: "multiSelect", label: "Selection multiple" },
	{ value: "date", label: "Date" },
	{ value: "rating", label: "Notation (1-5)" },
	{ value: "fileUpload", label: "Upload fichier" },
	{ value: "section", label: "Separateur" },
];

const formTypes = [
	{ value: "onboarding", label: "Onboarding" },
	{ value: "bilan", label: "Bilan mensuel" },
	{ value: "custom", label: "Custom" },
];

export default function OnboardingPage() {
	const forms = useQuery(api.forms.list, {});
	const createForm = useMutation(api.forms.create);
	const [showCreate, setShowCreate] = useState(false);
	const [name, setName] = useState("");
	const [type, setType] = useState<"onboarding" | "bilan" | "custom">("onboarding");

	const handleCreate = async () => {
		if (!name) {
			toast.error("Nom requis");
			return;
		}
		try {
			await createForm({ name, type, description: "" });
			toast.success("Formulaire cree");
			setShowCreate(false);
			setName("");
		} catch {
			toast.error("Erreur");
		}
	};

	if (forms === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const typeColors: Record<string, string> = {
		onboarding: "bg-blue-100 text-blue-700",
		bilan: "bg-emerald-100 text-emerald-700",
		booking: "bg-violet-100 text-violet-700",
		custom: "bg-slate-100 text-slate-600",
	};

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold text-slate-800">Onboarding / Bilan</h1>
					<p className="text-sm text-slate-500">Gerez vos formulaires d'onboarding et de bilans clients</p>
				</div>
				<button
					type="button"
					onClick={() => setShowCreate(true)}
					className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]"
				>
					<Plus size={16} />
					Nouveau formulaire
				</button>
			</div>

			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-sm rounded-2xl bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-800">Nouveau formulaire</h2>
						<div className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Formulaire d'onboarding"
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
								<select
									value={type}
									onChange={(e) => setType(e.target.value as any)}
									className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
								>
									{formTypes.map((t) => (
										<option key={t.value} value={t.value}>{t.label}</option>
									))}
								</select>
							</div>
						</div>
						<div className="mt-6 flex gap-3">
							<button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
							<button type="button" onClick={handleCreate} className="flex-1 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]">Creer</button>
						</div>
					</div>
				</div>
			)}

			{forms.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
					<BookOpen className="mx-auto h-12 w-12 text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">Aucun formulaire cree</p>
					<button type="button" onClick={() => setShowCreate(true)} className="mt-3 text-sm font-medium text-[#D0003C] hover:underline">
						Creer votre premier formulaire
					</button>
				</div>
			) : (
				<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
					<table className="w-full text-sm">
						<thead className="bg-slate-50">
							<tr className="text-left text-xs text-slate-500">
								<th className="px-4 py-3 font-medium">Nom</th>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Statut</th>
								<th className="px-4 py-3 font-medium">Cree le</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{forms.map((form) => (
								<tr key={form._id} className="hover:bg-slate-50">
									<td className="px-4 py-3 font-medium text-slate-800">{form.name}</td>
									<td className="px-4 py-3">
										<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[form.type]}`}>
											{form.type}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${form.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
											{form.active ? "Actif" : "Inactif"}
										</span>
									</td>
									<td className="px-4 py-3 text-slate-500">
										{new Date(form.createdAt).toLocaleDateString("fr-FR")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
