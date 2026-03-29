# Meta-Prompt 06 — Integrations (Chatwoot, Equipes, Overview, Leads WA)

## Module
Chatwoot embed, gestion equipe avec invitations Resend, page overview, listing leads WhatsApp.

## Prerequis
- Module 01 (Foundation)
- Module 02 (CRM)

## Taches

### 1. Chatwoot Embed

**Setting (/setting)** :
- Page simple avec iframe pleine page
- URL Chatwoot configurable (stockee dans table `config`, key="chatwoot_url")
- Iframe : `width: 100%`, `height: calc(100vh - 64px)` (moins le header)
- Filtre canal Instagram (via query param ou config Chatwoot)

**Setting WA (/setting-wa)** :
- Tabs : "Conversations" | "Leads"
- Tab Conversations : meme iframe Chatwoot mais filtre WhatsApp
- Tab Leads : voir section 2

### 2. Leads WA (/setting-wa, tab Leads)

**Webhook entrant** (Convex HTTP action) :
```
POST /webhooks/leads
Body : { name, email, phone, source, leadType }
→ leads.create avec source="Setting WA", etapeSetting="new_lead"
```

**UI** :
- FilterBar : search, statut setting, source (VSL ADS / FORMULAIRE ADS), date range
- Table : Nom, Email, Tel, Type de Lead (badge), Statut Setting (badge), Date arrivee
- Click → modal detail :
  - Infos contact
  - Statut setting (dropdown editable)
  - Numero follow-up (0-5)
  - First message sent (checkbox)
  - Notes
  - Bouton "Envoyer vers CRM" → cree/MAJ le lead dans le CRM closing
- Alerte auto : leads arrives il y a > 10 min sans MSG 1 → badge rouge "A traiter"

### 3. Equipes (/equipes)

**Convex Functions** :
```
Mutations:
- users.invite(email, role) — genere token, cree user status:invited, envoie Resend
- users.updateProfile(id, data) — MAJ profil (nom, bio, photo, tel, commission, etc.)
- users.toggleStatus(id) — active ↔ disabled
- users.uploadAvatar(id, storageId) — MAJ photo

Queries:
- users.listTeam() — tous les users actifs/invites
- users.getById(id)
- users.getTeamStats() — { total, sales, coaches, actifs }
```

**Page Equipes** :
- **Header** : Stats (Total membres, Sales, Coaches) + Bouton "Inviter un membre"
- **FilterBar** : role, statut
- **Grid responsive** (1→2→3→4 colonnes) de MemberCards :
  - Avatar (photo ou initiales sur fond #D0003C)
  - Nom
  - Role badge (Admin=violet, Sales=bleu, Coach=vert)
  - Statut (In Team = dot vert, Off Team = dot gris, Invited = dot orange)
  - Bio / Specialite (2 lignes clamp)
  - Separateur
  - Email + Tel
  - % Commission (si sales)
  - Prix/eleve (si coach)
  - Nb clients actifs (auto-calcule)
  - Click → modal edit profil

**Modal Invitation** :
- Input email
- Select role (Admin / Sales / Coach)
- Bouton "Envoyer l'invitation"
- → Mutation `users.invite` → email Resend avec template Prime Coaching

**Modal Edit Profil** :
- Upload photo (drag & drop ou click)
- Nom, Bio, Specialite
- Email (readonly), Telephone
- Role (dropdown, admin only)
- % Commission (si sales)
- Prix par eleve (si coach)
- Max capacite (si coach)
- Google Calendar : bouton "Connecter" / "Deconnecter" (si sales/closer)
- Statut : toggle In Team / Off Team (admin only)

**Template Email Resend** (invitation) :
```
Subject: "Vous etes invite a rejoindre Prime Coaching"
Body:
- Logo Prime Coaching
- "Bonjour,"
- "Vous avez ete invite a rejoindre l'equipe Prime Coaching en tant que {role}."
- "Cliquez sur le bouton ci-dessous pour creer votre compte."
- [Bouton "Creer mon compte" → app.galdencoaching.com/invite/{token}]
- "Ce lien expire dans 7 jours."
- Footer Prime Coaching
```

### 4. Overview (/overview)

**Convex Query** : `dashboard.getOverview(userId, role)`
- Si admin : toutes les donnees
- Si sales : ses leads, ses calls
- Si coach : ses clients

**Composants** :
- **WelcomeCard** : "Bonjour {prenom}" + date formatee (ex: "Samedi 29 mars 2026")
- **KPICards** (grid 4) :
  - CA collecte ce mois (EUR, trend vs mois precedent)
  - Clients actifs (nombre)
  - Calls programmes aujourd'hui (nombre)
  - Taux de closing ce mois (%)
- **Alerts Section** (2 colonnes) :
  - Col 1 : Actions requises (cards cliquables)
    - X clients en attente de programme → link /operationnel/clients
    - X bilans a envoyer → link /operationnel/onboarding
    - X paiements echoues → link /sales/payments
  - Col 2 : Fin proche
    - Liste des clients dont contrat expire < 30j
    - Nom + date fin + jours restants
- **RevenueChart** : area chart CA 12 derniers mois

**Design** : Cards blanches, fond #F8FAFC, icones Lucide, trend indicators (vert ↑ / rouge ↓)

## Fichiers crees
```
convex/dashboard.ts
convex/config.ts
src/app/(dashboard)/overview/page.tsx
src/app/(dashboard)/setting/page.tsx
src/app/(dashboard)/setting-wa/page.tsx
src/app/(dashboard)/equipes/page.tsx
src/components/overview/welcome-card.tsx
src/components/overview/kpi-card.tsx
src/components/overview/alerts-section.tsx
src/components/overview/revenue-chart.tsx
src/components/equipes/member-card.tsx
src/components/equipes/invite-modal.tsx
src/components/equipes/edit-profile-modal.tsx
src/components/setting/chatwoot-embed.tsx
src/components/setting-wa/leads-table.tsx
src/components/setting-wa/lead-detail-modal.tsx
```
