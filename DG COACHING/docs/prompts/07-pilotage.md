# Meta-Prompt 07 — Pilotage Executif

## Module
Dashboard finance, ad manager Meta, gestion coach, sorties/depenses, codes reduction.

## Prerequis
- Modules 01-05 deployes
- Donnees paiements et clients existantes

## Taches

### 1. Dashboard Finance (/pilotage/finance)

**Convex Query** : `finance.getDashboard({ dateRange? })`
```
Retourne :
- caCollecte : sum payments status=confirmed
- caCollecteHT : caCollecte * 0.80
- caContracte : sum clients.montantContracteTTC
- caContracteHT : caContracte * 0.80
- sorties : sum expenses
- benefices : caCollecte - sorties
- ratioProfits : benefices / caCollecte
- tauxCollecte : caCollecte / caContracte
- evolutionMensuelle : array 12 mois { mois, collecte, contracte }
- parSourcePaiement : group by payments.sourceType { source, total }
- parPrestation : group by clients.prestation { prestation, total }
- ceMois : { collecte, contracte, sorties, benefices, vs mois precedent % }
```

**UI** :
- KPICards (grid 4) :
  - CA Collecte (all time + ce mois, trend)
  - CA Contracte
  - Sorties
  - Benefices + Ratio (badge %)
- RevenueChart : area chart dual (contracte bleu vs collecte vert, 12 mois)
- Row 2 colonnes :
  - PaymentSourcesDonut : repartition Stripe/PayPal/Virement/GoCardless
  - TopPrestationsBar : bar horizontal par prestation
- FilterBar : periode (ce mois, trimestre, annee, custom date range)

### 2. Ad Manager (/pilotage/ads)

**Convex Functions** :
```
Queries:
- metaAds.list({ status?, campaignName?, dateRange? })
- metaAds.getStats({ dateRange? }) :
  - totalSpend, totalImpressions, avgROAS, avgCTR, avgCPA, totalConversions
  - dailyData (14 jours) : { date, spend, roas, impressions }
  - topCreatives (top 10 par ROAS)
  - campaigns (group by campaignName)

Mutations:
- metaAds.sync(data) — webhook depuis Make pour update les donnees
```

**UI** :
- KPICards (grid 6) : Spend, Impressions, ROAS, CTR, CPA, Conversions
- PerformanceChart : line chart dual — ROAS (bleu) + Spend (vert), 14 jours
- CampaignsList : cards avec nom, objectif, statut badge, 4 metriques
- TopCreatives : grid de cards avec thumbnail, format badge, metriques
  - Hover thumbnail → play button
  - Click → VideoPlayerModal (video + panel metriques + hook/copy)
- FilterBar : date range, campagne
- Bouton refresh (trigger sync Make)

### 3. Gestion Coach (/pilotage/gestion-coach)

**Convex Query** : `coaches.getDashboard()`
```
Retourne :
- coaches : array {
    id, name, avatar,
    clientsActifs : count clients status=active AND coachId=id,
    maxCapacity,
    tauxOccupation : clientsActifs / maxCapacity,
    commissionTotale : sum(clientsActifs * pricePerStudent)
  }
```

**UI** :
- CoachLoadChart : bar horizontal — chaque coach avec clientsActifs / maxCapacity
- CoachTable : Coach (avatar+nom), Clients actifs, Capacite, Taux occupation (progress bar), Commission mensuelle
- Attribution panel : "Clients sans coach" liste + drag vers un coach (ou select coach dans fiche client)

### 4. Sorties / Depenses

**Convex Functions** :
```
Mutations:
- expenses.create(data) — { name, amount, category, date, source, notes }
- expenses.update(id, data)
- expenses.delete(id)

Queries:
- expenses.list({ category?, dateRange? })
- expenses.getTotal({ dateRange? })
```

**UI** (integre dans Dashboard Finance) :
- Section "Sorties" dans le dashboard
- Table : Nom, Montant, Categorie (badge), Date, Source
- Bouton "Ajouter une depense" → modal
- Categories : Stripe (frais), Logiciel, Virement, Commande, Budget ADS

### 5. Codes de Reduction

**Convex Functions** :
```
Mutations:
- discountCodes.create({ code, amount, stripePromoCodeId?, stripeCouponId? })
- discountCodes.toggleActive(id)
- discountCodes.delete(id)

Queries:
- discountCodes.list({ active? })
```

**UI** (modal dans CRM fiche lead) :
- Select code de reduction → applique sur le lien de paiement
- Admin : page de gestion dans Pilotage (ou modal dans Liens de paiement)

### 6. Centralisation Factures (/pilotage/factures)

**Convex Functions** :
```
Mutations:
- invoices.create(data) — { type, clientId/teamMemberId, amount, status, invoiceType }
- invoices.updateStatus(id, status)
- invoices.delete(id)

Queries:
- invoices.list({ type?, status?, dateRange? })
- invoices.getPending() — factures en attente
```

**UI** :
- Tabs : "Toutes" | "En attente"
- Table : Numero, Client/Membre, Montant, Date, Type (badge), Statut (badge)
- Actions : Marquer paye, Relancer (webhook Make), Annuler

### 7. SOPs (/pilotage/sops)

**Convex Functions** :
```
Mutations:
- resources.create({ title, category:"sop", subCategory, content })
- resources.update(id, data)
- resources.delete(id)

Queries:
- resources.listByCategory("sop", { subCategory? })
- resources.search(query, "sop")
```

**UI** :
- Sidebar gauche : categories (Sales, Coaching, Admin, Process)
- Liste : titre, sous-categorie badge, derniere MAJ
- Click → SOP editor (rich text, tiptap)
- Bouton "Nouveau SOP"
- Search full-text

## Fichiers crees
```
convex/finance.ts
convex/metaAds.ts
convex/coaches.ts
convex/expenses.ts
convex/discountCodes.ts
convex/invoices.ts
convex/resources.ts
src/app/(dashboard)/pilotage/finance/page.tsx
src/app/(dashboard)/pilotage/ads/page.tsx
src/app/(dashboard)/pilotage/gestion-coach/page.tsx
src/app/(dashboard)/pilotage/factures/page.tsx
src/app/(dashboard)/pilotage/sops/page.tsx
src/components/pilotage/revenue-chart.tsx
src/components/pilotage/payment-sources-donut.tsx
src/components/pilotage/top-prestations-bar.tsx
src/components/pilotage/coach-load-chart.tsx
src/components/pilotage/campaign-card.tsx
src/components/pilotage/video-player-modal.tsx
src/components/pilotage/sop-editor.tsx
```
