"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, BookOpen, Loader2, Search, Edit3, Trash2, Save } from "lucide-react";

const categories = ["Sales", "Coaching", "Admin", "Process"];

export default function SOPsPage() {
	const sops = useQuery(api.resources.listByCategory, { category: "sop" });
	const createSOP = useMutation(api.resources.create);
	const updateSOP = useMutation(api.resources.update);
	const deleteSOP = useMutation(api.resources.remove);

	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [search, setSearch] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [editing, setEditing] = useState<string | null>(null);

	const [title, setTitle] = useState("");
	const [subCategory, setSubCategory] = useState("Sales");
	const [content, setContent] = useState("");

	if (sops === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const filtered = sops
		.filter((s) => selectedCategory === "all" || s.subCategory === selectedCategory)
		.filter((s) => !search || s.title.toLowerCase().includes(search.toLowerCase()));

	const handleCreate = async () => {
		if (!title) {
			toast.error("Titre requis");
			return;
		}
		try {
			await createSOP({ title, category: "sop" as const, subCategory, content, active: true });
			toast.success("SOP creee");
			setShowCreate(false);
			setTitle("");
			setContent("");
		} catch {
			toast.error("Erreur");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Supprimer cette SOP ?")) return;
		try {
			await deleteSOP({ id: id as any });
			toast.success("Supprimee");
		} catch {
			toast.error("Erreur");
		}
	};

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-slate-800">SOPs</h1>
				<button
					type="button"
					onClick={() => setShowCreate(true)}
					className="flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]"
				>
					<Plus size={16} />
					Nouvelle SOP
				</button>
			</div>

			{/* Filters */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative">
					<Search size={16} className="absolute top-2.5 left-3 text-slate-400" />
					<input
						type="text"
						placeholder="Rechercher..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-[#D0003C]"
					/>
				</div>
				<div className="flex gap-1 rounded-lg bg-slate-100 p-1">
					<button type="button" onClick={() => setSelectedCategory("all")} className={`rounded-md px-3 py-1 text-xs font-medium ${selectedCategory === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
						Toutes
					</button>
					{categories.map((cat) => (
						<button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={`rounded-md px-3 py-1 text-xs font-medium ${selectedCategory === cat ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* Create modal */}
			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
					<div className="w-full max-w-lg rounded-2xl bg-white p-6">
						<h2 className="mb-4 text-lg font-bold text-slate-800">Nouvelle SOP</h2>
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Titre</label>
									<input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]" />
								</div>
								<div>
									<label className="mb-1 block text-sm font-medium text-slate-700">Categorie</label>
									<select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
										{categories.map((c) => <option key={c} value={c}>{c}</option>)}
									</select>
								</div>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-slate-700">Contenu</label>
								<textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]" />
							</div>
						</div>
						<div className="mt-6 flex gap-3">
							<button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Annuler</button>
							<button type="button" onClick={handleCreate} className="flex-1 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035]">Creer</button>
						</div>
					</div>
				</div>
			)}

			{/* SOPs list */}
			{filtered.length === 0 ? (
				<div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
					<BookOpen className="mx-auto h-12 w-12 text-slate-300" />
					<p className="mt-3 text-sm text-slate-500">Aucune SOP</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((sop) => (
						<div key={sop._id} className="rounded-xl border border-slate-200 bg-white p-5">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-sm font-semibold text-slate-800">{sop.title}</h3>
									<div className="mt-1 flex items-center gap-2">
										<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{sop.subCategory}</span>
										<span className="text-xs text-slate-400">
											MAJ {new Date(sop.updatedAt).toLocaleDateString("fr-FR")}
										</span>
									</div>
								</div>
								<button type="button" onClick={() => handleDelete(sop._id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
									<Trash2 size={14} />
								</button>
							</div>
							{sop.content && (
								<div className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
									{sop.content}
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
