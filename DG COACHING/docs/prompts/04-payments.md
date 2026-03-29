# Meta-Prompt 04 — Payment System (PID)

## Module
Systeme de paiement avec PID (Payment Intent ID). Pages de paiement custom, Stripe + PayPal, webhooks, auto-close CRM, commissions.

## Prerequis
- Module 01 (Foundation)
- Module 02 (CRM — leads pour associer les paiements)
- Schema Convex avec tables `offers`, `transactions`, `payments`, `webhookEvents`

## Taches

### 1. Convex Functions — Offers
```
Mutations:
- offers.create(data) — cree une offre
- offers.update(id, data)
- offers.toggleActive(id)
- offers.delete(id)

Queries:
- offers.list({ active? })
- offers.getById(id)
```

### 2. Convex Functions — Transactions (PID)
```
Mutations:
- transactions.generatePID(offerId, leadId?) — genere un UUID court, cree la transaction status:pending, retourne le PID et l'URL complete
- transactions.initStripe(pid) — appelle Stripe Checkout Session, stocke session_id comme providerTxId
- transactions.initPayPal(pid) — appelle PayPal Orders API, stocke order_id comme providerTxId
- transactions.processWebhook(provider, eventId, data) :
  1. Verifie idempotence (webhookEvents)
  2. Lookup providerTxId → transaction → pid
  3. Cree le payment record
  4. MAJ transaction status (pending→partial→completed)
  5. Si premier paiement ET lead associe : leads.updateEtape(leadId, "close")
  6. Si premier paiement : cree la fiche client (clients.createFromLead)
  7. Calcule et stocke les commissions (payment.commissionClosing, commissionSetting)

Queries:
- transactions.getByPID(pid)
- transactions.listByLead(leadId)
- transactions.listByClient(clientId)
```

### 3. Convex Functions — Payments
```
Queries:
- payments.list({ status?, clientId?, dateRange?, source? }) — avec pagination
- payments.getStats({ dateRange? }) :
  - totalCollecte (sum confirmed)
  - totalContracte (sum from transactions)
  - totalCommissionsClosing
  - totalCommissionsSetting
  - parMembre (group by closerId/setterId)
- payments.getByClient(clientId) — historique paiements d'un client

Mutations:
- payments.createManual(clientId, data) — paiement manuel (virement, etc.)
```

### 4. HTTP Actions — Webhooks

**Stripe Webhook** (`convex/http.ts`) :
```
POST /webhooks/stripe
1. Verifier la signature Stripe (stripe.webhooks.constructEvent)
2. Extraire event.type et event.data
3. Si checkout.session.completed :
   - client_reference_id = PID
   - Appeler transactions.processWebhook("stripe", event.id, data)
4. Si payment_intent.payment_failed :
   - Marquer le paiement comme failed
5. Si charge.refunded :
   - Marquer le paiement comme refunded, MAJ transaction
6. Logger dans webhookEvents
```

**PayPal Webhook** (`convex/http.ts`) :
```
POST /webhooks/paypal
1. Verifier la signature PayPal (HMAC)
2. Si PAYMENT.CAPTURE.COMPLETED :
   - order_id = resource.supplementary_data.related_ids.order_id
   - Lookup DB : order_id → transaction (via providerTxId)
   - Appeler transactions.processWebhook("paypal", event.id, data)
3. Si PAYMENT.CAPTURE.DENIED :
   - Marquer comme failed
4. Logger dans webhookEvents
```

### 5. Page de Paiement (pay.galdencoaching.com)

**Route** : `/pay?offer={offerId}&pid={pid}`

**Layout** :
- Fond blanc, centre, max-width 480px
- Logo Prime Coaching rouge en haut
- Card blanche avec shadow

**Contenu** :
1. Charger l'offre via offerId (query)
2. Charger la transaction via pid (query)
3. Afficher :
   - Nom de l'offre
   - Montant total
   - Detail echelonnement si applicable ("6 mensualites de 417 EUR")
4. Choix du moyen de paiement :
   - Radio "Carte bancaire" (icones CB/Visa/MC/Apple Pay/Google Pay)
   - Radio "PayPal" (logo PayPal + mention "4x sans frais si eligible")
5. Bouton "Payer {montant} EUR" (couleur #D0003C)
6. Au clic :
   - Si Stripe : appel mutation `transactions.initStripe(pid)` → redirect vers Stripe Checkout
   - Si PayPal : appel mutation `transactions.initPayPal(pid)` → redirect vers PayPal

**States** :
- Loading : skeleton
- Offre invalide : "Ce lien de paiement n'est pas valide"
- PID deja utilise : "Ce lien a deja ete utilise"
- Processing : spinner "Redirection vers le paiement..."
- Return URL (apres paiement) :
  - Success : "Paiement confirme ! Bienvenue chez Prime Coaching."
  - Cancel : "Le paiement a ete annule. Vous pouvez reessayer."

### 6. Suivi Paiements & Commissions (/sales/payments)

**Tab Paiements** :
- FilterBar : statut, source, periode
- Table : Client, Montant (EUR), Date, Source (badge Stripe/PayPal), Statut (badge Succeed/Failed/Refunded), Echeance (1/6, 2/6...)
- Alertes : paiements echoues en rouge, bouton "Relancer"

**Tab Commissions** :
- FilterBar : membre, periode
- Table : Membre (avatar+nom), Role, % Commission, CA genere, Commission due
- Ligne total en bas
- Export CSV

### 7. Page Liens de Paiement (/pilotage/liens-paiement)
- Liste des offres : Titre, Type, Montant, Modalite, Duree, Statut (toggle actif/inactif)
- Bouton "Nouvelle offre" → modal : nom, type, montant, modalite, echelonnement, providers, duree
- Bouton "Generer un lien" → modal : select offre + select prospect (search CRM) → genere PID → affiche URL copiable
- Historique des liens generes : PID, Prospect, Offre, Date, Statut paiement

## Commissions — Logique
```
A chaque paiement confirme :
1. Recuperer le client associe au paiement
2. Recuperer setter + closer du client (depuis la fiche client, herites du CRM)
3. Recuperer % commission de chaque (depuis leur profil users)
4. Calculer :
   - commissionClosing = montant_paiement * (closer.commissionPercent / 100)
   - commissionSetting = montant_paiement * (setter.commissionPercent / 100)
5. Stocker dans le payment record
```

## Fichiers crees
```
convex/offers.ts
convex/transactions.ts
convex/payments.ts
convex/webhookEvents.ts
convex/http.ts (webhook routes)
src/app/(payment)/pay/page.tsx
src/app/(dashboard)/sales/payments/page.tsx
src/app/(dashboard)/pilotage/liens-paiement/page.tsx
src/components/payments/payment-page.tsx
src/components/payments/payments-table.tsx
src/components/payments/commissions-table.tsx
src/components/payments/generate-link-modal.tsx
src/components/payments/offer-form.tsx
src/lib/stripe.ts
src/lib/paypal.ts
```
