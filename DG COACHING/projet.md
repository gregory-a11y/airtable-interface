# PRD — Galden Coaching ERP (Prime Coaching)

> ERP sur mesure pour business de coaching sportif high-ticket.
> Remplace l'infrastructure Airtable "Prime Coaching 3.0" (31 tables) par une application unifiee.

---

## 1. Vision & Probleme

### Probleme
Prime Coaching gere son business de coaching sportif high-ticket (~273K EUR CA) avec un patchwork d'outils :
- **Airtable** (31 tables) pour le CRM, clients, paiements, equipe, reporting
- **iClosed** ($120/mois) pour le booking des appels de vente
- **Systeme.io** pour les liens de paiement (probleme de matching email/telephone)
- **Tally** pour les formulaires de bilans clients
- **Google Sheets** pour les training logs (diete/programme)
- **Telegram** pour les groupes clients et l'onboarding
- **Make** pour les automatisations
- **Chatwoot** (self-hosted) pour le setting WhatsApp/Instagram

Les problemes :
- Donnees fragmentees sur 8+ outils
- Matching email/telephone non fiable sur les liens de paiement (Systeme.io)
- Pas de pages de paiement brandees
- Reporting manuel pour setters/closers (supprime dans la nouvelle version — calcul automatique)
- Cout cumule des outils (iClosed, Systeme.io, Airtable)
- Pas de vue unifiee du funnel acquisition → closing → client

### Solution
Un ERP custom qui centralise tout :
- CRM avec pipeline de vente automatise
- Booking system integre (remplace iClosed)
- Pages de paiement custom avec systeme PID (remplace Systeme.io)
- Chatwoot embarque pour le setting (WhatsApp + Instagram)
- Form builder integre (remplace Tally)
- Dashboards auto-calcules (plus de reporting manuel)
- Gestion operationnelle des clients

### Positionnement
- **Usage interne** pour Prime Coaching uniquement (v1)
- Architecture **duplicable** pour d'autres clients plus tard (copier l'infra sur un autre serveur)
- **Pas de portail client** — les coaches n'ont pas acces a l'ERP
- Migration des donnees Airtable prevue mais **pas pour le MVP**

### Domaines
- `app.galdencoaching.com` — Application principale (ERP)
- `pay.galdencoaching.com` — Pages de paiement
- `book.galdencoaching.com` — Pages de booking (prise de RDV)

---

## 2. Stack Technique

| Couche | Technologie |
|--------|------------|
| **Frontend** | Next.js 15 (App Router), React 18+, TypeScript strict |
| **UI** | Tailwind CSS, shadcn/ui |
| **Backend** | Convex (database, real-time, auth, functions, file storage, scheduled functions, HTTP actions) |
| **Auth** | Convex Auth — email/mot de passe |
| **Paiements** | Stripe (CB, Apple/Google Pay) + PayPal (wallet, 4x sans frais) |
| **Emails** | Resend (invitations plateforme) |
| **Booking** | Google Calendar API + Google Meet |
| **Messaging** | Chatwoot (self-hosted, embed iframe) |
| **Automations** | Make (webhooks depuis Convex) |
| **Linting** | Biome |
| **Package Manager** | Bun |
| **Deployment** | Vercel (frontend) + Convex Cloud (backend) |

---

## 3. Roles & Permissions

### 3 roles

| Role | Description | Acces |
|------|------------|-------|
| **Admin** | CEO, Process Manager | Tout voir, tout faire. Config, pilotage executif, gestion equipe, invitations. |
| **Sales** | Setter + Closer (meme acces) | Setting (Chatwoot), Setting WA, Sales/Closing (dashboard, pipeline, CRM, calls, new close, paiements & commissions), vue operationnelle (lecture) |
| **Coach** | Coach sportif | Operationnel (ses clients uniquement), bilans, tracking coach |

### Authentification
- **Email + mot de passe** classique
- L'admin invite les membres via **Resend** (email d'invitation avec lien de creation de compte)
- Pas de self-signup — invitation uniquement
- Session persistante (7 jours, "remember me" 30 jours)

### Invitation flow
1. Admin saisit email + role dans la page Equipes
2. Email d'invitation envoye via Resend avec token unique
3. Le membre clique et cree son mot de passe
4. Compte actif, role pre-assigne

---

## 4. Navigation & Structure des Pages

### Sidebar (navbar rouge #D0003C, logo blanc)

```
Prime Coaching 3.0
├── Overview                          [tous les roles]
├── SETTING                           [admin, sales]
│   └── (Chatwoot embed - Instagram)
├── SETTING WA                        [admin, sales]
│   └── (Chatwoot embed - WhatsApp + listing leads)
├── SALES/CLOSING                     [admin, sales]
│   ├── Dashboard                     (KPIs auto-calcules)
│   ├── Pipeline Vente                (kanban des etapes)
│   ├── CRM                           (liste des prospects)
│   ├── Gestion des Calls             (calls programes, a venir)
│   ├── New Close                     (prospects recemment closes)
│   └── Suivi paiements & commissions (paiements + commissions setters/closers)
├── OPERATIONNEL                      [admin, sales (lecture), coach (ses clients)]
│   ├── Dashboard                     (KPIs clients actifs)
│   ├── Fiches clients                (fiche detaillee par client)
│   ├── Listing clients               (table groupee par coach + statut)
│   ├── Onboarding / Bilan            (formulaires integres)
│   └── Tracking Coach                (evaluations inter-coaches)
├── EQUIPES                           [admin]
│   └── (gestion equipe, invitations, roles)
├── PILOTAGE EXECUTIF                 [admin]
│   ├── Dashboard Finance             (CA, benefices, sorties, ratios)
│   ├── Ad Manager                    (Meta Ads sync + analytics)
│   ├── Centralisation factures       (toutes les factures)
│   ├── Factures en attente           (factures non payees)
│   ├── Gestion coach                 (charge par coach, attribution)
│   ├── SOPs                          (procedures internes)
│   └── Liens de paiement             (creation + gestion liens PID)
```

---

## 5. Modules Detailles

### 5.1 Overview

**Page d'accueil** apres connexion. Vue synthetique du business.

**Contenu :**
- Carte de bienvenue avec nom de l'utilisateur
- KPIs principaux (cards) :
  - CA collecte du mois en cours
  - Nombre de clients actifs
  - Nombre de calls programmes aujourd'hui
  - Taux de closing du mois
- Alertes / actions requises :
  - Clients en attente de programme
  - Bilans a envoyer
  - Paiements echoues
  - Clients en fin proche
- Graphique : evolution CA des 12 derniers mois

**Roles :** Tous (contenu adapte au role — le coach ne voit que ses clients)

---

### 5.2 Setting (Chatwoot Embed)

**Chatwoot embarque en iframe** pour la prospection Instagram.

**Contenu :**
- Iframe pleine page de l'instance Chatwoot self-hosted
- Filtrage par canal Instagram
- Le tracking des conversations est automatique (pas de reporting manuel)

**Donnees tracees automatiquement (via Chatwoot API) :**
- Nombre de conversations initiees
- Nombre de liens de booking envoyes
- Taux de conversion conversation → booking

**Roles :** Admin, Sales

---

### 5.3 Setting WA (Chatwoot Embed + Leads)

**Chatwoot embarque** pour le setting WhatsApp + **listing des leads ads**.

**Contenu :**
- **Onglet 1 — Chatwoot** : iframe WhatsApp
- **Onglet 2 — Leads** : tableau de tous les leads entrants (ads Facebook/Instagram)
  - Colonnes : Nom, Email, Telephone, Source (VSL ADS / FORMULAIRE ADS), Statut setting, Date d'arrivee
  - Statuts : New lead, MSG 1 Envoye, En conversation, Pas de reponse, Lien de call envoye, Call valide, Perdu/Refus, Relancer 1/2/3
  - Filtres : statut, source, date
  - Les leads arrivent automatiquement (Meta → Make → webhook Convex)
  - Message automatique envoye via Chatwoot a l'arrivee du lead

**Roles :** Admin, Sales

---

### 5.4 Sales/Closing

#### 5.4.1 Dashboard

**KPIs auto-calcules** a partir des statuts CRM (plus de reporting manuel).

**Metriques :**
- Calls programmes (Schedule)
- Calls effectues (Live) + Show Rate
- Follow-ups (R2)
- Closes du mois + Close Rate
- CA contracte du mois
- CA collecte du mois
- CA collecte par call
- Panier moyen

**Graphiques :**
- Funnel de vente (4 etapes : Programme → Effectue → Qualifie → Close)
- Evolution des calls (jour/semaine/mois)
- Revenue chart (contracte vs collecte)
- Top closers (classement par taux de closing)
- Raisons de perte (ranking)

**Filtres :** Par closer, par periode (date range)

#### 5.4.2 Pipeline Vente

**Vue Kanban** des prospects par etape de closing.

**Colonnes :**
| Etape | Description |
|-------|------------|
| Appel a venir | RDV confirme, pas encore passe |
| Appel du jour | Appels programmes aujourd'hui |
| Follow up | Rappel necessaire (R2, R3...) |
| No show | Le prospect ne s'est pas presente |
| En attente | En reflexion, pas de decision |
| Close | Deal signe (paiement recu) |
| Perdu | Deal perdu |

**Actions sur chaque carte :**
- Drag & drop entre colonnes
- Clic → ouvre la fiche CRM complete
- Quick actions : changer etape, ajouter note, envoyer lien de paiement

**Cartes :**
- Nom du prospect
- Source (badge couleur)
- Montant potentiel
- Date du prochain call
- Setter + Closer assignes
- Tags qualification (Qualifie / Non Qualifie)

#### 5.4.3 CRM

**Liste complete** de tous les prospects/leads.

**Colonnes :**
- Contact (nom)
- Email, Telephone, Instagram
- Source
- Type (Client / Prospect / Ancien Client)
- Qualification (Qualifie / Non Qualifie)
- Etape Closing
- Setter, Closer
- Date booking call
- Montant contracte (si close)

**Actions :**
- Clic sur un prospect → fiche CRM detaillee
- Filtres : etape, source, qualification, setter, closer, periode
- Recherche par nom/email/telephone
- Export CSV

**Fiche CRM detaillee :**
- Informations contact (nom, email, tel, Instagram, adresse)
- Reponses au questionnaire (du booking)
- Notes internes
- Source + Type + Qualification
- Etape closing (dropdown)
- Raison de la perte (si perdu)
- Date booking, Date appel, Meeting URL, Video du call, Transcript
- Setter + Closer assignes
- Lien de paiement associe
- Code de reduction applique
- Historique des interactions
- Actions : Envoyer lien de paiement, Changer etape, Ajouter note, Lancer onboarding (si close)

#### 5.4.4 Gestion des Calls

**Vue calendrier/liste** des appels programmes.

**Contenu :**
- Vue jour/semaine avec les calls programmes
- Pour chaque call : nom du prospect, heure, closer assigne, lien Google Meet
- Statut : A venir, En cours, Termine, No show
- Quick actions : rejoindre le Meet, voir la fiche CRM, marquer no show
- Sync en temps reel avec Google Calendar

#### 5.4.5 New Close

**Liste des prospects recemment closes.**

**Contenu :**
- Prospects dont le paiement vient d'etre detecte (webhook PID)
- Informations : nom, montant, prestation, date de closing
- Actions : Voir la fiche client, Lancer l'onboarding (webhook Make → Telegram)
- Statut onboarding : En attente, En cours, Groupe cree, Onboarding valide

**Automatismes :**
- Paiement detecte → prospect passe a "Close" dans le CRM
- Prospect "Close" → cree automatiquement une fiche client dans Operationnel
- Coach attribue automatiquement (ou manuellement par l'admin)

#### 5.4.6 Suivi Paiements & Commissions

**Vue globale** des paiements et commissions.

**Onglet Paiements :**
- Toutes les transactions (Stripe + PayPal)
- Colonnes : Client, Montant, Date, Source paiement, Statut (Succeed/Failed/Refunded), Echeance
- Filtres : statut, source, periode
- Alertes : paiements echoues, relances a faire

**Onglet Commissions :**
- Par membre d'equipe (setter + closer)
- Calcul automatique : montant de chaque paiement x % commission du membre
- Deux modes : commission sur contracte vs commission sur collecte
- Colonnes : Membre, Role, % Commission, CA genere, Commission due
- Export CSV pour la comptabilite

**Donnees Airtable de reference :**
- Setter a un % de vente sur chaque paiement
- Closer a un % de vente sur chaque paiement
- Les % sont definis par membre dans la table Equipe
- Formules : Commission Closing = Montant x % Closer, Commission Setting = Montant x % Setter

---

### 5.5 Operationnel

#### 5.5.1 Dashboard

**KPIs clients actifs.**

**Metriques :**
- Clients actifs total
- Clients en attente de programme
- Clients en fin proche (< 30 jours)
- Clients en pause
- Nouveaux clients du mois
- Repartition par coach (bar chart horizontal)
- Evolution clients actifs (12 mois)
- Taux de retention

#### 5.5.2 Listing Clients

**Table groupee** par coach attitré puis par statut client.

**D'apres le screenshot Airtable :**
- Groupement niveau 1 : Coach attitré (avec nombre de clients)
- Groupement niveau 2 : Statut Client (badge couleur + nombre)
- Colonnes : Client, Fichier coaching (lien Google Sheets), Email, Telephone, Statut Client, Jour du Bilan, Date de fin

**Statuts Client :**
| Statut | Couleur | Description |
|--------|---------|------------|
| Acompte | Orange | Acompte recu, pas encore demarre |
| Nouveau client | Jaune | Vient de signer, en attente de setup |
| En attente de programme | Bleu | Programme pas encore cree |
| Active | Vert | Client actif en cours d'accompagnement |
| Paused | Gris | En pause (compteur de jours) |
| Renew | Violet | Renouvellement en cours |
| Fin proche | Rouge/alerte | < 30 jours avant fin de contrat |
| Termine | Gris fonce | Accompagnement termine |
| Archived | Gris clair | Archive |

**Filtres :** Coach, Statut, Date de creation, Recherche texte
**Actions :** Clic sur un client → fiche client, Export CSV

#### 5.5.3 Fiches Clients

**Fiche detaillee** d'un client (d'apres screenshot Airtable).

**Section 1 — Header :**
- Nom du client (editable)
- Bouton "Supprimer client" (admin only)
- Statut Client (dropdown)
- Prestation (dropdown : 1M_Oneshot, 3M_Oneshot, 3M_2x, 3M_3x, 6M_Oneshot, 6M_2x, 6M_4x, 6M_6x, 12M_12x)

**Section 2 — Informations coaching :**
- Coach attitré (select avec card : nom, role, bio)
- Training LOG (lien Google Sheets)
- telegram_group_url (lien Telegram du groupe)
- Date de debut (date picker)
- Date de fin calculee (auto : debut + duree prestation)
- Nb jours pause (number)
- Date de fin reelle (pauses incluses) (auto : fin calculee + jours pause)

**Section 3 — Contact :**
- Client (nom complet)
- Adresse
- Email
- Telephone
- Lien formulaire Onboarding (auto-genere avec record ID)
- Lien formulaire bilan mensuel (auto-genere avec record ID)
- Notes (rich text)
- Date d'entree/closing du client
- Dossier client (lien Google Drive)

**Section 4 — Bilan mensuel / Onboarding :**
- Liste des bilans recus (formulaire integre)
- Chaque bilan : date, type (Onboarding / Bilan du mois), etape (Check answer / Done)
- Photos de progression
- Bilan sang (attachment)
- Lien Loom

**Section 5 — Paiements / Facturations :**
- Montant Contracte (TTC) — affichage en EUR
- Total CA Collecte TTC — calcul auto
- Restant a payer — calcul auto (contracte - collecte)
- % Avancement Paiement — progress bar
- **Listing des paiements** (table) :
  - Statut (Succeed / Failed / Refunded — badges couleur)
  - Nom de la transaction
  - Date de la transaction
  - Montant
  - Source (Stripe / PayPal)
- Bouton "Ajouter paiement" (manuel)

#### 5.5.4 Onboarding / Bilan

**Form builder integre** (remplace Tally).

**Fonctionnalites :**
- Creer des formulaires personnalises (drag & drop ou liste de champs)
- Types de champs : texte court, texte long, select, multi-select, date, nombre, email, telephone, fichier upload (photos), rating (1-5)
- Deux types de formulaires : Onboarding, Bilan mensuel
- Chaque formulaire est lie a un client (via record ID dans l'URL)
- Le client remplit le formulaire sur une page publique (pas besoin de compte)
- Les reponses arrivent dans la fiche client automatiquement
- Notifications (webhook Make) quand un bilan est recu

**URL publique :** `app.galdencoaching.com/form/{formId}?client={clientId}`

#### 5.5.5 Tracking Coach

**Evaluation des coaches** par d'autres coaches (revue par les pairs).

**Criteres (rating 1-5) :**
- Delai de reponses < 24h
- Relance clients
- Position professionnelle
- Qualite de la diete
- Qualite du programme
- Energie

**Contenu :**
- Coach evalue (select)
- Coach evaluateur (select)
- Scores par critere
- Moyenne calculee automatiquement
- Historique des evaluations

---

### 5.6 Equipes

**Gestion de l'equipe interne.**

**Contenu :**
- Liste des membres en cards (comme prime_equipe existant)
- Pour chaque membre :
  - Photo de profil
  - Nom
  - Role (Admin / Sales / Coach) + badge couleur
  - Statut (In Team / Off Team)
  - Bio / Specialite
  - Email, Telephone
  - % Commission (pour setters/closers)
  - Prix par eleve (pour coaches)
  - Lien Calendly/Google Calendar
  - Nombre de clients actifs (auto-calcule)
- Actions :
  - Inviter un nouveau membre (modal : email + role → Resend)
  - Modifier un profil
  - Desactiver un membre (Off Team)
  - Voir les stats individuelles

**Roles :** Admin uniquement

---

### 5.7 Pilotage Executif

#### 5.7.1 Dashboard Finance

**Vue financiere globale.**

**KPIs :**
- CA Collecte total (all time + ce mois)
- CA Contracte total
- Sorties total
- Benefices (CA Collecte - Sorties)
- Ratio CA/Profits
- Taux de collecte (Collecte / Contracte)

**Graphiques :**
- Evolution CA mensuel (12 mois) — area chart contracte vs collecte
- Repartition des sources de paiement (Stripe / PayPal / Virement) — donut
- Top prestations par CA — bar chart

**Filtres :** Periode (mois, trimestre, annee, custom)

#### 5.7.2 Ad Manager

**Dashboard Meta Ads** (sync depuis l'API Meta via Airtable ou directement).

**KPIs :**
- Spend total
- Impressions
- ROAS
- CTR
- CPA
- Conversions

**Contenu :**
- Performance chart (ROAS + Spend sur 14 jours) — line chart
- Liste des campagnes actives avec statut, budget, revenue, conversions
- Top creatives (videos) avec metriques, thumbnail, hook
- Player video avec panneau de stats
- Filtres : date range, campagne, ad set

**Integration :** Sync depuis la table Meta_Ads Airtable (via Make) ou connexion directe API Meta

#### 5.7.3 Centralisation Factures

**Toutes les factures** (clients + internes).

**Contenu :**
- Liste de toutes les factures emises
- Colonnes : numero, client/membre, montant, date, type (Acompte / Paiement complet), statut
- Filtres : type, statut, periode
- Generation PDF (future)

#### 5.7.4 Factures en Attente

**Factures non payees** necessitant une action.

**Contenu :**
- Liste des factures dont le paiement est en attente ou echoue
- Actions : relancer (webhook Make), marquer comme regle, annuler

#### 5.7.5 Gestion Coach

**Attribution et charge des coaches.**

**Contenu :**
- Vue par coach : nombre de clients actifs, capacite max, taux d'occupation
- Repartition de la charge (bar chart horizontal)
- Attribution d'un nouveau client a un coach (drag & drop ou select)
- Historique des attributions
- Commissions par coach (prix par eleve x clients actifs)

#### 5.7.6 SOPs

**Procedures operationnelles standard.**

**Contenu :**
- Liste des SOPs par categorie (Sales, Coaching, Admin, Process)
- Chaque SOP : titre, categorie, contenu rich text, fichiers attaches, derniere MAJ
- CRUD complet (creer, modifier, supprimer)
- Recherche full-text

#### 5.7.7 Liens de Paiement

**Creation et gestion des liens de paiement PID.**

**Contenu :**
- Liste des offres existantes
- Pour chaque offre : titre, type (Classique / Renouvellement / Acompte), montant, modalite (unique / mensuel / fixe + mensuel), duree, statut (Actif / Inactif)
- Creer une nouvelle offre (modal)
- Generer un lien PID pour un prospect (select prospect → genere `pay.galdencoaching.com/?offer=xxx&pid=yyy`)
- Copier le lien en 1 clic
- Voir l'historique des liens generes et leur statut

---

## 6. Systeme de Booking (book.galdencoaching.com)

### Architecture

Le booking system remplace iClosed. Il gere :
- La creation de calendriers par source
- Le formulaire de qualification pre-booking
- La disponibilite round-robin des closers
- La creation automatique d'events Google Calendar + Google Meet

### 6.1 Admin — Gestion des Calendriers

**Accessible depuis Sales/Closing → Gestion des Calls**

**Creer un calendrier :**
- Nom de l'evenement (ex: "Bilan offert")
- Couleur
- Lieu : Google Meet (auto)
- Description / Instructions (rich text)
- **Slug custom** editable (ex: `bilan-offert-bio-insta`)
  → URL generee : `book.galdencoaching.com/{slug}`
- Note interne (ex: "Bio Insta" — visible que par l'equipe)
- Source associee (pour le tracking CRM)

**Hotes (Closers) :**
- Selectionner les closers assignes a ce calendrier
- Pour chaque closer : priorite (Haute / Moyenne / Basse)
- Les closers doivent avoir connecte leur Google Calendar
- Round-robin : les creneaux sont distribues par priorite puis par disponibilite

**Options avancees :**
- Horaires et limites : jours dispo, heures min/max, duree du call (30min, 45min, 1h), buffer entre calls, limite de calls par jour
- Questions des invites : formulaire dynamique (form builder)
- Disqualification : regles automatiques (ex: si reponse X → disqualifie)
- Routage conditionnel : si reponse Y → assigner a un closer specifique
- Notifications : email de confirmation, rappel J-1, rappel H-1
- Page de confirmation : message personnalise post-booking

### 6.2 Page Publique — Booking

**URL :** `book.galdencoaching.com/{slug}`

**Etape 1 — Formulaire :**
- Titre + description de l'evenement
- Champs fixes : Email, Prenom, Nom
- Champs custom (configures par l'admin via le form builder)
- Bouton "Continuer"
- A la soumission : le lead est cree automatiquement dans le CRM avec la source du calendrier

**Etape 2 — Selection du creneau :**
- Calendrier mensuel (navigation mois)
- Jours avec dispo affiches en gras
- Creneaux horaires disponibles (round-robin par priorite puis dispo Google Calendar)
- Format : 12:00 PM, 01:00 PM, etc. (configurable 12h/24h)
- Le prospect ne voit pas le nom du closer

**Confirmation :**
- Message de confirmation personnalise
- Email de confirmation avec lien Google Meet
- Event cree dans le Google Calendar du closer assigne
- Lead mis a jour dans le CRM : etape "Appel a venir" + closer assigne + date du call

### 6.3 Integration Google

- **Google Calendar API** : lecture des disponibilites + creation d'events
- **Google Meet** : lien genere automatiquement dans l'event
- Chaque closer connecte son compte Google (OAuth2)
- Sync bidirectionnelle : si le closer bloque un creneau dans son Calendar, il n'est plus dispo sur le booking

---

## 7. Systeme de Paiement (pay.galdencoaching.com)

### Architecture PID (Payment Intent ID)

> Document complet fourni par Gregory — architecture validee.

### 7.1 Principe

Le PID est un identifiant unique genere **avant** que le prospect touche quoi que ce soit. Il est integre dans l'URL du lien de paiement et ne depend d'aucune donnee saisie.

```
pay.galdencoaching.com/?offer=abc&pid=x9k2m7
```

**Proprietes du PID :**
- UUID court genere par l'ERP au moment de l'envoi du lien
- Stocke en DB immediatement avec le prospect associe
- Jamais modifiable par le prospect
- Independant de la stack technique

### 7.2 Providers

**Stripe :**
- Carte bancaire (CB, Visa, Mastercard)
- Apple Pay / Google Pay
- Paiement instantane
- Gestion native des abonnements et echelonnements
- `client_reference_id` passe dans l'URL → renvoye dans le webhook `checkout.session.completed`

**PayPal :**
- Wallet PayPal
- Paiement en 4X sans frais (30-2000 EUR, residents France)
- `custom_id` injecte dans l'order → recupere via `order_id` du webhook `PAYMENT.CAPTURE.COMPLETED`

### 7.3 Flow

```
1. Admin cree l'offre en DB (montant, echelonnement, providers)
2. Admin genere un PID et l'associe au prospect
3. Admin envoie le lien : pay.galdencoaching.com/?offer=abc&pid=x9k2m7
4. Le prospect clique
5. La page charge l'offre via offer_id
6. Le prospect choisit Stripe ou PayPal
7. Au clic "payer" → la page appelle le backend Convex (HTTP action)
8. Le backend cree la transaction chez le provider avec le PID injecte
9. Le provider renvoie un provider_tx_id
10. Stockage en DB : { pid, provider_tx_id, offer_id, status: pending }
11. Le provider traite le paiement
12. Webhook recu → signature verifiee → idempotence verifiee
13. Lookup : provider_tx_id → pid → prospect identifie
14. Paiement enregistre → session MAJ
15. Si premier paiement : prospect passe a "Close" dans CRM → fiche client creee
```

### 7.4 Paiements echelonnes

Un seul PID pour tout le contrat. La session passe de `pending` → `partial` → `completed`.

```
Contrat : 3 000 EUR en 3 fois
pid = x9k2m7
├── Echeance 1 — J+0   → 1 000 EUR — confirmed
├── Echeance 2 — J+30  → 1 000 EUR — confirmed
└── Echeance 3 — J+60  → 1 000 EUR — pending
Session status : partial (2 000 / 3 000 EUR encaisses)
```

### 7.5 Page de paiement

**URL :** `pay.galdencoaching.com/?offer={offerId}&pid={pid}`

**Contenu :**
- Logo Prime Coaching
- Nom de l'offre + montant
- Detail de l'echelonnement si applicable
- Choix du moyen de paiement : Stripe (CB) / PayPal
- Bouton "Payer"
- Branding Prime Coaching (#D0003C)

### 7.6 Schema DB

```
offers:
  offerId, name, amount (centimes), currency (EUR), installments (JSON),
  providers (["stripe","paypal"]), active, createdAt

transactions:
  pid (UUID court), offerId, prospectName, prospectEmail, prospectPhone,
  convexClientId (nullable), provider, providerTxId, status,
  installmentN, installmentOf, createdAt, confirmedAt

payments:
  paymentId, pid, amount (centimes), providerTxId, provider,
  installmentN, status, confirmedAt

webhookEvents:
  providerEventId, provider, type, processed, receivedAt, processedAt
```

---

## 8. Form Builder (remplace Tally)

### 8.1 Admin — Creation de formulaires

**Types de formulaires :** Onboarding, Bilan mensuel, Custom

**Champs disponibles :**
| Type | Description |
|------|------------|
| shortText | Texte court (1 ligne) |
| longText | Texte long (multi-lignes) |
| email | Email avec validation |
| phone | Telephone avec validation |
| number | Nombre |
| select | Liste deroulante (options configurables) |
| multiSelect | Selection multiple |
| date | Date picker |
| rating | Notation 1-5 etoiles |
| fileUpload | Upload fichier (photos, PDF) |
| section | Separateur / titre de section |

**Configuration par champ :**
- Label
- Placeholder
- Requis (oui/non)
- Description / aide

### 8.2 Page publique

**URL :** `app.galdencoaching.com/form/{formId}?client={clientId}`

- Page brandee Prime Coaching
- Formulaire responsive
- Upload de photos (progression physique)
- Soumission → donnees enregistrees dans la fiche client
- Notification webhook Make a l'equipe

---

## 9. Branding & Design System

### Couleurs
| Token | Hex | Usage |
|-------|-----|-------|
| primary | #D0003C | Navbar, boutons, accents |
| primary-light | #E84B5E | Hover states |
| primary-50 | #FEF2F5 | Backgrounds legers |
| background | #F8FAFC | Fond de page |
| card | #FFFFFF | Cards |
| text | #0F172A | Texte principal (slate-900) |
| text-muted | #64748B | Texte secondaire (slate-500) |
| success | #10B981 | Statuts positifs (Active, Succeed) |
| warning | #F59E0B | Alertes (Acompte, En attente) |
| error | #EF4444 | Erreurs (Failed, Refunded) |
| info | #3B82F6 | Information |

### Logos
- **Navbar** (fond rouge) : logo blanc (`/Logo/logo complet blanc .png`)
- **Pages publiques** (fond blanc) : logo rouge (`/Logo/logo complet rouge.png`)
- **Favicon** : logo seul rouge (`/Logo/logo rouge.png`)

### Typographie
- Font : Inter (system fallback: system-ui, sans-serif)
- Display : Inter Display (headings)

### Composants (shadcn/ui)
- Cards avec border-radius xl, shadow-sm
- Tables avec hover states
- Badges couleur par statut
- Progress bars pour avancement paiement
- Modals pour creation/edition
- Dropdowns pour filtres
- Date pickers
- Kanban board (pipeline)
- Charts (Recharts)

---

## 10. Integrations

### 10.1 Stripe
- **Checkout Session** avec `client_reference_id` = PID
- **Webhooks** : `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- **Products + Prices** : synchronises depuis les offres Convex
- **HTTP Action** Convex pour les webhooks

### 10.2 PayPal
- **Orders API** avec `custom_id` = PID
- **Webhooks** : `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`
- **HTTP Action** Convex pour les webhooks

### 10.3 Google Calendar + Meet
- **OAuth2** : chaque closer connecte son compte
- **Calendar API** : FreeBusy (disponibilites), Events (creation)
- **Meet** : lien genere automatiquement dans l'event
- Tokens stockes de maniere securisee dans Convex

### 10.4 Chatwoot
- **Instance self-hosted** deja en place
- **Embed** : iframe dans les pages Setting et Setting WA
- **API** (optionnel) : recuperation des stats de conversation pour les dashboards

### 10.5 Meta Ads
- **Sync** : via table Airtable Meta_Ads + Make, ou connexion directe API Meta
- **Donnees** : campagnes, ad sets, ads avec metriques (spend, impressions, ROAS, CTR, CPA)
- **Refresh** : periodique (toutes les heures ou a la demande)

### 10.6 Resend
- **Transactional emails** : invitation equipe, confirmation booking, notification paiement
- **API Key** fournie
- **Templates** : brandes Prime Coaching

### 10.7 Make (Automations)
- **Webhooks sortants** depuis Convex (HTTP actions) :
  - Nouveau lead → Make → message Chatwoot
  - Nouveau close → Make → onboarding Telegram (creation groupe, messages)
  - Bilan recu → Make → notification equipe
  - Paiement echoue → Make → alerte admin
- **Webhooks entrants** vers Convex :
  - Meta Ads → Make → Convex (nouveau lead)
  - Stripe/PayPal → Convex directement (pas via Make)

---

## 11. Prestations & Tarification

D'apres les donnees Airtable, les prestations sont :

| Code | Duree | Paiement | Exemple montant |
|------|-------|----------|----------------|
| 1M_Oneshot | 1 mois | Unique | ~500 EUR |
| 3M_Oneshot | 3 mois | Unique | ~1 500 EUR |
| 3M_2x | 3 mois | 2 mensualites | ~750 EUR/mois |
| 3M_3x | 3 mois | 3 mensualites | ~500 EUR/mois |
| 6M_Oneshot | 6 mois | Unique | ~1 997 EUR |
| 6M_2x | 6 mois | 2 paiements | ~2 498 EUR x2 |
| 6M_4x | 6 mois | 4 mensualites | ~500 EUR/mois |
| 6M_6x | 6 mois | 6 mensualites | ~417 EUR/mois |
| 12M_12x | 12 mois | 12 mensualites | ~350 EUR/mois |
| Acompte | - | Unique | Variable |

Les montants sont configurables par offre. Les formules de date de fin sont automatiques :
- `date_fin = date_debut + duree_prestation`
- `date_fin_reelle = date_fin + nb_jours_pause`

---

## 12. Calcul des Commissions

### Logique

Chaque membre Sales a un **% de vente** defini dans son profil Equipe.

**Commission sur chaque paiement :**
- `commission_closing = montant_paiement x %_closer`
- `commission_setting = montant_paiement x %_setter`

**Deux modes de calcul :**
- Sur **contracte** : commission calculee sur le montant total signe
- Sur **collecte** : commission calculee sur chaque paiement recu

Le mode est configurable par l'admin.

### Exemple
```
Contrat : 1 997 EUR en 6x (332,83 EUR/mois)
Closer : 10% → 199,70 EUR total (ou 33,28 EUR par echeance)
Setter : 5% → 99,85 EUR total (ou 16,64 EUR par echeance)
```

---

## 13. Donnees Airtable — Reference

### Tables a migrer (priorite)

| Table Airtable | Table Convex | Priorite |
|---------------|-------------|----------|
| Equipe | users / teamMembers | P0 |
| CRM | leads | P0 |
| Clients | clients | P0 |
| Paiements | payments | P0 |
| Liens de paiements | offers | P0 |
| Setting WA | leads (source: ads) | P0 |
| Pipeline Setting | leads (source: instagram) | P1 |
| Bilan | bilans | P1 |
| Reporting Closing | auto-calcule | - |
| Reporting Setting | auto-calcule | - |
| Rapports Financiers | auto-calcule | - |
| Meta_Ads | metaAds | P1 |
| Taches | tasks | P2 |
| Sub-Taches | subTasks | P2 |
| Sorties | expenses | P1 |
| Facture Interne | invoicesInternal | P2 |
| Factures Clients | invoicesClients | P2 |
| CODE DE REDUCTION | discountCodes | P1 |
| Tracking coach | coachTracking | P2 |
| KPI | auto-calcule | - |
| Assets / SOPs / Ressources | resources | P2 |
| Calendrier contenus | - (hors scope v1) |
| Account_Data | config | P2 |

### Tables eliminees (auto-calculees)
- Reporting de setting → calcule depuis Chatwoot + CRM
- Reporting Closing → calcule depuis CRM (statuts)
- Reporting mensuel closing → aggregation auto
- Rapports Financiers → calcule depuis payments
- KPI → calcule depuis clients
- KPI Coaching → calcule depuis clients

---

## 14. Schema Convex (Draft)

> Le schema complet sera genere dans `docs/schema-draft.ts` apres validation du PRD.

### Tables principales

```
users           — Membres de l'equipe (auth + profil)
leads           — Tous les prospects (CRM + Setting WA + Pipeline)
clients         — Clients actifs/archives
offers          — Offres de paiement
transactions    — Sessions de paiement (PID)
payments        — Paiements individuels
webhookEvents   — Idempotence webhooks
calendars       — Calendriers de booking
bookings        — RDV pris
forms           — Formulaires (onboarding, bilans)
formFields      — Champs des formulaires
formSubmissions — Reponses aux formulaires
bilans          — Bilans clients (reponses)
coachTracking   — Evaluations coaches
expenses        — Sorties / depenses
invoices        — Factures (clients + internes)
discountCodes   — Codes de reduction
metaAds         — Donnees Meta Ads
resources       — SOPs, assets, ressources
tasks           — Taches internes
subTasks        — Sous-taches
config          — Configuration globale
```

---

## 15. Priorites MVP

### P0 — MVP (lancer et remplacer Airtable)
1. Auth + Equipes (invitation Resend)
2. CRM + Pipeline Vente (kanban)
3. Booking System (remplace iClosed)
4. Systeme de paiement PID (Stripe + PayPal)
5. Gestion clients (listing + fiches)
6. Dashboard Sales (KPIs auto-calcules)
7. Chatwoot embed (Setting + Setting WA)
8. Dashboard Overview

### P1 — v1.1
1. Form Builder (remplace Tally)
2. Ad Manager (Meta Ads)
3. Dashboard Finance
4. Suivi paiements & commissions
5. Gestion Coach (attribution, charge)
6. Codes de reduction
7. Sorties / depenses
8. Leads listing (Setting WA)

### P2 — v2
1. Centralisation factures
2. Tracking Coach
3. SOPs
4. Taches / sous-taches
5. Calendrier de contenus
6. Export PDF factures
7. Migration donnees Airtable

---

## 16. Metriques de Succes

| Metrique | Objectif |
|----------|---------|
| Temps d'adoption | Equipe utilise l'ERP a 100% en < 2 semaines |
| Outils remplaces | iClosed, Systeme.io, Tally elimines |
| Reporting | 0 reporting manuel — tout auto-calcule |
| Paiements | 100% des paiements passes via PID |
| Leads | Tous les leads centralises (ads + Instagram + organique) |

---

*PRD genere le 29 mars 2026 — Session de specification avec Gregory Giunta (CEO, Prime Coaching)*
*Stack : Convex + Next.js 15 + TypeScript + Tailwind + shadcn/ui*
