# Page Tree — Galden Coaching ERP

## Layout Groups

### (public) — Pages sans auth
Pages accessibles sans connexion. Branding Prime Coaching, fond blanc, logo rouge.

### (auth) — Pages d'authentification
Login, invitation, reset password. Layout centre, fond gradient.

### (dashboard) — Application principale
Sidebar rouge #D0003C, logo blanc, header avec breadcrumb + user menu. Requiert auth.

### (booking) — Pages de booking publiques
Domaine : book.galdencoaching.com. Branding Prime Coaching. Pas de sidebar.

### (payment) — Pages de paiement publiques
Domaine : pay.galdencoaching.com. Branding Prime Coaching. Pas de sidebar.

### (form) — Formulaires publics
Formulaires de bilans/onboarding. Branding Prime Coaching. Pas de sidebar.

---

## Routes Detaillees

### Auth Pages

```
/login
  Layout: (auth)
  Auth: non
  Components:
    ├── Logo Prime Coaching (rouge)
    ├── LoginForm
    │   ├── Input email
    │   ├── Input password
    │   ├── Checkbox "Se souvenir de moi"
    │   └── Button "Se connecter"
    └── Link "Mot de passe oublie ?"
  States:
    - Loading: spinner sur bouton
    - Error: toast rouge "Email ou mot de passe incorrect"
    - Success: redirect vers /overview

/invite/{token}
  Layout: (auth)
  Auth: non
  Components:
    ├── Logo Prime Coaching
    ├── Message "Vous avez ete invite a rejoindre Prime Coaching"
    ├── Role pre-affiche (badge)
    ├── SetPasswordForm
    │   ├── Input nom complet
    │   ├── Input password
    │   ├── Input confirm password
    │   └── Button "Creer mon compte"
  States:
    - Token invalide: message erreur + lien contact admin
    - Token expire: idem
    - Success: redirect vers /overview

/forgot-password
  Layout: (auth)
  Auth: non
  Components:
    ├── Input email
    └── Button "Envoyer le lien"

/reset-password/{token}
  Layout: (auth)
  Auth: non
  Components:
    ├── Input new password
    ├── Input confirm
    └── Button "Reinitialiser"
```

### Dashboard — Overview

```
/overview
  Layout: (dashboard)
  Auth: oui
  Roles: tous
  Components:
    ├── WelcomeCard
    │   └── "Bonjour {prenom}" + date du jour
    ├── KPICards (grid 4 colonnes)
    │   ├── CA collecte ce mois (EUR)
    │   ├── Clients actifs (nombre)
    │   ├── Calls programmes aujourd'hui (nombre)
    │   └── Taux de closing ce mois (%)
    ├── AlertsSection (2 colonnes)
    │   ├── Column 1: Actions requises
    │   │   ├── Clients en attente de programme
    │   │   ├── Bilans a envoyer
    │   │   └── Paiements echoues
    │   └── Column 2: Fin proche
    │       └── Clients dont le contrat expire < 30j
    └── RevenueChart
        └── Area chart CA 12 derniers mois
  Mobile:
    - KPIs: 2 colonnes
    - Alerts: 1 colonne stacked
```

### Setting

```
/setting
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    └── ChatwootEmbed (iframe pleine page)
        ├── Instance Chatwoot self-hosted
        ├── Filtre canal: Instagram
        └── Height: calc(100vh - header)
```

### Setting WA

```
/setting-wa
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── Tabs
    │   ├── Tab "Conversations" → ChatwootEmbed (WhatsApp)
    │   └── Tab "Leads"
    │       ├── FilterBar
    │       │   ├── Search (nom/email/tel)
    │       │   ├── Select statut
    │       │   ├── Select source (VSL ADS / FORMULAIRE ADS)
    │       │   └── DateRange
    │       └── LeadsTable
    │           ├── Columns: Nom, Email, Tel, Source (badge), Statut (badge), Date
    │           ├── Row click → modal detail lead
    │           └── Pagination
    States:
      - Empty: "Aucun lead pour le moment"
      - Loading: skeleton table
```

### Sales/Closing

```
/sales
  → redirect vers /sales/dashboard

/sales/dashboard
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── FilterBar
    │   ├── Select closer (ou "Tous")
    │   └── DateRange
    ├── KPICards (grid 4)
    │   ├── Calls programmes
    │   ├── Show Rate (%)
    │   ├── Close Rate (%)
    │   └── CA collecte ce mois
    ├── KPICards secondary (grid 2)
    │   ├── CA collecte par call
    │   └── Panier moyen
    ├── FunnelChart (Programme → Effectue → Qualifie → Close)
    ├── Row (2 colonnes)
    │   ├── TopClosersTable (classement par closing rate)
    │   └── LossReasons (ranking raisons de perte)
    ├── RevenueChart (contracte vs collecte, area chart)
    └── EvolutionChart (volume calls, bar chart, toggle jour/semaine/mois)

/sales/pipeline
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── FilterBar (search + source + qualification)
    └── KanbanBoard
        ├── Column "Appel a venir" (count)
        ├── Column "Appel du jour" (count)
        ├── Column "Follow up" (count)
        ├── Column "No show" (count)
        ├── Column "En attente" (count)
        ├── Column "Close" (count)
        └── Column "Perdu" (count)
        Each card:
          ├── Nom prospect
          ├── Source (badge)
          ├── Montant potentiel
          ├── Date prochain call
          └── Setter + Closer (avatars)
    Interactions:
      - Drag & drop entre colonnes
      - Click → /sales/crm/{leadId}

/sales/crm
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── FilterBar
    │   ├── Search (nom/email/tel)
    │   ├── Select etape
    │   ├── Select source
    │   ├── Select qualification
    │   ├── Select setter
    │   ├── Select closer
    │   └── DateRange
    └── CRMTable
        ├── Columns: Contact, Email, Tel, Source, Type, Qualification, Etape, Setter, Closer, Date call, Montant
        ├── Row click → /sales/crm/{leadId}
        └── Pagination + count total

/sales/crm/{leadId}
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── Header: nom + etape (dropdown editable) + actions
    ├── Section "Contact"
    │   ├── Nom, Email, Tel, Instagram, Adresse
    │   └── Edit inline
    ├── Section "Qualification"
    │   ├── Source (badge), Type (badge), Qualification (badge)
    │   ├── Reponses questionnaire (accordion)
    │   └── Raison de perte (si perdu)
    ├── Section "Appel de vente"
    │   ├── Date booking, Date appel, Meeting URL
    │   ├── Video du call (lien Loom)
    │   ├── Transcript
    │   └── Notes internes (rich text)
    ├── Section "Commercial"
    │   ├── Setter + Closer assignes (select)
    │   ├── Lien de paiement (generer / copier)
    │   └── Code de reduction
    ├── Section "Historique"
    │   └── Timeline des changements d'etape
    └── Actions sidebar:
        ├── Button "Envoyer lien de paiement"
        ├── Button "Changer etape"
        ├── Button "Lancer onboarding" (si close)
        └── Button "Supprimer" (admin only)

/sales/calls
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── ViewToggle (Liste / Calendrier)
    ├── ListView
    │   ├── FilterBar (closer, date, statut)
    │   └── Table: Prospect, Closer, Heure, Statut, Meet link
    └── CalendarView
        ├── Week view (7 jours)
        └── Each slot: nom prospect + closer + heure
    Actions:
      - Rejoindre Meet (link)
      - Voir fiche CRM
      - Marquer No Show

/sales/new-close
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── Liste des closes recents
    │   ├── Card par close: nom, montant, prestation, date, statut onboarding
    │   └── Actions: Voir fiche client, Lancer onboarding (webhook Make)
    └── Statuts onboarding: En attente, En cours, Groupe cree, Onboarding valide

/sales/payments
  Layout: (dashboard)
  Auth: oui
  Roles: admin, sales
  Components:
    ├── Tabs
    │   ├── Tab "Paiements"
    │   │   ├── FilterBar (statut, source, periode)
    │   │   └── Table: Client, Montant, Date, Source, Statut (badge), Echeance
    │   └── Tab "Commissions"
    │       ├── FilterBar (membre, periode)
    │       └── Table: Membre, Role, %, CA genere, Commission due
    └── Export CSV button
```

### Operationnel

```
/operationnel
  → redirect vers /operationnel/dashboard

/operationnel/dashboard
  Layout: (dashboard)
  Auth: oui
  Roles: admin, coach (ses clients)
  Components:
    ├── KPICards (grid 5)
    │   ├── Clients actifs
    │   ├── En attente programme
    │   ├── Fin proche (< 30j)
    │   ├── En pause
    │   └── Nouveaux ce mois
    ├── WorkloadChart (bar horizontal: clients par coach)
    └── RetentionChart (area: evolution 12 mois)

/operationnel/clients
  Layout: (dashboard)
  Auth: oui
  Roles: admin, coach (filtre auto sur ses clients)
  Components:
    ├── FilterBar
    │   ├── Select coach
    │   ├── Select statut
    │   ├── Search
    │   └── Grouper (coach + statut / statut seul)
    └── ClientsTable (groupee)
        ├── Group header: Coach attitré (count)
        │   ├── Sub-group: Statut (badge + count)
        │   │   └── Table: Client, Fichier coaching, Email, Tel, Statut, Jour bilan, Date fin
        Interactions:
          - Row click → /operationnel/clients/{clientId}

/operationnel/clients/{clientId}
  Layout: (dashboard)
  Auth: oui
  Roles: admin, coach (son client)
  Components:
    ├── Header
    │   ├── Nom client (editable)
    │   ├── Statut (dropdown)
    │   └── Button "Supprimer" (admin only, rouge)
    ├── Section "Prestation"
    │   ├── Prestation (dropdown)
    │   ├── Coach attitré (card: nom, role, bio)
    ├── Section "Coaching"
    │   ├── Training LOG (lien Google Sheets, ouvre nouvel onglet)
    │   ├── telegram_group_url (lien)
    │   ├── Date de debut, Date de fin calculee
    │   ├── Nb jours pause, Date de fin reelle
    ├── Section "Contact"
    │   ├── Nom, Adresse, Email, Telephone
    │   ├── Lien formulaire Onboarding (auto-genere)
    │   ├── Lien formulaire Bilan (auto-genere)
    │   ├── Notes (rich text)
    │   ├── Date d'entree/closing
    │   └── Dossier client (lien Google Drive)
    ├── Section "Bilan mensuel / Onboarding"
    │   └── Liste des bilans recus (expandable cards)
    │       ├── Date, Type, Etape
    │       ├── Reponses
    │       ├── Photos (gallery)
    │       └── Bilan sang (download)
    └── Section "Paiements / Facturations"
        ├── Montant Contracte TTC
        ├── Total CA Collecte TTC / Restant a payer
        ├── Progress bar % avancement
        └── Table paiements: Statut (badge), Transaction, Date, Montant
            + Button "Ajouter paiement"

/operationnel/onboarding
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── FormBuilder (creation/edition de formulaires)
    │   ├── Liste des formulaires existants
    │   ├── Button "Nouveau formulaire"
    │   └── Pour chaque formulaire:
    │       ├── Nom, Type (Onboarding / Bilan / Custom)
    │       ├── Liste des champs (drag & drop reorder)
    │       ├── Ajouter champ (select type)
    │       └── Preview
    └── SubmissionsList
        ├── Formulaires recus recemment
        └── Filtres: client, type, date

/operationnel/tracking-coach
  Layout: (dashboard)
  Auth: oui
  Roles: admin, coach
  Components:
    ├── EvaluationForm
    │   ├── Select coach evalue
    │   ├── Ratings (6 criteres, 1-5 etoiles)
    │   └── Submit
    └── EvaluationHistory
        ├── Table: Coach, Evaluateur, Date, Moyenne, Detail
        └── Filtres: coach, periode
```

### Equipes

```
/equipes
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── Header
    │   ├── Stats: Total membres, Sales, Coaches
    │   └── Button "Inviter un membre"
    ├── FilterBar (role, statut)
    └── TeamGrid (responsive: 1→2→3→4 colonnes)
        └── MemberCard
            ├── Avatar (photo ou initiales)
            ├── Nom
            ├── Role (badge couleur)
            ├── Statut (In Team / Off Team)
            ├── Bio
            ├── Email, Tel
            ├── % Commission (si sales)
            ├── Prix/eleve (si coach)
            └── Nb clients actifs
    Modal "Inviter":
      ├── Input email
      ├── Select role (Admin / Sales / Coach)
      └── Button "Envoyer l'invitation" (Resend)
    Modal "Editer profil":
      ├── Photo, Nom, Bio, Specialite
      ├── Email, Tel
      ├── Role, Statut
      ├── % Commission, Prix/eleve
      └── Lien Google Calendar
```

### Pilotage Executif

```
/pilotage
  → redirect vers /pilotage/finance

/pilotage/finance
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── KPICards (grid 4)
    │   ├── CA Collecte (all time + ce mois)
    │   ├── CA Contracte
    │   ├── Sorties
    │   └── Benefices + Ratio
    ├── RevenueChart (area: contracte vs collecte, 12 mois)
    ├── Row (2 colonnes)
    │   ├── PaymentSourcesDonut (Stripe/PayPal/Virement)
    │   └── TopPrestationsBar
    └── FilterBar: periode

/pilotage/ads
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── KPICards: Spend, Impressions, ROAS, CTR, CPA, Conversions
    ├── PerformanceChart (ROAS + Spend, 14j)
    ├── CampaignsList (cards: nom, objectif, statut, metriques)
    ├── TopCreatives (videos avec thumbnails + metriques)
    └── VideoPlayerModal (video + stats panel)

/pilotage/factures
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── Tabs: Toutes / En attente
    └── Table: Numero, Client/Membre, Montant, Date, Type, Statut
        + Actions: Relancer, Marquer regle

/pilotage/gestion-coach
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── CoachLoadChart (bar: clients par coach)
    ├── CoachTable: Coach, Clients actifs, Capacite, Taux occupation, Commission
    └── Attribution panel (assigner client → coach)

/pilotage/sops
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── Sidebar categories (Sales, Coaching, Admin, Process)
    ├── SOPList (titre, categorie, derniere MAJ)
    └── SOPEditor (rich text + fichiers)

/pilotage/liens-paiement
  Layout: (dashboard)
  Auth: oui
  Roles: admin
  Components:
    ├── OffersList
    │   ├── Table: Titre, Type, Montant, Modalite, Duree, Statut
    │   └── Button "Nouvelle offre"
    ├── GenerateLinkModal
    │   ├── Select offre
    │   ├── Select prospect (depuis CRM)
    │   └── Button "Generer le lien" → copie URL PID
    └── LinksHistory (liens generes + statut paiement)
```

### Booking (public)

```
book.galdencoaching.com/{slug}
  Layout: (booking)
  Auth: non
  Components:
    ├── Header: Logo Prime Coaching
    ├── StepIndicator: "Remplir le formulaire" → "Reservez votre evenement"
    ├── Step 1 — Formulaire
    │   ├── EventTitle + Description
    │   ├── Input Email *
    │   ├── Input Prenom *
    │   ├── Input Nom *
    │   ├── Custom fields (depuis form builder)
    │   ├── Privacy notice
    │   └── Button "Continuer"
    ├── Step 2 — Selection creneau
    │   ├── Calendar (mois, navigation)
    │   ├── Jours disponibles (bold)
    │   ├── Time slots (round-robin)
    │   └── Button "Confirmer"
    └── Step 3 — Confirmation
        ├── Message personnalise
        ├── Details du RDV (date, heure)
        └── "Un email de confirmation vous a ete envoye"
  Mobile: Steps stacked vertically
```

### Payment (public)

```
pay.galdencoaching.com/?offer={offerId}&pid={pid}
  Layout: (payment)
  Auth: non
  Components:
    ├── Header: Logo Prime Coaching
    ├── OfferSummary
    │   ├── Nom de l'offre
    │   ├── Montant total
    │   └── Detail echelonnement (si applicable)
    ├── PaymentMethodSelector
    │   ├── Option "Carte bancaire" (Stripe) — avec icones CB/Visa/MC/Apple Pay
    │   └── Option "PayPal" — avec logo PayPal
    └── PayButton "Payer {montant} EUR"
  States:
    - Loading: skeleton
    - Error (offre invalide): message + contact admin
    - Error (PID deja utilise): "Ce lien a deja ete utilise"
    - Processing: spinner + "Paiement en cours..."
    - Success: "Paiement confirme !" + message de bienvenue
    - Failed: "Le paiement a echoue" + retry button
```

### Form (public)

```
app.galdencoaching.com/form/{formId}?client={clientId}
  Layout: (form)
  Auth: non
  Components:
    ├── Header: Logo Prime Coaching
    ├── FormTitle + Description
    ├── DynamicFields (rendu selon la config du formulaire)
    │   ├── shortText, longText, email, phone, number
    │   ├── select, multiSelect, date, rating
    │   ├── fileUpload (photos, PDF)
    │   └── section (separateur)
    └── Button "Envoyer"
  States:
    - Success: "Merci ! Votre formulaire a ete envoye."
    - Error: inline validation per field
    - Already submitted: "Vous avez deja rempli ce formulaire"
```
