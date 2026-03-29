# Meta-Prompt 01 — Foundation & Auth

## Module
Foundation : setup projet, schema Convex, auth email/password, layout dashboard.

## Stack
- Next.js 15 (App Router) + TypeScript strict
- Convex (backend)
- Tailwind CSS + shadcn/ui
- Bun + Biome
- Resend (emails invitation)

## Taches

### 1. Project Setup
- `bun create next-app galden-coaching --typescript --tailwind --app --src-dir`
- Installer : `convex`, `@auth/core`, `shadcn/ui`, `resend`, `lucide-react`, `recharts`
- Config `biome.json` (format + lint)
- Config `tsconfig.json` strict
- Init Convex : `bunx convex dev`

### 2. Schema Convex
- Copier le schema depuis `docs/schema-draft.ts` vers `convex/schema.ts`
- Deployer le schema

### 3. Auth (Convex Auth)
- Implementer email/password auth avec Convex Auth
- Table `users` avec roles : admin, sales, coach
- Mutations : `signIn`, `signUp` (via invite token), `signOut`, `forgotPassword`, `resetPassword`
- Queries : `currentUser`, `isAuthenticated`
- Session management : 7 jours (30j si remember me)

### 4. Invitation Flow
- Mutation `inviteUser(email, role)` : genere un invite token, cree un user avec status "invited", envoie l'email via Resend
- Template email Resend : "Vous avez ete invite a rejoindre Prime Coaching" + lien `app.galdencoaching.com/invite/{token}`
- Page `/invite/{token}` : verifie le token, formulaire nom + password, cree le compte

### 5. Pages Auth
- `/login` : email + password + remember me + forgot password link
- `/invite/{token}` : nom + password + confirm password
- `/forgot-password` : email → envoie lien reset via Resend
- `/reset-password/{token}` : nouveau password

### 6. Layout Dashboard
- Sidebar gauche : fond rouge #D0003C
  - En haut : logo blanc complet (`/Logo/logo complet blanc .png`)
  - Navigation selon le role (voir `docs/pages.md`)
  - Items avec icones Lucide
  - Item actif : fond blanc semi-transparent
  - Sidebar collapsible sur mobile (hamburger)
- Header : breadcrumb + avatar user + dropdown (profil, logout)
- Main content : fond #F8FAFC, max-width, padding
- Responsive : sidebar drawer sur mobile

### 7. Middleware Auth
- Si non connecte → redirect `/login`
- Si connecte et sur `/login` → redirect `/overview`
- Verifier le role pour les pages restreintes (admin only, etc.)

## Design
- Couleur primaire : #D0003C
- Font : Inter / Inter Display
- Composants shadcn/ui
- Icones : Lucide React

## Tests
- Auth : login, signup via invite, logout, session persistante
- Roles : admin voit tout, sales voit sales+setting, coach voit operationnel
- Layout responsive : desktop + mobile

## Fichiers crees
```
convex/schema.ts
convex/auth.ts (mutations auth)
convex/users.ts (queries users)
convex/http.ts (HTTP routes)
src/app/(auth)/login/page.tsx
src/app/(auth)/invite/[token]/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/[token]/page.tsx
src/app/(dashboard)/layout.tsx
src/components/sidebar.tsx
src/components/header.tsx
src/lib/auth.ts (hooks, providers)
```
