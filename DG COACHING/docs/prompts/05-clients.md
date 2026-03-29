# Meta-Prompt 05 — Client Management

## Module
Gestion operationnelle des clients : listing groupe, fiches detaillees, new close, dashboard operationnel.

## Prerequis
- Module 01 (Foundation)
- Module 02 (CRM — leads convertis en clients)
- Module 04 (Paiements — auto-creation client au close)

## Taches

### 1. Convex Functions — Clients
```
Mutations:
- clients.createFromLead(leadId) :
  1. Copier les infos du lead (nom, email, tel, address)
  2. Setter/Closer herites du lead
  3. Commissions % heritees des users setter/closer
  4. Status : "nouveau_client"
  5. Montant contracte depuis la transaction associee
  6. Auto-generer les liens formulaires (onboarding + bilan)
  7. Retourner le client ID
  8. MAJ lead.clientId + lead.type = "client"
- clients.update(id, data)
- clients.updateStatus(id, status)
- clients.assignCoach(id, coachId)
- clients.delete(id) — admin only
- clients.addPause(id, nbJours) — ajoute des jours de pause, recalcule dateFinReelle

Queries:
- clients.list({ coachId?, status?, search?, dateRange? })
- clients.listGrouped() — groupe par coach puis par statut (pour le listing)
- clients.getById(id) — fiche complete avec paiements lookups
- clients.getStats({ coachId? }) :
  - totalActifs
  - enAttenteProgramme
  - finProche (date_fin_reelle < now + 30j)
  - enPause
  - nouveauxCeMois
  - parCoach (group by coachId, count actifs)
  - evolution12Mois (count actifs par mois)
  - tauxRetention
- clients.getPaymentSummary(id) :
  - montantContracte
  - totalCollecte (sum payments confirmed)
  - restantAPayer
  - pourcentageAvancement
  - listePaiements
```

### 2. Auto-calculs Convex
```
Fonctions internes (helpers) :
- calculateDateFin(dateDebut, prestation) :
  - "1M_Oneshot" → +1 mois
  - "3M_*" → +3 mois
  - "6M_*" → +6 mois
  - "12M_*" → +12 mois
  - "Acompte" → null
- calculateDateFinReelle(dateFinCalculee, nbJoursPause) :
  - dateFinCalculee + nbJoursPause jours
- isFinProche(dateFinReelle) : dateFinReelle < now + 30 jours
```

### 3. Listing Clients (/operationnel/clients)
**FilterBar** :
- Select coach (dropdown users role=coach, + "Tous")
- Select statut (multi-select)
- Search (nom/email/tel)
- Toggle "Grouper par" : Coach+Statut / Statut seul

**Table groupee** (reproduire le layout Airtable — screenshot fourni) :
- **Niveau 1** : Coach attitré — "(Vide)" si pas de coach, sinon nom + count total
- **Niveau 2** : Statut Client — badge couleur + count
  - Acompte (orange), Nouveau client (jaune), Active (vert), Fin proche (rouge alert), Termine (gris), etc.
- **Lignes** : Client, Fichier coaching (lien cliquable), Email, Telephone, Statut (badge), Jour du Bilan, Date de fin
- Click ligne → `/operationnel/clients/{id}`

**Design** :
- Groupes collapsibles (chevron)
- Badges couleur alignes avec les statuts Airtable
- Liens Google Sheets en bleu cliquable
- Table dense mais lisible

### 4. Fiche Client (/operationnel/clients/{id})
Reproduire le layout du screenshot Airtable :

**Section Header** :
- Nom client (gros, editable)
- Bouton "Supprimer client" (rouge, admin only, avec confirmation dialog)

**Section Prestation** :
- Statut Client : dropdown (acompte → nouveau_client → en_attente_programme → active → paused → renew → fin_proche → termine → archived)
- Prestation : dropdown (1M_Oneshot, 3M_Oneshot, 3M_2x, 3M_3x, 6M_Oneshot, 6M_2x, 6M_4x, 6M_6x, 12M_12x, Acompte)
- Coach attitré : card (avatar mini, nom, role badge, bio) + bouton changer

**Section Coaching** :
- Training LOG : input URL (lien Google Sheets, icone external link)
- telegram_group_url : input URL (lien, icone Telegram)
- Date de debut : date picker
- Date de fin calculee : affichage auto (non editable)
- Nb jours pause : number input
- Date de fin reelle (pauses incluses) : affichage auto

**Section Contact** :
- Client (nom complet), Adresse, Email, Telephone — edit inline
- Lien formulaire Onboarding : URL auto-generee + copie
- Lien formulaire bilan mensuel : URL auto-generee + copie
- Notes : rich text editor (tiptap ou similar)
- Date d'entree/closing : date picker
- Dossier client : input URL (Google Drive)

**Section Bilan mensuel / Onboarding** :
- Liste des bilans recus (cards expandable)
- Chaque bilan : date, type badge (Onboarding/Bilan), etape (Check/Done toggle)
- Gallery photos si disponible
- Bouton "Voir les reponses" → expand

**Section Paiements / Facturations** :
- Montant Contracte (TTC) : affichage EUR
- Total CA Collecte TTC : calcul auto
- Restant a payer : calcul auto
- % Avancement : progress bar (vert si > 50%, orange sinon)
- Table paiements : Statut (badge couleur), Nom transaction, Date, Montant
- Bouton "Ajouter paiement" → modal (montant, date, source, statut)

### 5. New Close (/sales/new-close)
- Liste des clients recemment crees (status "nouveau_client") tries par date de closing desc
- Card par close : nom, montant, prestation, date, setter, closer
- **Statut onboarding** : badge (en_attente → en_cours → groupe_cree → onboarding_valide)
- Bouton "Lancer onboarding" → appelle webhook Make (envoie les infos client)
- Bouton "Voir la fiche client" → navigate

### 6. Dashboard Operationnel (/operationnel/dashboard)
- **KPICards** (grid 5) : Clients actifs, En attente programme, Fin proche, En pause, Nouveaux ce mois
- **WorkloadChart** : bar horizontal — clients actifs par coach (nom + count + %)
- **RetentionChart** : area chart — evolution clients actifs 12 mois

## Fichiers crees
```
convex/clients.ts
src/app/(dashboard)/operationnel/dashboard/page.tsx
src/app/(dashboard)/operationnel/clients/page.tsx
src/app/(dashboard)/operationnel/clients/[id]/page.tsx
src/app/(dashboard)/sales/new-close/page.tsx
src/components/clients/clients-grouped-table.tsx
src/components/clients/client-detail.tsx
src/components/clients/client-coaching-section.tsx
src/components/clients/client-contact-section.tsx
src/components/clients/client-bilans-section.tsx
src/components/clients/client-payments-section.tsx
src/components/clients/new-close-card.tsx
src/components/clients/workload-chart.tsx
src/components/clients/retention-chart.tsx
```
