/**
 * Convex Schema — Galden Coaching ERP
 *
 * Tables principales pour l'ERP de coaching sportif high-ticket.
 * Ce fichier est un draft de reference pour la generation du schema final.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================
  // AUTH & USERS
  // ============================================================

  /**
   * Membres de l'equipe (auth + profil)
   * Roles : admin, sales (setter+closer), coach
   */
  users: defineTable({
    // Auth — Convex Auth natif (email/password)
    // Convex Auth gere l'auth en interne. Le tokenIdentifier lie le user auth au profil.
    tokenIdentifier: v.string(), // identifiant unique retourne par ctx.auth.getUserIdentity()
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("sales"), v.literal("coach")),
    status: v.union(v.literal("active"), v.literal("invited"), v.literal("disabled")),

    // Profil
    name: v.string(),
    phone: v.optional(v.string()),
    bio: v.optional(v.string()),
    specialty: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),

    // Commission (pour sales)
    commissionPercent: v.optional(v.number()), // ex: 10 pour 10%

    // Coach
    pricePerStudent: v.optional(v.number()), // prix par eleve en centimes EUR
    maxCapacity: v.optional(v.number()), // nombre max de clients

    // Google Calendar (pour closers)
    googleAccessToken: v.optional(v.string()),
    googleRefreshToken: v.optional(v.string()),
    googleTokenExpiry: v.optional(v.number()),
    googleCalendarId: v.optional(v.string()),

    // Invitation
    inviteToken: v.optional(v.string()),
    inviteExpiry: v.optional(v.number()),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"])
    .index("by_inviteToken", ["inviteToken"]),

  // ============================================================
  // LEADS / CRM
  // ============================================================

  /**
   * Tous les prospects (CRM + Setting WA + Pipeline Instagram)
   * Centralise toutes les sources de leads.
   */
  leads: defineTable({
    // Contact
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    instagram: v.optional(v.string()),
    address: v.optional(v.string()),

    // Classification
    source: v.string(), // "Ads Facebook", "Insta bio", "Insta DM Organique", "Setting WA", "VSL ADS", "FORMULAIRE ADS", etc.
    type: v.union(v.literal("prospect"), v.literal("client"), v.literal("ancien_client")),
    qualification: v.union(v.literal("qualifie"), v.literal("non_qualifie"), v.literal("pending")),

    // Pipeline closing
    etapeClosing: v.string(), // "appel_a_venir", "appel_du_jour", "follow_up", "no_show", "en_attente", "close", "perdu"
    raisonPerte: v.optional(v.string()), // "No budget", "Pas convaincu", etc.

    // Pipeline setting (WhatsApp)
    etapeSetting: v.optional(v.string()), // "new_lead", "msg_1_envoye", "en_conversation", "pas_de_reponse", "lien_call_envoye", "call_valide", "perdu", "relancer_1/2/3"
    leadType: v.optional(v.string()), // "VSL ADS", "FORMULAIRE ADS", "Outbound", "Inbound"

    // Appel de vente
    dateBookingCall: v.optional(v.number()), // timestamp
    dateAppelVente: v.optional(v.number()),
    meetingUrl: v.optional(v.string()),
    videoCallUrl: v.optional(v.string()), // Loom recording
    transcriptCall: v.optional(v.string()),
    questionnaireAnswers: v.optional(v.string()), // JSON stringified

    // Commercial
    setterId: v.optional(v.id("users")),
    closerId: v.optional(v.id("users")),
    offerId: v.optional(v.id("offers")),
    discountCodeId: v.optional(v.id("discountCodes")),
    montantContracte: v.optional(v.number()), // centimes EUR

    // Notes
    noteInterne: v.optional(v.string()),
    screenConversation: v.optional(v.array(v.id("_storage"))),

    // Booking
    bookingId: v.optional(v.id("bookings")),
    calendarSlug: v.optional(v.string()), // source tracking

    // Conversion
    clientId: v.optional(v.id("clients")), // ref vers client si converti
    convertedAt: v.optional(v.number()),

    // Meta
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phone"])
    .index("by_etapeClosing", ["etapeClosing"])
    .index("by_etapeSetting", ["etapeSetting"])
    .index("by_source", ["source"])
    .index("by_type", ["type"])
    .index("by_setterId", ["setterId"])
    .index("by_closerId", ["closerId"])
    .index("by_createdAt", ["createdAt"])
    .index("by_qualification", ["qualification"]),

  // ============================================================
  // CLIENTS
  // ============================================================

  /**
   * Clients actifs/archives — gestion operationnelle post-closing.
   */
  clients: defineTable({
    // Identity
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),

    // Statut
    status: v.string(), // "acompte", "nouveau_client", "en_attente_programme", "active", "paused", "renew", "fin_proche", "termine", "archived"

    // Prestation
    prestation: v.string(), // "1M_Oneshot", "3M_Oneshot", "3M_2x", "3M_3x", "6M_Oneshot", "6M_2x", "6M_4x", "6M_6x", "12M_12x", "Acompte"
    montantContracteTTC: v.number(), // centimes EUR
    montantContracteHT: v.optional(v.number()), // auto: x 0.80

    // Dates
    dateDebut: v.optional(v.number()),
    dateFinCalculee: v.optional(v.number()), // auto: debut + duree prestation
    nbJoursPause: v.optional(v.number()),
    dateFinReelle: v.optional(v.number()), // auto: fin calculee + jours pause
    dateClosing: v.optional(v.number()),

    // Coach
    coachId: v.optional(v.id("users")),

    // Liens externes
    trainingLogUrl: v.optional(v.string()), // Google Sheets
    telegramGroupUrl: v.optional(v.string()),
    telegramGroupId: v.optional(v.string()),
    dossierClientUrl: v.optional(v.string()), // Google Drive
    dossierPhotoUrl: v.optional(v.string()), // Google Drive photos

    // Bilan
    jourDuBilan: v.optional(v.string()), // "lundi" a "dimanche"

    // Onboarding
    onboardingStatus: v.optional(v.string()), // "en_attente", "en_cours", "groupe_cree", "onboarding_valide"

    // Commercial (refs)
    leadId: v.optional(v.id("leads")),
    setterId: v.optional(v.id("users")),
    closerId: v.optional(v.id("users")),
    commissionPercentSetter: v.optional(v.number()),
    commissionPercentCloser: v.optional(v.number()),

    // Notes
    notes: v.optional(v.string()),

    // Meta
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_coachId", ["coachId"])
    .index("by_email", ["email"])
    .index("by_leadId", ["leadId"])
    .index("by_coachId_status", ["coachId", "status"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================================
  // PAYMENT SYSTEM (PID)
  // ============================================================

  /**
   * Offres de paiement — configurees par l'admin.
   */
  offers: defineTable({
    name: v.string(), // ex: "Accompagnement 6 mois - 6x417e"
    type: v.union(v.literal("classique"), v.literal("renouvellement"), v.literal("acompte")),
    amount: v.number(), // montant total en centimes EUR
    currency: v.string(), // "EUR"

    // Echelonnement
    paymentMode: v.union(v.literal("unique"), v.literal("mensuel"), v.literal("fixe_plus_mensuel")),
    installmentCount: v.optional(v.number()), // nombre de mensualites
    firstPaymentAmount: v.optional(v.number()), // montant 1er paiement (si fixe_plus_mensuel)
    recurringAmount: v.optional(v.number()), // montant mensualite

    // Duree
    duration: v.optional(v.string()), // "1M", "3M", "6M", "12M"

    // Providers
    providers: v.array(v.string()), // ["stripe", "paypal"]

    // Stripe IDs
    stripeProductIdOneShot: v.optional(v.string()),
    stripeProductIdRecurrent: v.optional(v.string()),
    stripePriceIdOneShot: v.optional(v.string()),
    stripePriceIdRecurrent: v.optional(v.string()),
    stripePaymentLinkId: v.optional(v.string()),

    // Statut
    active: v.boolean(),

    createdAt: v.number(),
  })
    .index("by_active", ["active"])
    .index("by_type", ["type"]),

  /**
   * Transactions — une par lien PID envoye.
   * Le PID est la cle d'identification unique du paiement.
   */
  transactions: defineTable({
    pid: v.string(), // UUID court genere par l'ERP
    offerId: v.id("offers"),

    // Prospect info (informatif, pas cle d'identification)
    prospectName: v.optional(v.string()),
    prospectEmail: v.optional(v.string()),
    prospectPhone: v.optional(v.string()),

    // Lien vers le client Convex (rempli apres association)
    clientId: v.optional(v.id("clients")),
    leadId: v.optional(v.id("leads")),

    // Provider
    provider: v.optional(v.string()), // "stripe" | "paypal"
    providerTxId: v.optional(v.string()), // session_id (Stripe) ou order_id (PayPal)

    // Statut
    status: v.union(
      v.literal("pending"),
      v.literal("partial"),
      v.literal("completed"),
      v.literal("failed")
    ),

    // Echelonnement
    installmentCurrent: v.optional(v.number()),
    installmentTotal: v.optional(v.number()),

    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_pid", ["pid"])
    .index("by_providerTxId", ["providerTxId"])
    .index("by_leadId", ["leadId"])
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_offerId", ["offerId"]),

  /**
   * Paiements individuels — un par echeance/capture.
   */
  payments: defineTable({
    transactionId: v.id("transactions"),
    pid: v.string(), // denormalise pour lookup rapide

    amount: v.number(), // centimes EUR
    amountHT: v.optional(v.number()), // auto: x 0.80

    provider: v.string(), // "stripe" | "paypal" | "virement" | "gocardless"
    providerTxId: v.optional(v.string()), // ID de cette capture specifique
    providerPaymentId: v.optional(v.string()), // Stripe Payment ID

    status: v.union(
      v.literal("confirmed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("pending")
    ),

    installmentNumber: v.optional(v.number()),
    sourceType: v.optional(v.string()), // "Stripe", "PayPal", "Virement", "GoCardless"

    // Commissions calculees
    commissionClosing: v.optional(v.number()), // centimes
    commissionSetting: v.optional(v.number()), // centimes

    // Refs
    clientId: v.optional(v.id("clients")),
    closerId: v.optional(v.id("users")),
    setterId: v.optional(v.id("users")),

    confirmedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_transactionId", ["transactionId"])
    .index("by_pid", ["pid"])
    .index("by_clientId", ["clientId"])
    .index("by_status", ["status"])
    .index("by_confirmedAt", ["confirmedAt"])
    .index("by_closerId", ["closerId"])
    .index("by_setterId", ["setterId"]),

  /**
   * Idempotence des webhooks.
   */
  webhookEvents: defineTable({
    providerEventId: v.string(), // ID unique cote provider
    provider: v.string(), // "stripe" | "paypal"
    eventType: v.string(), // type d'event
    processed: v.boolean(),
    receivedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_providerEventId", ["providerEventId"]),

  // ============================================================
  // BOOKING SYSTEM
  // ============================================================

  /**
   * Calendriers de booking — chaque calendrier a un slug unique
   * et des closers assignes avec des priorites.
   */
  calendars: defineTable({
    name: v.string(), // ex: "Bilan offert"
    slug: v.string(), // ex: "bilan-offert-bio-insta"
    description: v.optional(v.string()), // rich text
    color: v.optional(v.string()), // hex
    internalNote: v.optional(v.string()), // ex: "Bio Insta"
    sourceTag: v.optional(v.string()), // pour le tracking CRM

    // Config
    duration: v.number(), // duree en minutes (30, 45, 60)
    bufferBefore: v.optional(v.number()), // minutes buffer avant
    bufferAfter: v.optional(v.number()), // minutes buffer apres
    maxPerDay: v.optional(v.number()), // limite de calls par jour par closer

    // Horaires
    availableDays: v.array(v.number()), // 0=dim, 1=lun, ..., 6=sam
    startHour: v.number(), // heure de debut (ex: 9)
    endHour: v.number(), // heure de fin (ex: 18)
    timezone: v.string(), // "Europe/Paris"

    // Hotes (closers avec priorites)
    hosts: v.array(
      v.object({
        userId: v.id("users"),
        priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      })
    ),

    // Formulaire custom (ID du formulaire associe)
    formId: v.optional(v.id("forms")),

    // Disqualification
    disqualificationRules: v.optional(v.string()), // JSON rules

    // Notifications
    confirmationEmailEnabled: v.boolean(),
    reminderEnabled: v.boolean(),
    reminderHoursBefore: v.optional(v.number()),

    // Page de confirmation
    confirmationMessage: v.optional(v.string()),

    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"]),

  /**
   * Bookings — RDV pris par les prospects.
   */
  bookings: defineTable({
    calendarId: v.id("calendars"),
    leadId: v.optional(v.id("leads")), // cree automatiquement au booking
    hostId: v.id("users"), // closer assigne

    // Prospect info
    prospectName: v.string(),
    prospectEmail: v.string(),
    prospectFirstName: v.optional(v.string()),
    prospectLastName: v.optional(v.string()),
    prospectPhone: v.optional(v.string()),

    // RDV
    startTime: v.number(), // timestamp debut
    endTime: v.number(), // timestamp fin
    timezone: v.string(),

    // Google Calendar
    googleEventId: v.optional(v.string()),
    googleMeetUrl: v.optional(v.string()),

    // Statut
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("completed")
    ),

    // Reponses formulaire
    formAnswers: v.optional(v.string()), // JSON

    // Source tracking
    sourceTag: v.optional(v.string()),
    calendarSlug: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_calendarId", ["calendarId"])
    .index("by_hostId", ["hostId"])
    .index("by_leadId", ["leadId"])
    .index("by_startTime", ["startTime"])
    .index("by_status", ["status"])
    .index("by_hostId_startTime", ["hostId", "startTime"]),

  // ============================================================
  // FORM BUILDER
  // ============================================================

  /**
   * Formulaires — onboarding, bilans, custom.
   */
  forms: defineTable({
    name: v.string(),
    type: v.union(v.literal("onboarding"), v.literal("bilan"), v.literal("booking"), v.literal("custom")),
    description: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_active", ["active"]),

  /**
   * Champs des formulaires — ordonnes par `order`.
   */
  formFields: defineTable({
    formId: v.id("forms"),
    type: v.union(
      v.literal("shortText"),
      v.literal("longText"),
      v.literal("email"),
      v.literal("phone"),
      v.literal("number"),
      v.literal("select"),
      v.literal("multiSelect"),
      v.literal("date"),
      v.literal("rating"),
      v.literal("fileUpload"),
      v.literal("section")
    ),
    label: v.string(),
    placeholder: v.optional(v.string()),
    description: v.optional(v.string()),
    required: v.boolean(),
    order: v.number(),
    options: v.optional(v.array(v.string())), // pour select/multiSelect
  })
    .index("by_formId", ["formId"])
    .index("by_formId_order", ["formId", "order"]),

  /**
   * Soumissions de formulaires — reponses des clients/prospects.
   */
  formSubmissions: defineTable({
    formId: v.id("forms"),
    clientId: v.optional(v.id("clients")),
    leadId: v.optional(v.id("leads")),

    // Reponses (JSON: { fieldId: value })
    answers: v.string(),

    // Fichiers uploades
    fileStorageIds: v.optional(v.array(v.id("_storage"))),

    submittedAt: v.number(),
  })
    .index("by_formId", ["formId"])
    .index("by_clientId", ["clientId"])
    .index("by_submittedAt", ["submittedAt"]),

  // ============================================================
  // BILANS (legacy from Tally, now via form builder)
  // ============================================================

  /**
   * Bilans clients — formulaires de suivi.
   */
  bilans: defineTable({
    clientId: v.id("clients"),
    formSubmissionId: v.optional(v.id("formSubmissions")),

    title: v.optional(v.string()), // "Bilan NomClient DD/MM/YYYY"
    type: v.union(v.literal("onboarding"), v.literal("bilan_mensuel")),
    etape: v.union(v.literal("check_answer"), v.literal("done")),

    // Contenu (si pas via form builder)
    reponse: v.optional(v.string()),
    photos: v.optional(v.array(v.id("_storage"))),
    bilanSang: v.optional(v.id("_storage")),
    loomUrl: v.optional(v.string()),

    dateReception: v.number(),
    createdAt: v.number(),
  })
    .index("by_clientId", ["clientId"])
    .index("by_type", ["type"])
    .index("by_dateReception", ["dateReception"]),

  // ============================================================
  // TRACKING COACH
  // ============================================================

  coachTracking: defineTable({
    coachEvalueId: v.id("users"),
    coachEvaluateurId: v.id("users"),

    // Criteres (1-5)
    delaiReponse: v.number(),
    relanceClients: v.number(),
    positionProfessionnelle: v.number(),
    qualiteDiete: v.number(),
    qualiteProgramme: v.number(),
    energie: v.number(),

    // Moyenne auto-calculee
    moyenne: v.number(),

    createdAt: v.number(),
  })
    .index("by_coachEvalueId", ["coachEvalueId"])
    .index("by_coachEvaluateurId", ["coachEvaluateurId"])
    .index("by_createdAt", ["createdAt"]),

  // ============================================================
  // FINANCE
  // ============================================================

  /**
   * Sorties / depenses de l'entreprise.
   */
  expenses: defineTable({
    name: v.string(),
    amount: v.number(), // centimes EUR
    category: v.string(), // "Stripe", "Logiciel", "Virement", "Commande", "Budget ADS"
    date: v.number(),
    source: v.optional(v.string()), // "Stripe", "PayPal", "Virement"
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_date", ["date"]),

  /**
   * Factures (clients + internes).
   */
  invoices: defineTable({
    type: v.union(v.literal("client"), v.literal("interne")),
    clientId: v.optional(v.id("clients")),
    teamMemberId: v.optional(v.id("users")),

    number: v.optional(v.string()),
    amount: v.number(), // centimes EUR
    status: v.union(v.literal("en_attente"), v.literal("paye"), v.literal("refuse")),
    invoiceType: v.optional(v.string()), // "Acompte 1", "Acompte 2", "Paiement complet"

    fileStorageId: v.optional(v.id("_storage")),
    dueDate: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_clientId", ["clientId"])
    .index("by_teamMemberId", ["teamMemberId"]),

  // ============================================================
  // DISCOUNT CODES
  // ============================================================

  discountCodes: defineTable({
    code: v.string(), // ex: "AC100", "AC200"
    amount: v.number(), // montant reduction en centimes
    stripePromoCodeId: v.optional(v.string()),
    stripeCouponId: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_active", ["active"]),

  // ============================================================
  // META ADS
  // ============================================================

  metaAds: defineTable({
    adId: v.string(),
    adName: v.string(),
    adSetName: v.optional(v.string()),
    campaignName: v.optional(v.string()),
    status: v.optional(v.string()),
    format: v.optional(v.string()), // "VIDEO", "IMAGE"

    spend: v.optional(v.number()),
    impressions: v.optional(v.number()),
    clicks: v.optional(v.number()),
    roas: v.optional(v.number()),
    ctr: v.optional(v.number()),
    cpa: v.optional(v.number()),
    cpc: v.optional(v.number()),
    cpm: v.optional(v.number()),

    description: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    permalinkUrl: v.optional(v.string()),
    adsLibraryUrl: v.optional(v.string()),
    transcript: v.optional(v.string()),

    lastSynced: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_adId", ["adId"])
    .index("by_campaignName", ["campaignName"])
    .index("by_status", ["status"])
    .index("by_lastSynced", ["lastSynced"]),

  // ============================================================
  // RESOURCES & SOPS
  // ============================================================

  resources: defineTable({
    title: v.string(),
    category: v.union(v.literal("sop"), v.literal("asset_coaching"), v.literal("asset_sales"), v.literal("ressource")),
    subCategory: v.optional(v.string()), // "Sales", "Coaching", "Admin", "Process"
    content: v.optional(v.string()), // rich text
    url: v.optional(v.string()),
    fileStorageIds: v.optional(v.array(v.id("_storage"))),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["active"]),

  // ============================================================
  // TASKS (gestion interne)
  // ============================================================

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("a_faire"), v.literal("en_cours"), v.literal("retard"), v.literal("termine"), v.literal("en_attente")),
    priority: v.union(v.literal("urgent"), v.literal("haute"), v.literal("moyenne"), v.literal("basse")),
    assigneeId: v.optional(v.id("users")),
    startDate: v.optional(v.number()),
    deadline: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_assigneeId", ["assigneeId"])
    .index("by_deadline", ["deadline"]),

  subTasks: defineTable({
    taskId: v.id("tasks"),
    title: v.string(),
    completed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_taskId", ["taskId"]),

  // ============================================================
  // CONFIG
  // ============================================================

  config: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  })
    .index("by_key", ["key"]),
});
