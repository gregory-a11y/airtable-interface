import { query, mutation } from "./_generated/server";
import { v } from "convex/values";


export const list = query({
	args: { type: v.optional(v.string()), active: v.optional(v.boolean()) },
	handler: async (ctx, { type, active }) => {
		let results = await ctx.db.query("forms").order("desc").collect();
		if (type) results = results.filter((f) => f.type === type);
		if (active !== undefined) results = results.filter((f) => f.active === active);
		return results;
	},
});

export const getById = query({
	args: { id: v.id("forms") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const getWithFields = query({
	args: { id: v.id("forms") },
	handler: async (ctx, { id }) => {
		const form = await ctx.db.get(id);
		if (!form) return null;
		const fields = await ctx.db
			.query("formFields")
			.withIndex("by_formId_order", (q) => q.eq("formId", id))
			.collect();
		return { ...form, fields };
	},
});

export const create = mutation({
	args: {
		name: v.string(),
		type: v.union(v.literal("onboarding"), v.literal("bilan"), v.literal("booking"), v.literal("custom")),
		description: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("forms", {
			...args,
			description: args.description || "",
			active: true,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});
	},
});

export const update = mutation({
	args: {
		id: v.id("forms"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		active: v.optional(v.boolean()),
	},
	handler: async (ctx, { id, ...fields }) => {
		const updates: Record<string, unknown> = { updatedAt: Date.now() };
		for (const [k, val] of Object.entries(fields)) {
			if (val !== undefined) updates[k] = val;
		}
		await ctx.db.patch(id, updates);
	},
});

export const remove = mutation({
	args: { id: v.id("forms") },
	handler: async (ctx, { id }) => {
		// Delete associated fields
		const fields = await ctx.db
			.query("formFields")
			.withIndex("by_formId", (q) => q.eq("formId", id))
			.collect();
		for (const field of fields) {
			await ctx.db.delete(field._id);
		}
		await ctx.db.delete(id);
	},
});

// ============================================================
// FORM FIELDS
// ============================================================

export const addField = mutation({
	args: {
		formId: v.id("forms"),
		type: v.union(v.literal("shortText"), v.literal("longText"), v.literal("email"), v.literal("phone"), v.literal("number"), v.literal("select"), v.literal("multiSelect"), v.literal("date"), v.literal("rating"), v.literal("fileUpload"), v.literal("section")),
		label: v.string(),
		placeholder: v.optional(v.string()),
		description: v.optional(v.string()),
		required: v.optional(v.boolean()),
		options: v.optional(v.array(v.string())),
	},
	handler: async (ctx, { formId, ...args }) => {
		const existing = await ctx.db
			.query("formFields")
			.withIndex("by_formId", (q) => q.eq("formId", formId))
			.collect();
		const order = existing.length;

		return await ctx.db.insert("formFields", {
			formId,
			...args,
			required: args.required ?? false,
			order,
		});
	},
});

export const updateField = mutation({
	args: {
		id: v.id("formFields"),
		label: v.optional(v.string()),
		placeholder: v.optional(v.string()),
		description: v.optional(v.string()),
		required: v.optional(v.boolean()),
		options: v.optional(v.array(v.string())),
	},
	handler: async (ctx, { id, ...fields }) => {
		const updates: Record<string, unknown> = {};
		for (const [k, val] of Object.entries(fields)) {
			if (val !== undefined) updates[k] = val;
		}
		if (Object.keys(updates).length > 0) {
			await ctx.db.patch(id, updates);
		}
	},
});

export const removeField = mutation({
	args: { id: v.id("formFields") },
	handler: async (ctx, { id }) => {
		const field = await ctx.db.get(id);
		if (!field) return;
		await ctx.db.delete(id);

		// Reorder remaining fields
		const remaining = await ctx.db
			.query("formFields")
			.withIndex("by_formId_order", (q) => q.eq("formId", field.formId))
			.collect();
		for (let i = 0; i < remaining.length; i++) {
			if (remaining[i].order !== i) {
				await ctx.db.patch(remaining[i]._id, { order: i });
			}
		}
	},
});

export const reorderFields = mutation({
	args: {
		fieldIds: v.array(v.id("formFields")),
	},
	handler: async (ctx, { fieldIds }) => {
		for (let i = 0; i < fieldIds.length; i++) {
			await ctx.db.patch(fieldIds[i], { order: i });
		}
	},
});

// ============================================================
// FORM SUBMISSIONS
// ============================================================

export const submitForm = mutation({
	args: {
		formId: v.id("forms"),
		clientId: v.optional(v.id("clients")),
		leadId: v.optional(v.id("leads")),
		answers: v.string(),
		fileStorageIds: v.optional(v.array(v.id("_storage"))),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("formSubmissions", {
			formId: args.formId,
			clientId: args.clientId,
			leadId: args.leadId,
			answers: args.answers,
			fileStorageIds: args.fileStorageIds,
			submittedAt: Date.now(),
		});
	},
});

export const listSubmissions = query({
	args: {
		formId: v.optional(v.id("forms")),
		clientId: v.optional(v.id("clients")),
	},
	handler: async (ctx, { formId, clientId }) => {
		if (formId) {
			return await ctx.db
				.query("formSubmissions")
				.withIndex("by_formId", (q) => q.eq("formId", formId))
				.order("desc")
				.collect();
		}
		if (clientId) {
			return await ctx.db
				.query("formSubmissions")
				.withIndex("by_clientId", (q) => q.eq("clientId", clientId))
				.order("desc")
				.collect();
		}
		return await ctx.db.query("formSubmissions").order("desc").take(100);
	},
});
