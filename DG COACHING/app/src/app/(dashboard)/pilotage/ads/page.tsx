"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Loader2, Megaphone, TrendingUp, Eye, MousePointer, DollarSign, Target } from "lucide-react";

export default function AdsManagerPage() {
	const ads = useQuery(api.metaAds.list, {});

	if (ads === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-[#D0003C]" />
			</div>
		);
	}

	const totalSpend = ads.reduce((sum, a) => sum + (a.spend || 0), 0);
	const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
	const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
	const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0";
	const avgROAS = ads.filter((a) => a.roas).length > 0
		? (ads.reduce((sum, a) => sum + (a.roas || 0), 0) / ads.filter((a) => a.roas).length).toFixed(2)
		: "0";
	const avgCPA = ads.filter((a) => a.cpa).length > 0
		? (ads.reduce((sum, a) => sum + (a.cpa || 0), 0) / ads.filter((a) => a.cpa).length).toFixed(2)
		: "0";

	const campaigns = [...new Set(ads.map((a) => a.campaignName).filter(Boolean))];

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<h1 className="text-xl font-bold text-slate-800">Ad Manager</h1>

			{/* KPIs */}
			<div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
				<AdKPI label="Spend" value={`${(totalSpend).toFixed(0)}€`} icon={<DollarSign size={16} />} />
				<AdKPI label="Impressions" value={totalImpressions > 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : String(totalImpressions)} icon={<Eye size={16} />} />
				<AdKPI label="ROAS" value={`${avgROAS}x`} icon={<TrendingUp size={16} />} />
				<AdKPI label="CTR" value={`${avgCTR}%`} icon={<MousePointer size={16} />} />
				<AdKPI label="CPA" value={`${avgCPA}€`} icon={<Target size={16} />} />
				<AdKPI label="Ads" value={String(ads.length)} icon={<Megaphone size={16} />} />
			</div>

			{/* Campaigns */}
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<h2 className="mb-4 text-sm font-semibold text-slate-700">Campagnes</h2>
				{campaigns.length === 0 ? (
					<div className="py-12 text-center">
						<Megaphone className="mx-auto h-12 w-12 text-slate-300" />
						<p className="mt-3 text-sm text-slate-500">Aucune campagne. Synchronisez vos donnees Meta Ads via Make.</p>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{campaigns.map((name) => {
							const campAds = ads.filter((a) => a.campaignName === name);
							const spend = campAds.reduce((s, a) => s + (a.spend || 0), 0);
							const impr = campAds.reduce((s, a) => s + (a.impressions || 0), 0);
							return (
								<div key={name} className="rounded-lg border border-slate-200 p-4 transition-shadow hover:shadow-md">
									<h3 className="text-sm font-medium text-slate-800 line-clamp-1">{name}</h3>
									<div className="mt-2 grid grid-cols-3 gap-2 text-center">
										<div>
											<p className="text-lg font-bold text-slate-800">{campAds.length}</p>
											<p className="text-[10px] text-slate-400">Ads</p>
										</div>
										<div>
											<p className="text-lg font-bold text-slate-800">{spend.toFixed(0)}€</p>
											<p className="text-[10px] text-slate-400">Spend</p>
										</div>
										<div>
											<p className="text-lg font-bold text-slate-800">{impr > 1000 ? `${(impr / 1000).toFixed(0)}K` : impr}</p>
											<p className="text-[10px] text-slate-400">Impr.</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Top creatives */}
			<div className="rounded-xl border border-slate-200 bg-white p-5">
				<h2 className="mb-4 text-sm font-semibold text-slate-700">Top Creatives</h2>
				{ads.length === 0 ? (
					<p className="py-8 text-center text-sm text-slate-400">Aucune donnee</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-slate-50">
								<tr className="text-left text-xs text-slate-500">
									<th className="px-4 py-2 font-medium">Ad</th>
									<th className="px-4 py-2 font-medium">Format</th>
									<th className="px-4 py-2 font-medium">Spend</th>
									<th className="px-4 py-2 font-medium">ROAS</th>
									<th className="px-4 py-2 font-medium">CTR</th>
									<th className="px-4 py-2 font-medium">CPA</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100">
								{ads.sort((a, b) => (b.roas || 0) - (a.roas || 0)).slice(0, 20).map((ad) => (
									<tr key={ad._id} className="hover:bg-slate-50">
										<td className="px-4 py-2">
											<div className="max-w-xs truncate font-medium text-slate-800">{ad.adName}</div>
											<div className="text-xs text-slate-400">{ad.adSetName}</div>
										</td>
										<td className="px-4 py-2">
											<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ad.format === "VIDEO" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
												{ad.format || "—"}
											</span>
										</td>
										<td className="px-4 py-2 text-slate-600">{ad.spend?.toFixed(2) || "0"}€</td>
										<td className="px-4 py-2 font-medium text-slate-800">{ad.roas?.toFixed(2) || "—"}x</td>
										<td className="px-4 py-2 text-slate-600">{ad.ctr?.toFixed(2) || "—"}%</td>
										<td className="px-4 py-2 text-slate-600">{ad.cpa?.toFixed(2) || "—"}€</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

function AdKPI({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4">
			<div className="flex items-center gap-2 text-slate-400">{icon}<span className="text-xs font-medium uppercase tracking-wider">{label}</span></div>
			<p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
		</div>
	);
}
