# Meta-Prompt 08 — Form Builder & Polish

## Module
Form builder integre (remplace Tally), tracking coach, polish general.

## Prerequis
- Modules 01-06 deployes
- Schema Convex avec tables `forms`, `formFields`, `formSubmissions`, `bilans`, `coachTracking`

## Taches

### 1. Convex Functions — Forms
```
Mutations:
- forms.create({ name, type, description }) — cree un formulaire vide
- forms.update(id, { name?, description?, active? })
- forms.delete(id)
- forms.addField(formId, { type, label, placeholder?, description?, required, options? }) — ajoute en derniere position
- forms.updateField(fieldId, data)
- forms.deleteField(fieldId)
- forms.reorderFields(formId, fieldIds[]) — reordonne les champs

Queries:
- forms.list({ type?, active? })
- forms.getById(id) — avec tous les champs ordonnes
- forms.getByIdPublic(id) — version publique (sans infos sensibles)
```

### 2. Convex Functions — Submissions
```
Mutations:
- formSubmissions.submit(formId, clientId?, answers, fileStorageIds?) :
  1. Valider les champs requis
  2. Sauvegarder les reponses (JSON)
  3. Si type "bilan" → creer un bilan lie au client
  4. Webhook Make (notification equipe)

Queries:
- formSubmissions.listByForm(formId, { dateRange? })
- formSubmissions.listByClient(clientId)
- formSubmissions.getById(id) — avec les questions (join forms/formFields)
```

### 3. Admin — Form Builder (/operationnel/onboarding)

**Liste des formulaires** :
- Table : Nom, Type (badge Onboarding/Bilan/Custom), Nb champs, Nb reponses, Statut, Derniere MAJ
- Bouton "Nouveau formulaire" → modal (nom, type, description)
- Click → page edition formulaire

**Page edition formulaire** :
- Header : Nom formulaire (editable) + Type + Toggle Actif/Inactif
- **Zone de construction** (centre) :
  - Liste des champs existants (ordonnees)
  - Chaque champ : icone type + label + required badge + actions (edit, delete, drag handle)
  - Drag & drop pour reordonner (dnd-kit)
  - Bouton "Ajouter un champ" → dropdown des types :
    - Texte court, Texte long, Email, Telephone, Nombre
    - Liste deroulante (+ config options), Selection multiple
    - Date, Notation (1-5), Upload fichier
    - Separateur / Titre de section
  - Click sur un champ → panneau edition a droite :
    - Label, Placeholder, Description/aide, Requis toggle
    - Options (si select/multiSelect) : ajouter/supprimer/reordonner
- **Preview** (bouton toggle) : affiche le formulaire comme le verra le client
- **URL du formulaire** : `app.galdencoaching.com/form/{formId}?client={clientId}` — avec select client pour tester

### 4. Page publique formulaire (/form/{formId})

**Route** : `app.galdencoaching.com/form/{formId}?client={clientId}`

**Layout** :
- Fond blanc, centre, max-width 640px
- Logo Prime Coaching rouge en haut
- Card blanche avec shadow

**Rendu dynamique** :
Pour chaque champ du formulaire, rendre le composant correspondant :
- `shortText` → Input classique
- `longText` → Textarea (4 lignes min)
- `email` → Input type=email avec validation
- `phone` → Input type=tel avec validation
- `number` → Input type=number
- `select` → Select dropdown shadcn
- `multiSelect` → Checkbox group
- `date` → Date picker shadcn
- `rating` → 5 etoiles cliquables
- `fileUpload` → Zone drop + bouton "Choisir un fichier" (multiple files, accept images + PDF)
  - Preview des images uploadees
  - Upload vers Convex Storage
- `section` → Titre h3 + separateur

**Validation** :
- Champs requis : message inline rouge
- Email : format valide
- Phone : format valide
- Tous les fichiers uploades avant soumission

**Soumission** :
- Bouton "Envoyer" → spinner
- Success : "Merci ! Votre formulaire a ete envoye avec succes." + icone check
- Si deja soumis (optionnel) : message "Formulaire deja rempli"

### 5. Bilans dans fiche client

Quand une soumission de type "bilan" est recue :
1. Creer un record dans `bilans` avec clientId + formSubmissionId
2. Afficher dans la section "Bilan mensuel / Onboarding" de la fiche client
3. Card expandable par bilan :
   - Date + Type badge (Onboarding / Bilan mensuel)
   - Etape : toggle "Check answer" ↔ "Done"
   - Bouton "Voir les reponses" → expand les reponses formatees
   - Photos en gallery (grid de thumbnails, click = lightbox)
   - Bilan sang : bouton download

### 6. Tracking Coach (/operationnel/tracking-coach)

**Convex Functions** :
```
Mutations:
- coachTracking.create({ coachEvalueId, coachEvaluateurId, scores... })
  - moyenne = (delai + relance + position + qualiteDiete + qualiteProgramme + energie) / 6

Queries:
- coachTracking.listByCoach(coachId, { dateRange? })
- coachTracking.getAverages() — moyenne par coach
```

**UI** :
- **Section Evaluer** :
  - Select "Coach a evaluer"
  - 6 ratings (1-5 etoiles chacun) :
    - Delai de reponses < 24h
    - Relance clients
    - Position professionnelle
    - Qualite de la diete
    - Qualite du programme
    - Energie
  - Bouton "Soumettre"
- **Section Historique** :
  - FilterBar : coach, periode
  - Table : Coach evalue, Evaluateur, Date, Scores individuels, Moyenne
  - Chart radar par coach (optionnel)

### 7. Polish General

**Empty states** (toutes les pages avec liste) :
- Illustration legere (ou icone Lucide grise)
- Message explicatif
- CTA si applicable ("Creer votre premier ...")

**Loading states** :
- Skeleton loaders (shadcn Skeleton) pour tables, cards, charts
- Spinner sur boutons pendant les mutations

**Error handling** :
- Toast (shadcn Sonner) pour : succes, erreur, warning
- Error boundary global
- Messages d'erreur en francais

**Responsive** :
- Toutes les tables : scroll horizontal sur mobile
- Grids : 1 col mobile → 2 tablet → 3-4 desktop
- Sidebar : drawer mobile avec overlay
- Charts : responsive containers

**Feedback UX** :
- Optimistic updates pour les toggles/edits rapides
- Confirmation dialog pour les suppressions
- Auto-save pour les champs de notes (debounced)

## Fichiers crees
```
convex/forms.ts
convex/formSubmissions.ts
convex/bilans.ts
convex/coachTracking.ts
src/app/(dashboard)/operationnel/onboarding/page.tsx
src/app/(dashboard)/operationnel/onboarding/[formId]/page.tsx
src/app/(dashboard)/operationnel/tracking-coach/page.tsx
src/app/(form)/form/[formId]/page.tsx
src/components/forms/form-builder.tsx
src/components/forms/field-editor.tsx
src/components/forms/field-renderer.tsx
src/components/forms/form-preview.tsx
src/components/forms/public-form.tsx
src/components/forms/file-upload.tsx
src/components/forms/rating-stars.tsx
src/components/tracking/evaluation-form.tsx
src/components/tracking/evaluation-history.tsx
```
