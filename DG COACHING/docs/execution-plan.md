# Execution Plan — Galden Coaching ERP

## Stack
- Next.js 15 (App Router) + TypeScript strict
- Convex (backend complet)
- Tailwind CSS + shadcn/ui
- Bun + Biome
- Vercel (deploy frontend)

---

## Phase 1 — Foundation (Semaine 1)

### 1.1 Project Setup
- Init Next.js 15 avec Bun
- Config TypeScript strict
- Config Tailwind + shadcn/ui
- Config Biome (linting)
- Init Convex
- Structure dossiers : app/(auth), app/(dashboard), convex/
- Deployer sur Vercel + Convex Cloud

### 1.2 Schema Convex
- Definir toutes les tables dans `convex/schema.ts`
- Validators, indexes
- Seed data pour dev

### 1.3 Auth
- Convex Auth : email/password
- Tables users avec role (admin/sales/coach)
- Pages login, invite, forgot-password, reset-password
- Middleware auth (redirect si non connecte)
- Invitation flow : admin envoie email via Resend avec token
- Session management (7j / 30j remember me)

### 1.4 Layout Dashboard
- Sidebar rouge #D0003C avec navigation complete
- Logo blanc en haut
- Header avec breadcrumb + user menu (avatar, logout)
- Responsive : sidebar collapsible sur mobile
- Role-based menu (items visibles selon le role)

**Livrable :** App deployee, auth fonctionnel, layout dashboard avec navigation

---

## Phase 2 — Core CRM (Semaine 2)

### 2.1 CRUD Leads (CRM)
- Table leads dans Convex : mutations create, update, delete
- Queries : list (avec filtres), getById
- Index sur : etapeClosing, source, closerId, setterId

### 2.2 Pipeline Vente (Kanban)
- Vue kanban avec colonnes par etape
- Drag & drop (react-beautiful-dnd ou dnd-kit)
- Cards lead avec infos resumees
- Update etape au drop

### 2.3 CRM Liste + Fiche
- Page /sales/crm : table avec filtres, search, pagination
- Page /sales/crm/{id} : fiche complete lead
- Edit inline des champs
- Notes internes (rich text)
- Timeline historique

### 2.4 Dashboard Sales
- Queries Convex pour calculer les KPIs en temps reel
- FunnelChart, TopClosers, LossReasons, RevenueChart, EvolutionChart
- Composants reutilisables (SparklineCard, etc.)

**Livrable :** CRM fonctionnel avec pipeline kanban et dashboard auto-calcule

---

## Phase 3 — Booking System (Semaine 3)

### 3.1 Google Calendar Integration
- OAuth2 flow pour connecter les comptes Google des closers
- Tokens stockes dans Convex (encryptes)
- Queries : get free/busy slots
- Mutations : create event avec Google Meet

### 3.2 Calendars Admin
- CRUD calendriers (nom, slug, description, source, hotes, priorites)
- Form builder pour questions custom
- Config horaires, limites, buffer

### 3.3 Page Publique Booking
- Route book.galdencoaching.com/{slug}
- Step 1 : formulaire (champs fixes + custom)
- Step 2 : calendrier + time slots (round-robin par priorite + dispo)
- Step 3 : confirmation + email Resend
- Cree le lead dans le CRM automatiquement

### 3.4 Gestion des Calls
- Page /sales/calls : vue liste + calendrier
- Sync Google Calendar en temps reel
- Actions : rejoindre Meet, marquer no show

**Livrable :** Booking system complet remplacant iClosed

---

## Phase 4 — Payment System (Semaine 4)

### 4.1 Offers Management
- CRUD offres (montant, echelonnement, providers, statut)
- Page /pilotage/liens-paiement

### 4.2 PID Generation
- Mutation Convex : generer PID + associer au prospect
- Copie lien en 1 clic

### 4.3 Payment Page
- Route pay.galdencoaching.com
- Load offre par offerId
- Choix Stripe / PayPal
- Integration Stripe Checkout (client_reference_id = PID)
- Integration PayPal Orders API (custom_id = PID)

### 4.4 Webhooks
- HTTP Actions Convex pour Stripe + PayPal
- Verification signature
- Idempotence via webhookEvents
- Lookup provider_tx_id → pid → prospect
- Auto-close : paiement recu → lead passe a "Close" → fiche client creee

### 4.5 Suivi Paiements & Commissions
- Page /sales/payments
- Calcul automatique commissions (% setter + % closer)
- Gestion echelonnements (partial → completed)

**Livrable :** Systeme de paiement PID complet avec Stripe + PayPal

---

## Phase 5 — Client Management (Semaine 5)

### 5.1 CRUD Clients
- Table clients dans Convex
- Auto-creation depuis CRM quand close
- Statuts avec transitions

### 5.2 Listing Clients
- Table groupee par coach + statut
- Filtres, search
- Badge couleur par statut

### 5.3 Fiche Client
- Toutes les sections (coaching, contact, bilans, paiements)
- Liens Google Sheets + Telegram + Drive
- Calculs auto : date fin, restant a payer, % avancement
- Section paiements avec historique

### 5.4 New Close
- Page /sales/new-close
- Liste des closes recents
- Action "Lancer onboarding" → webhook Make

### 5.5 Dashboard Operationnel
- KPIs clients, workload chart, retention chart

**Livrable :** Gestion clients complete avec fiches et dashboards

---

## Phase 6 — Integrations & Features (Semaine 6)

### 6.1 Chatwoot Embed
- Pages Setting + Setting WA avec iframe Chatwoot
- Config URL de l'instance

### 6.2 Leads Listing (Setting WA)
- Onglet leads dans Setting WA
- Webhook Convex pour recevoir les leads de Make (Meta → Make → Convex)

### 6.3 Equipes
- Page /equipes : cards membres
- Invitation via Resend
- Edit profil, commissions, capacite

### 6.4 Overview
- Page /overview avec KPIs, alertes, revenue chart
- Adapte par role

**Livrable :** Integrations Chatwoot, equipes, overview

---

## Phase 7 — Pilotage Executif (Semaine 7)

### 7.1 Dashboard Finance
- Aggregations Convex pour CA, sorties, benefices
- Charts revenue, sources, prestations

### 7.2 Ad Manager
- Sync Meta Ads (via Make ou API directe)
- Dashboard avec KPIs, performance chart, campagnes, creatives

### 7.3 Gestion Coach
- Attribution clients → coaches
- Charge par coach, taux d'occupation

### 7.4 Codes de Reduction
- CRUD codes promo Stripe

### 7.5 Sorties / Depenses
- CRUD sorties (montant, categorie, date)
- Integration dans Dashboard Finance

**Livrable :** Pilotage executif complet

---

## Phase 8 — Form Builder & Polish (Semaine 8)

### 8.1 Form Builder
- CRUD formulaires (onboarding, bilan, custom)
- Types de champs : text, select, date, rating, file upload
- Drag & drop reorder
- Page publique formulaire
- Soumissions liees aux clients

### 8.2 Tracking Coach
- Evaluation inter-coaches (6 criteres, rating 1-5)
- Historique + moyennes

### 8.3 SOPs
- CRUD SOPs par categorie
- Rich text editor
- Fichiers attaches

### 8.4 Factures
- Centralisation factures (clients + internes)
- Factures en attente

### 8.5 Polish
- Responsive check (toutes les pages)
- Empty states
- Error boundaries
- Loading skeletons
- Toasts feedback
- Dark mode (optionnel)

**Livrable :** Form builder, features P2, polish general

---

## Phase 9 — Testing & Deploy (Semaine 9)

### 9.1 Tests
- Tests critiques : auth, paiements (webhooks), booking
- Tests E2E sur les flows principaux
- Verification permissions par role

### 9.2 DNS & Domains
- Config app.galdencoaching.com → Vercel
- Config pay.galdencoaching.com → Vercel (meme projet, route group)
- Config book.galdencoaching.com → Vercel (meme projet, route group)

### 9.3 Production
- Variables d'environnement production (Stripe live, PayPal live, Resend, Google OAuth)
- Deploy Convex production
- Deploy Vercel production
- Smoke tests en production

### 9.4 Onboarding
- Creer le compte admin (Gregory)
- Inviter l'equipe
- Configurer les premiers calendriers de booking
- Creer les premieres offres de paiement
- Configurer Chatwoot embed

**Livrable :** Application en production, equipe onboardee

---

## Phases & Modules Summary

| Phase | Module | Priorite | Dependances |
|-------|--------|----------|-------------|
| 1 | Foundation + Auth + Layout | P0 | - |
| 2 | CRM + Pipeline + Dashboard Sales | P0 | Phase 1 |
| 3 | Booking System | P0 | Phase 1 + Google OAuth |
| 4 | Payment System (PID) | P0 | Phase 2 (leads) |
| 5 | Client Management | P0 | Phase 2 + Phase 4 |
| 6 | Chatwoot + Equipes + Overview | P0 | Phase 1 |
| 7 | Pilotage Executif | P1 | Phase 4 + Phase 5 |
| 8 | Form Builder + Polish | P1/P2 | Phase 5 |
| 9 | Testing + Deploy | - | All |

## Parallelisation possible

```
Phase 1 (Foundation)
  ├── Phase 2 (CRM) ────────→ Phase 4 (Paiements) → Phase 5 (Clients)
  ├── Phase 3 (Booking) ────→ (independant)
  └── Phase 6 (Chatwoot) ──→ (independant)
                                                     ↓
                                              Phase 7 (Pilotage)
                                              Phase 8 (Form Builder)
                                                     ↓
                                              Phase 9 (Deploy)
```

Les Phases 2, 3 et 6 peuvent etre developpees **en parallele** apres la Phase 1.
