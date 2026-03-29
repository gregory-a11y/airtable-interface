import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
	...authTables,

	// ============================================================
	// USERS (extends auth)
	// ============================================================
	users: defineTable({
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		isAnonymous: v.optional(v.boolean()),
		// Custom fields
		role: v.optional(v.union(v.literal("admin"), v.literal("sales"), v.literal("coach"))),
		status: v.optional(
			v.union(v.literal("active"), v.literal("invited"), v.literal("disabled")),
		),
		bio: v.optional(v.string()),
		specialty: v.optional(v.string()),
		avatarStorageId: v.optional(v.id("_storage")),
		commissionPercent: v.optional(v.number()),
		pricePerStudent: v.optional(v.number()),
		maxCapacity: v.optional(v.number()),
		googleAccessToken: v.optional(v.string()),
		googleRefreshToken: v.optional(v.string()),
		googleTokenExpiry: v.optional(v.number()),
		googleCalendarId: v.optional(v.string()),
		inviteToken: v.optional(v.string()),
		inviteExpiry: v.optional(v.number()),
	})
		.index("email", ["email"])
		.index("by_role", ["role"])
		.index("by_status", ["status"])
		.index("by_inviteToken", ["inviteToken"]),

	// ============================================================
	// LEADS / CRM
	// ============================================================
	leads: defineTable({
		name: v.string(),
		firstName: v.optional(v.string()),
		lastName: v.optional(v.string()),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		instagram: v.optional(v.string()),
		address: v.optional(v.string()),
		source: v.string(),
		type: v.union(v.literal("prospect"), v.literal("client"), v.literal("ancien_client")),
		qualification: v.union(
			v.literal("qualifie"),
			v.literal("non_qualifie"),
			v.literal("pending"),
		),
		etapeClosing: v.string(),
		raisonPerte: v.optional(v.string()),
		etapeSetting: v.optional(v.string()),
		leadType: v.optional(v.string()),
		dateBookingCall: v.optional(v.number()),
		dateAppelVente: v.optional(v.number()),
		meetingUrl: v.optional(v.string()),
		videoCallUrl: v.optional(v.string()),
		transcriptCall: v.optional(v.string()),
		questionnaireAnswers: v.optional(v.string()),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		offerId: v.optional(v.id("offers")),
		discountCodeId: v.optional(v.id("discountCodes")),
		montantContracte: v.optional(v.number()),
		noteInterne: v.optional(v.string()),
		bookingId: v.optional(v.id("bookings")),
		calendarSlug: v.optional(v.string()),
		clientId: v.optional(v.id("clients")),
		convertedAt: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_email", ["email"])
		.index("by_phone", ["phone"])
		.index("by_etapeClosing", ["etapeClosing"])
		.index("by_source", ["source"])
		.index("by_type", ["type"])
		.index("by_setterId", ["setterId"])
		.index("by_closerId", ["closerId"])
		.index("by_createdAt", ["createdAt"])
		.index("by_qualification", ["qualification"]),

	// ============================================================
	// CLIENTS
	// ============================================================
	clients: defineTable({
		name: v.string(),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		address: v.optional(v.string()),
		status: v.string(),
		prestation: v.string(),
		montantContracteTTC: v.number(),
		dateDebut: v.optional(v.number()),
		dateFinCalculee: v.optional(v.number()),
		nbJoursPause: v.optional(v.number()),
		dateFinReelle: v.optional(v.number()),
		dateClosing: v.optional(v.number()),
		coachId: v.optional(v.id("users")),
		trainingLogUrl: v.optional(v.string()),
		telegramGroupUrl: v.optional(v.string()),
		telegramGroupId: v.optional(v.string()),
		dossierClientUrl: v.optional(v.string()),
		dossierPhotoUrl: v.optional(v.string()),
		jourDuBilan: v.optional(v.string()),
		onboardingStatus: v.optional(v.string()),
		leadId: v.optional(v.id("leads")),
		setterId: v.optional(v.id("users")),
		closerId: v.optional(v.id("users")),
		commissionPercentSetter: v.optional(v.number()),
		commissionPercentCloser: v.optional(v.number()),
		notes: v.optional(v.string()),
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
	offers: defineTable({
		name: v.string(),
		type: v.union(v.literal("classique"), v.literal("renouvellement"), v.literal("acompte")),
		amount: v.number(),
		currency: v.string(),
		paymentMode: v.union(
			v.literal("unique"),
			v.literal("mensuel"),
			v.literal("fixe_plus_mensuel"),
		),
		installmentCount: v.optional(v.number()),
		firstPaymentAmount: v.optional(v.number()),
		recurringAmount: v.optional(v.number()),
		duration: v.optional(v.string()),
		providers: v.array(v.string()),
		stripeProductIdOneShot: v.optional(v.string()),
		stripeProductIdRecurrent: v.optional(v.string()),
		stripePriceIdOneShot: v.optional(v.string()),
		stripePriceIdRecurrent: v.optional(v.string()),
		stripePaymentLinkId: v.optional(v.string()),
		active: v.boolean(),
		createdAt: v.number(),
	})
		.index("by_active", ["active"])
		.index("by_type", ["type"]),

	transactions: defineTable({
		pid: v.string(),
		offerId: v.id("offers"),
		prospectName: v.optional(v.string()),
		prospectEmail: v.optional(v.string()),
		prospectPhone: v.optional(v.string()),
		clientId: v.optional(v.id("clients")),
		leadId: v.optional(v.id("leads")),
		provider: v.optional(v.string()),
		providerTxId: v.optional(v.string()),
		status: v.union(
			v.literal("pending"),
			v.literal("partial"),
			v.literal("completed"),
			v.literal("failed"),
		),
		installmentCurrent: v.optional(v.number()),
		installmentTotal: v.optional(v.number()),
		createdAt: v.number(),
		confirmedAt: v.optional(v.number()),
	})
		.index("by_pid", ["pid"])
		.index("by_providerTxId", ["providerTxId"])
		.index("by_leadId", ["leadId"])
		.index("by_clientId", ["clientId"])
		.index("by_status", ["status"]),

	payments: defineTable({
		transactionId: v.id("transactions"),
		pid: v.string(),
		amount: v.number(),
		amountHT: v.optional(v.number()),
		provider: v.string(),
		providerTxId: v.optional(v.string()),
		providerPaymentId: v.optional(v.string()),
		status: v.union(
			v.literal("confirmed"),
			v.literal("failed"),
			v.literal("refunded"),
			v.literal("pending"),
		),
		installmentNumber: v.optional(v.number()),
		sourceType: v.optional(v.string()),
		commissionClosing: v.optional(v.number()),
		commissionSetting: v.optional(v.number()),
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

	webhookEvents: defineTable({
		providerEventId: v.string(),
		provider: v.string(),
		eventType: v.string(),
		processed: v.boolean(),
		receivedAt: v.number(),
		processedAt: v.optional(v.number()),
	}).index("by_providerEventId", ["providerEventId"]),

	// ============================================================
	// BOOKING SYSTEM
	// ============================================================
	calendars: defineTable({
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		color: v.optional(v.string()),
		internalNote: v.optional(v.string()),
		sourceTag: v.optional(v.string()),
		duration: v.number(),
		bufferBefore: v.optional(v.number()),
		bufferAfter: v.optional(v.number()),
		maxPerDay: v.optional(v.number()),
		availableDays: v.array(v.number()),
		startHour: v.number(),
		endHour: v.number(),
		timezone: v.string(),
		hosts: v.array(
			v.object({
				userId: v.id("users"),
				priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
			}),
		),
		formId: v.optional(v.id("forms")),
		confirmationEmailEnabled: v.boolean(),
		reminderEnabled: v.boolean(),
		reminderHoursBefore: v.optional(v.number()),
		confirmationMessage: v.optional(v.string()),
		active: v.boolean(),
		createdAt: v.number(),
	})
		.index("by_slug", ["slug"])
		.index("by_active", ["active"]),

	bookings: defineTable({
		calendarId: v.id("calendars"),
		leadId: v.optional(v.id("leads")),
		hostId: v.id("users"),
		prospectName: v.string(),
		prospectEmail: v.string(),
		prospectFirstName: v.optional(v.string()),
		prospectLastName: v.optional(v.string()),
		prospectPhone: v.optional(v.string()),
		startTime: v.number(),
		endTime: v.number(),
		timezone: v.string(),
		googleEventId: v.optional(v.string()),
		googleMeetUrl: v.optional(v.string()),
		status: v.union(
			v.literal("confirmed"),
			v.literal("cancelled"),
			v.literal("no_show"),
			v.literal("completed"),
		),
		formAnswers: v.optional(v.string()),
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
	forms: defineTable({
		name: v.string(),
		type: v.union(
			v.literal("onboarding"),
			v.literal("bilan"),
			v.literal("booking"),
			v.literal("custom"),
		),
		description: v.optional(v.string()),
		active: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_type", ["type"])
		.index("by_active", ["active"]),

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
			v.literal("section"),
		),
		label: v.string(),
		placeholder: v.optional(v.string()),
		description: v.optional(v.string()),
		required: v.boolean(),
		order: v.number(),
		options: v.optional(v.array(v.string())),
	})
		.index("by_formId", ["formId"])
		.index("by_formId_order", ["formId", "order"]),

	formSubmissions: defineTable({
		formId: v.id("forms"),
		clientId: v.optional(v.id("clients")),
		leadId: v.optional(v.id("leads")),
		answers: v.string(),
		fileStorageIds: v.optional(v.array(v.id("_storage"))),
		submittedAt: v.number(),
	})
		.index("by_formId", ["formId"])
		.index("by_clientId", ["clientId"])
		.index("by_submittedAt", ["submittedAt"]),

	// ============================================================
	// BILANS
	// ============================================================
	bilans: defineTable({
		clientId: v.id("clients"),
		formSubmissionId: v.optional(v.id("formSubmissions")),
		title: v.optional(v.string()),
		type: v.union(v.literal("onboarding"), v.literal("bilan_mensuel")),
		etape: v.union(v.literal("check_answer"), v.literal("done")),
		reponse: v.optional(v.string()),
		photos: v.optional(v.array(v.id("_storage"))),
		bilanSang: v.optional(v.id("_storage")),
		loomUrl: v.optional(v.string()),
		dateReception: v.number(),
		createdAt: v.number(),
	})
		.index("by_clientId", ["clientId"])
		.index("by_type", ["type"]),

	// ============================================================
	// TRACKING COACH
	// ============================================================
	coachTracking: defineTable({
		coachEvalueId: v.id("users"),
		coachEvaluateurId: v.id("users"),
		delaiReponse: v.number(),
		relanceClients: v.number(),
		positionProfessionnelle: v.number(),
		qualiteDiete: v.number(),
		qualiteProgramme: v.number(),
		energie: v.number(),
		moyenne: v.number(),
		createdAt: v.number(),
	})
		.index("by_coachEvalueId", ["coachEvalueId"])
		.index("by_createdAt", ["createdAt"]),

	// ============================================================
	// FINANCE
	// ============================================================
	expenses: defineTable({
		name: v.string(),
		amount: v.number(),
		category: v.string(),
		date: v.number(),
		source: v.optional(v.string()),
		notes: v.optional(v.string()),
		createdAt: v.number(),
	})
		.index("by_category", ["category"])
		.index("by_date", ["date"]),

	invoices: defineTable({
		type: v.union(v.literal("client"), v.literal("interne")),
		clientId: v.optional(v.id("clients")),
		teamMemberId: v.optional(v.id("users")),
		number: v.optional(v.string()),
		amount: v.number(),
		status: v.union(v.literal("en_attente"), v.literal("paye"), v.literal("refuse")),
		invoiceType: v.optional(v.string()),
		fileStorageId: v.optional(v.id("_storage")),
		dueDate: v.optional(v.number()),
		createdAt: v.number(),
	})
		.index("by_type", ["type"])
		.index("by_status", ["status"])
		.index("by_clientId", ["clientId"]),

	// ============================================================
	// DISCOUNT CODES
	// ============================================================
	discountCodes: defineTable({
		code: v.string(),
		amount: v.number(),
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
		format: v.optional(v.string()),
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
		.index("by_status", ["status"]),

	// ============================================================
	// RESOURCES & SOPS
	// ============================================================
	resources: defineTable({
		title: v.string(),
		category: v.union(
			v.literal("sop"),
			v.literal("asset_coaching"),
			v.literal("asset_sales"),
			v.literal("ressource"),
		),
		subCategory: v.optional(v.string()),
		content: v.optional(v.string()),
		url: v.optional(v.string()),
		fileStorageIds: v.optional(v.array(v.id("_storage"))),
		active: v.boolean(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_category", ["category"])
		.index("by_active", ["active"]),

	// ============================================================
	// TASKS
	// ============================================================
	tasks: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		status: v.union(
			v.literal("a_faire"),
			v.literal("en_cours"),
			v.literal("retard"),
			v.literal("termine"),
			v.literal("en_attente"),
		),
		priority: v.union(
			v.literal("urgent"),
			v.literal("haute"),
			v.literal("moyenne"),
			v.literal("basse"),
		),
		assigneeId: v.optional(v.id("users")),
		startDate: v.optional(v.number()),
		deadline: v.optional(v.number()),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("by_status", ["status"])
		.index("by_assigneeId", ["assigneeId"]),

	subTasks: defineTable({
		taskId: v.id("tasks"),
		title: v.string(),
		completed: v.boolean(),
		createdAt: v.number(),
	}).index("by_taskId", ["taskId"]),

	// ============================================================
	// CONFIG
	// ============================================================
	config: defineTable({
		key: v.string(),
		value: v.string(),
		updatedAt: v.number(),
	}).index("by_key", ["key"]),
});
