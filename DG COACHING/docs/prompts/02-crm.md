# Meta-Prompt 02 — CRM & Sales Pipeline

## Module
CRM complet : CRUD leads, pipeline kanban, fiche CRM, dashboard sales auto-calcule.

## Prerequis
- Module 01 (Foundation) deploye
- Schema Convex avec table `leads`
- Auth fonctionnel

## Taches

### 1. Convex Functions — Leads
```
Mutations:
- leads.create(data) — cree un lead
- leads.update(id, data) — MAJ un lead
- leads.updateEtape(id, etape) — change l'etape closing (+ log dans historique)
- leads.delete(id) — supprime un lead (admin only)
- leads.assignSetter(id, setterId)
- leads.assignCloser(id, closerId)

Queries:
- leads.list({ etape?, source?, qualification?, setterId?, closerId?, search?, dateRange? }) — avec pagination
- leads.getById(id) — fiche complete
- leads.getByEtape() — groupes par etape (pour kanban)
- leads.getStats({ closerId?, dateRange? }) — KPIs auto-calcules :
  - callsProgrammes (etape = "appel_a_venir" count)
  - callsEffectues (etape != "appel_a_venir" et dateAppel existe)
  - showRate (effectues / programmes)
  - closes (etape = "close" count)
  - closeRate (closes / effectues)
  - caContracte (sum montantContracte where close)
  - caCollecte (sum paiements confirmed)
  - panierMoyen (caContracte / closes)
  - caParCall (caCollecte / effectues)
  - raisonsPerte (group by raisonPerte count)
  - topClosers (group by closerId, sort by closeRate)
```

### 2. Pipeline Vente — Kanban (/sales/pipeline)
- 7 colonnes : "Appel a venir", "Appel du jour", "Follow up", "No show", "En attente", "Close", "Perdu"
- Chaque colonne affiche le count
- Cards : nom, source (badge couleur), montant, date call, setter+closer (mini avatars)
- Drag & drop entre colonnes → appelle `leads.updateEtape`
- Click card → navigate vers `/sales/crm/{id}`
- FilterBar en haut : search + source + qualification
- Utiliser `@dnd-kit/core` pour le drag & drop

### 3. CRM Liste (/sales/crm)
- Table avec colonnes : Contact, Email, Tel, Source, Type, Qualification, Etape (badge), Setter, Closer, Date call, Montant
- FilterBar : search (nom/email/tel), select etape, select source, select qualification, select setter, select closer, date range
- Pagination (20 par page)
- Click row → `/sales/crm/{id}`
- Export CSV (bouton)

### 4. Fiche CRM (/sales/crm/{id})
Sections :
- **Header** : Nom + etape (dropdown editable) + boutons actions
- **Contact** : Nom, Email, Tel, Instagram, Adresse — edit inline
- **Qualification** : Source (badge), Type (badge), Qualification (badge), Reponses questionnaire (accordion)
- **Appel de vente** : Date booking, Date appel, Meeting URL (lien cliquable), Video call (Loom embed), Transcript, Notes internes (rich text editor)
- **Commercial** : Setter (select user), Closer (select user), Lien de paiement (generer/copier), Code reduction (select)
- **Historique** : Timeline des changements d'etape avec timestamps
- **Actions** (sidebar droite) : "Envoyer lien paiement", "Changer etape", "Lancer onboarding", "Supprimer" (admin)

### 5. Dashboard Sales (/sales/dashboard)
Composants :
- **FilterBar** : select closer (ou "Tous") + date range
- **KPICards** (grid 4) : Calls programmes, Show Rate %, Close Rate %, CA collecte mois
- **KPICards secondary** (grid 2) : CA/call, Panier moyen
- **FunnelChart** : 4 etapes avec taux de conversion entre chaque
- **Row 2 colonnes** : TopClosersTable (rank par close rate) + LossReasons (rank par frequence)
- **RevenueChart** : Area chart contracte vs collecte (12 mois)
- **EvolutionChart** : Bar chart volume calls (toggle jour/semaine/mois)

Tous les KPIs sont calcules en temps reel depuis les leads (pas de table de reporting).

## Design
- Kanban : colonnes avec scroll horizontal, cards shadcn Card
- Badges couleur par source/etape/qualification
- Table : shadcn DataTable avec sorting
- Charts : Recharts (AreaChart, BarChart, custom FunnelChart)
- Empty state : illustration + "Aucun lead" + CTA

## Fichiers crees
```
convex/leads.ts
src/app/(dashboard)/sales/dashboard/page.tsx
src/app/(dashboard)/sales/pipeline/page.tsx
src/app/(dashboard)/sales/crm/page.tsx
src/app/(dashboard)/sales/crm/[id]/page.tsx
src/components/sales/kanban-board.tsx
src/components/sales/lead-card.tsx
src/components/sales/crm-table.tsx
src/components/sales/lead-detail.tsx
src/components/sales/funnel-chart.tsx
src/components/sales/top-closers-table.tsx
src/components/sales/loss-reasons.tsx
src/components/sales/revenue-chart.tsx
src/components/sales/evolution-chart.tsx
src/components/ui/sparkline-card.tsx
```
