"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Star, Loader2, Send } from "lucide-react";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function TrackingCoachPage() {
	const users = useQuery(api.users.listTeam);
	const currentUser = useQuery(api.users.currentUser);
	const tracking = useQuery(api.coachTracking.list, {});
	const createEval = useMutation(api.coachTracking.create);

	const [coachId, setCoachId] = useState("");
	const [scores, setScores] = useState({
		delaiReponse: 3,
		relanceClients: 3,
		positionProfessionnelle: 3,
		qualiteDiete: 3,
		qualiteProgramme: 3,
		energie: 3,
	});
	const [submitting, setSubmitting] = useState(false);

	const coaches = users?.filter((u) => u.role === "coach" && u._id !== currentUser?._id) || [];

	const handleSubmit = async () => {
		if (!coachId) {
			toast.error("Selectionnez un coach");
			return;
		}
		setSubmitting(true);
		try {
			const moyenne = Object.values(scores).reduce((a, b) => a + b, 0) / 6;
			await createEval({
				coachEvalueId: coachId as Id<"users">,
				...scores,
				moyenne: Math.round(moyenne * 10) / 10,
			});
			toast.success("Evaluation envoyee");
			setCoachId("");
			setScores({ delaiReponse: 3, relanceClients: 3, positionProfessionnelle: 3, qualiteDiete: 3, qualiteProgramme: 3, energie: 3 });
		} catch {
			toast.error("Erreur");
		} finally {
			setSubmitting(false);
		}
	};

	if (users === undefined || tracking === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const criteria = [
		{ key: "delaiReponse", label: "Delai de reponses < 24h" },
		{ key: "relanceClients", label: "Relance clients" },
		{ key: "positionProfessionnelle", label: "Position professionnelle" },
		{ key: "qualiteDiete", label: "Qualite de la diete" },
		{ key: "qualiteProgramme", label: "Qualite du programme" },
		{ key: "energie", label: "Energie" },
	];

	return (
		<div className="mx-auto max-w-5xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Tracking Coach</h1>

			{/* Evaluation form */}
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<h2 className="mb-4 text-sm font-semibold text-slate-700">Evaluer un coach</h2>
				<div className="mb-4">
					<label className="mb-1 block text-sm font-medium text-slate-600">Coach a evaluer</label>
					<select
						value={coachId}
						onChange={(e) => setCoachId(e.target.value)}
						className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#D0003C]"
					>
						<option value="">Selectionner...</option>
						{coaches.map((c) => (
							<option key={c._id} value={c._id}>{c.name}</option>
						))}
					</select>
				</div>

				<div className="space-y-3">
					{criteria.map((c) => (
						<div key={c.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
							<span className="text-sm text-slate-700">{c.label}</span>
							<div className="flex gap-1">
								{[1, 2, 3, 4, 5].map((n) => (
									<button
										key={n}
										type="button"
										onClick={() => setScores((prev) => ({ ...prev, [c.key]: n }))}
										className="transition-colors"
									>
										<Star
											size={20}
											className={n <= scores[c.key as keyof typeof scores] ? "fill-amber-400 text-amber-400" : "text-slate-300"}
										/>
									</button>
								))}
							</div>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={handleSubmit}
					disabled={submitting || !coachId}
					className="mt-4 flex items-center gap-1.5 rounded-lg bg-[#D0003C] px-4 py-2 text-sm font-medium text-white hover:bg-[#B80035] disabled:opacity-50"
				>
					<Send size={14} />
					{submitting ? "Envoi..." : "Soumettre l'evaluation"}
				</button>
			</div>

			{/* History */}
			<div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
				<div className="border-b border-slate-100 px-5 py-3">
					<h2 className="text-sm font-semibold text-slate-700">Historique des evaluations</h2>
				</div>
				{tracking.length === 0 ? (
					<p className="px-5 py-8 text-center text-sm text-slate-400">Aucune evaluation</p>
				) : (
					<table className="w-full text-sm">
						<thead className="bg-slate-50">
							<tr className="text-left text-xs text-slate-500">
								<th className="px-4 py-3 font-medium">Coach evalue</th>
								<th className="px-4 py-3 font-medium">Evaluateur</th>
								<th className="px-4 py-3 font-medium">Moyenne</th>
								<th className="px-4 py-3 font-medium">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{tracking.map((t: any) => (
								<tr key={t._id} className="hover:bg-slate-50">
									<td className="px-4 py-3 font-medium text-slate-800">{t.coachEvalueName || "—"}</td>
									<td className="px-4 py-3 text-slate-600">{t.coachEvaluateurName || "—"}</td>
									<td className="px-4 py-3">
										<span className="flex items-center gap-1 font-medium text-amber-600">
											<Star size={14} className="fill-amber-400" />
											{t.moyenne}/5
										</span>
									</td>
									<td className="px-4 py-3 text-slate-500">
										{new Date(t.createdAt).toLocaleDateString("fr-FR")}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
