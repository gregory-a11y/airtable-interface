# Agent Team Blueprint — Galden Coaching ERP

## Team Structure

- **Team Lead** (main session) : Orchestre le build, review, merges, decisions architecture
- **Agent Backend** (worktree: `feat-backend`) : Schema Convex, mutations, queries, actions, HTTP endpoints, webhooks
- **Agent Frontend** (worktree: `feat-frontend`) : Pages, composants, layouts, UI/UX
- **Agent Booking** (worktree: `feat-booking`) : Systeme de booking complet (Google Calendar, pages publiques)
- **Agent Quality** (no worktree) : Tests, reviews, deploy checks

---

## Phase Assignments

| Phase | Team Lead | Agent Backend | Agent Frontend | Agent Booking | Agent Quality |
|-------|-----------|---------------|----------------|---------------|---------------|
| **1. Foundation** | Schema review, setup | Schema Convex + Auth functions | Layout + Auth pages | - | - |
| **2. CRM** | Coordinate | Leads CRUD + queries + indexes | Pipeline Kanban + CRM pages + Dashboard | - | - |
| **3. Booking** | Coordinate | Google Calendar integration + booking logic | - | Pages publiques + admin calendrier | - |
| **4. Paiements** | Coordinate + review | Offers CRUD + PID + Webhooks Stripe/PayPal | Payment page + Liens paiement UI | - | Test webhooks |
| **5. Clients** | Coordinate | Clients CRUD + auto-creation + calculs | Listing + Fiches + New Close | - | - |
| **6. Integrations** | Merge branches | Webhook endpoints Make | Chatwoot embed + Equipes + Overview | - | - |
| **7. Pilotage** | Coordinate | Aggregations finance + ads sync | Dashboard Finance + Ad Manager + Coach | - | - |
| **8. Form Builder** | Coordinate | Forms CRUD + submissions + file upload | Form builder UI + public form page | - | - |
| **9. Quality** | Merge + deploy | - | - | - | Full review + tests + deploy check |

---

## Communication Protocol

1. **Team Lead** assigne les taches via TaskCreate
2. **Agents** reportent completion via TaskUpdate
3. **Team Lead** review avant merge
4. **Agents** utilisent `explore-docs` (Context7) pour la recherche technique sans bloquer
5. **Conflicts** : Team Lead decide, agents ne modifient jamais les memes fichiers

---

## Worktree Strategy

```
main
├── feat-backend     (Agent Backend)
│   ├── convex/schema.ts
│   ├── convex/leads.ts
│   ├── convex/clients.ts
│   ├── convex/payments.ts
│   ├── convex/booking.ts
│   ├── convex/auth.ts
│   └── convex/http.ts
├── feat-frontend    (Agent Frontend)
│   ├── app/(auth)/
│   ├── app/(dashboard)/
│   ├── components/
│   └── lib/
└── feat-booking     (Agent Booking)
    ├── app/(booking)/
    ├── app/(payment)/
    ├── app/(form)/
    └── convex/booking.ts (coordination avec backend)
```

---

## Skills & MCPs par Phase

| Phase | Skills | Agents | MCPs |
|-------|--------|--------|------|
| 1. Foundation | `/sc:implement`, `/code` | explore-docs (Context7: Convex, Next.js 15) | Context7 |
| 2. CRM | `/sc:implement`, `/frontend-design` | explore-docs (Context7: Convex queries) | Context7 |
| 3. Booking | `/sc:implement`, `/code` | explore-docs (Context7: Google Calendar API), websearch | Context7, Exa |
| 4. Paiements | `/sc:implement`, `/code` | explore-docs (Context7: Stripe, PayPal) | Context7, Exa |
| 5. Clients | `/sc:implement` | explore-docs | Context7 |
| 6. Integrations | `/sc:implement` | websearch (Chatwoot embed) | Exa |
| 7. Pilotage | `/sc:implement`, `/frontend-design` | explore-docs (Context7: Recharts) | Context7 |
| 8. Form Builder | `/sc:implement`, `/ui-ux-pro-max` | explore-docs | Context7 |
| 9. Quality | `/review`, `/test`, `/deploy-check` | - | - |

---

## Merge Strategy

1. **Phase 1** : tout sur main (fondation)
2. **Phases 2-8** : feature branches → PR → Team Lead review → merge main
3. **Phase 9** : main → production

Chaque merge est precede de :
- `bun run typecheck` (zero errors)
- `bun run lint` (Biome, zero errors)
- Review des changements par Team Lead
- Test des flows critiques
