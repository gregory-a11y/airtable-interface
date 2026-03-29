# Meta-Prompt 03 — Booking System

## Module
Systeme de booking complet remplacant iClosed. Calendriers par source, formulaire pre-booking, round-robin closers, Google Calendar + Meet.

## Prerequis
- Module 01 (Foundation) deploye
- Module 02 (CRM) deploye (les bookings creent des leads)
- Schema Convex avec tables `calendars`, `bookings`, `forms`, `formFields`

## Taches

### 1. Google OAuth Integration
- OAuth2 flow pour connecter le Google Calendar d'un closer
- Scopes : `calendar.readonly`, `calendar.events`, `calendar.freebusy`
- Page dans profil equipe : "Connecter Google Calendar"
- Stocker tokens dans `users` (googleAccessToken, googleRefreshToken, googleTokenExpiry)
- Refresh automatique du token quand expire
- Helper `getGoogleCalendarClient(userId)` qui gere le refresh

### 2. Convex Functions — Calendars
```
Mutations:
- calendars.create(data) — cree un calendrier avec slug, hotes, priorites
- calendars.update(id, data) — MAJ
- calendars.delete(id)

Queries:
- calendars.list() — tous les calendriers (admin)
- calendars.getBySlug(slug) — pour la page publique
- calendars.getById(id)
```

### 3. Convex Functions — Bookings
```
Mutations:
- bookings.create(calendarId, prospectData, startTime) — cree le booking :
  1. Verifie la dispo du closer (Google Calendar FreeBusy)
  2. Selectionne le closer par priorite + dispo (round-robin)
  3. Cree l'event Google Calendar avec Google Meet
  4. Cree le lead dans le CRM (etape "appel_a_venir", source = calendar.sourceTag)
  5. Envoie email confirmation via Resend
  6. Retourne le booking
- bookings.cancel(id) — annule le RDV (supprime l'event Google)
- bookings.markNoShow(id)
- bookings.markCompleted(id)

Queries:
- bookings.getAvailableSlots(calendarSlug, date) :
  1. Charge le calendrier + hotes
  2. Pour chaque hote par priorite :
     a. Appelle Google Calendar FreeBusy pour le jour donne
     b. Calcule les creneaux libres selon les horaires config
     c. Respecte buffer, maxPerDay, duree
  3. Retourne les creneaux fusionnes (le prospect ne voit pas quel closer)
- bookings.list({ hostId?, status?, dateRange? })
- bookings.getById(id)
- bookings.getToday(hostId?) — calls du jour
- bookings.getUpcoming(hostId?) — calls a venir
```

### 4. Round-Robin Logic
```
Algorithme :
1. Trier les hotes par priorite (high → medium → low)
2. Pour chaque groupe de priorite :
   a. Compter les bookings deja assignes cette semaine
   b. Assigner au closer avec le moins de bookings (distribution egale dans la priorite)
3. Le closer selectionne DOIT etre disponible sur le creneau (Google Calendar check)
4. Si aucun closer dispo dans la priorite haute → passer a la moyenne → basse
```

### 5. Admin — Gestion Calendriers (dans /sales/calls)
- Tab "Calendriers" : liste des calendriers avec slug, hotes, statut
- Bouton "Nouveau calendrier" → modal/page :
  - Nom, Couleur, Description (rich text)
  - **Slug** editable avec preview URL (`book.galdencoaching.com/{slug}`)
  - Note interne + source tag
  - Duree (select : 30min, 45min, 1h)
  - Jours disponibles (checkboxes lun-dim)
  - Heures (start/end)
  - Buffer avant/apres
  - Max calls/jour
  - **Hotes** : multi-select closers + priorite (haute/moyenne/basse) par closer
  - **Formulaire** : select un formulaire existant ou creer (redirige vers form builder)
  - Notifications : toggles confirmation + rappel (heures avant)
  - Message de confirmation (rich text)
- Bouton "Copier le lien" pour chaque calendrier

### 6. Admin — Vue Calls (/sales/calls)
- Tab "Agenda" : vue semaine avec les calls
  - Chaque slot : nom prospect, closer, heure, lien Meet
  - Code couleur par statut (confirmed=bleu, completed=vert, no_show=rouge)
- Tab "Liste" : table des calls avec filtres (closer, statut, date)
- Actions par call : Rejoindre Meet, Voir CRM, Marquer No Show, Marquer Complete

### 7. Page Publique (/booking/[slug])
Route : `book.galdencoaching.com/{slug}` (ou `app.galdencoaching.com/booking/{slug}`)

**Layout :**
- Header : logo Prime Coaching rouge
- Stepper : "Remplir le formulaire" → "Reservez votre evenement"
- Fond blanc, max-width 960px, centre

**Step 1 — Formulaire (gauche)** :
- Titre evenement + description
- Champs fixes : Email*, Prenom*, Nom*
- Champs custom du formulaire associe
- Mentions legales
- Bouton "Continuer >"
- A droite : calendrier (preview, disable tant que form pas rempli, tooltip "Remplir le formulaire d'abord")

**Step 2 — Selection creneau** :
- Calendrier mois (navigation < >)
- Jours avec dispos en gras
- Click jour → affiche creneaux horaires (cards cliquables)
- Bouton "Confirmer"

**Step 3 — Confirmation** :
- Icone check vert
- "Votre rendez-vous est confirme !"
- Details : date, heure, lien Google Meet
- "Un email de confirmation vous a ete envoye"

**Design** : S'inspirer du look iClosed (screenshots fournis) mais avec le branding Prime Coaching (#D0003C)

## Integration Google Calendar
- Utiliser `googleapis` npm package
- Endpoint HTTP action Convex pour OAuth callback
- FreeBusy API pour verifier les dispos
- Events API pour creer/supprimer les events
- Conference data pour generer le lien Google Meet

## Fichiers crees
```
convex/calendars.ts
convex/bookings.ts
convex/google.ts (helpers Google Calendar)
src/app/(dashboard)/sales/calls/page.tsx
src/app/(booking)/booking/[slug]/page.tsx
src/components/booking/calendar-form.tsx
src/components/booking/calendar-manager.tsx
src/components/booking/time-slots.tsx
src/components/booking/step-indicator.tsx
src/components/booking/calls-agenda.tsx
src/components/booking/calls-list.tsx
src/lib/google-calendar.ts
```
