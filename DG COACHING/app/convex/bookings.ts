import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";


// ============================================================
// HELPERS
// ============================================================

function getStartOfWeek(timestamp: number): number {
	const date = new Date(timestamp);
	const day = date.getDay();
	const diff = day === 0 ? -6 : 1 - day; // Monday = start of week
	const monday = new Date(date);
	monday.setDate(date.getDate() + diff);
	monday.setHours(0, 0, 0, 0);
	return monday.getTime();
}

function getStartOfDay(timestamp: number): number {
	const d = new Date(timestamp);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

function getEndOfDay(timestamp: number): number {
	const d = new Date(timestamp);
	d.setHours(23, 59, 59, 999);
	return d.getTime();
}

// ============================================================
// QUERIES
// ============================================================

export const list = query({
	args: {
		hostId: v.optional(v.id("users")),
		status: v.optional(v.string()),
	},
	handler: async (ctx, { hostId, status }) => {

		let results;
		if (hostId) {
			results = await ctx.db
				.query("bookings")
				.withIndex("by_hostId", (q) => q.eq("hostId", hostId))
				.collect();
		} else {
			results = await ctx.db.query("bookings").collect();
		}

		if (status) {
			results = results.filter((b) => b.status === status);
		}

		// Sort by startTime descending
		return results.sort((a, b) => b.startTime - a.startTime);
	},
});

export const getById = query({
	args: { id: v.id("bookings") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const getToday = query({
	args: { hostId: v.optional(v.id("users")) },
	handler: async (ctx, { hostId }) => {

		const now = Date.now();
		const dayStart = getStartOfDay(now);
		const dayEnd = getEndOfDay(now);

		let results;
		if (hostId) {
			results = await ctx.db
				.query("bookings")
				.withIndex("by_hostId_startTime", (q) =>
					q.eq("hostId", hostId).gte("startTime", dayStart),
				)
				.collect();
			results = results.filter((b) => b.startTime <= dayEnd);
		} else {
			results = await ctx.db
				.query("bookings")
				.withIndex("by_startTime", (q) => q.gte("startTime", dayStart))
				.collect();
			results = results.filter((b) => b.startTime <= dayEnd);
		}

		return results.sort((a, b) => a.startTime - b.startTime);
	},
});

export const getUpcoming = query({
	args: { hostId: v.optional(v.id("users")) },
	handler: async (ctx, { hostId }) => {

		const now = Date.now();

		let results;
		if (hostId) {
			results = await ctx.db
				.query("bookings")
				.withIndex("by_hostId_startTime", (q) =>
					q.eq("hostId", hostId).gte("startTime", now),
				)
				.collect();
		} else {
			results = await ctx.db
				.query("bookings")
				.withIndex("by_startTime", (q) => q.gte("startTime", now))
				.collect();
		}

		return results
			.filter((b) => b.status === "confirmed")
			.sort((a, b) => a.startTime - b.startTime);
	},
});

/**
 * PUBLIC query — calculates available time slots for a calendar.
 * For now, simulates availability based on calendar config (no Google Calendar).
 */
export const getAvailableSlots = query({
	args: {
		calendarSlug: v.string(),
		date: v.number(), // timestamp of the day requested
	},
	handler: async (ctx, { calendarSlug, date }) => {
		// Public — no auth
		const calendar = await ctx.db
			.query("calendars")
			.withIndex("by_slug", (q) => q.eq("slug", calendarSlug))
			.first();

		if (!calendar || !calendar.active) return [];

		const requestedDate = new Date(date);
		const dayOfWeek = requestedDate.getDay(); // 0=Sun, 1=Mon, ...

		// Check if this day is available
		if (!calendar.availableDays.includes(dayOfWeek)) return [];

		// Don't allow booking in the past
		const now = Date.now();
		const dayStart = getStartOfDay(date);
		if (dayStart < getStartOfDay(now)) return [];

		// Get all confirmed bookings for this calendar on this day
		const dayEnd = getEndOfDay(date);
		const allBookingsToday = await ctx.db
			.query("bookings")
			.withIndex("by_calendarId", (q) => q.eq("calendarId", calendar._id))
			.collect();

		const confirmedToday = allBookingsToday.filter(
			(b) =>
				b.status === "confirmed" &&
				b.startTime >= dayStart &&
				b.startTime <= dayEnd,
		);

		// Check max per day across all hosts
		if (calendar.maxPerDay && confirmedToday.length >= calendar.maxPerDay * calendar.hosts.length) {
			return [];
		}

		// Generate time slots based on calendar config
		const durationMs = calendar.duration * 60 * 1000;
		const bufferBeforeMs = (calendar.bufferBefore || 0) * 60 * 1000;
		const bufferAfterMs = (calendar.bufferAfter || 0) * 60 * 1000;
		const slotTotalMs = durationMs + bufferBeforeMs + bufferAfterMs;

		const slots: { time: number; display: string }[] = [];

		// Create a Date for slot generation in the calendar's day
		const slotDate = new Date(dayStart);
		let currentSlotStart = new Date(slotDate);
		currentSlotStart.setHours(calendar.startHour, 0, 0, 0);

		const endTime = new Date(slotDate);
		endTime.setHours(calendar.endHour, 0, 0, 0);

		while (currentSlotStart.getTime() + durationMs <= endTime.getTime()) {
			const slotStartMs = currentSlotStart.getTime();
			const slotEndMs = slotStartMs + durationMs;

			// Skip if in the past (with 30min buffer for imminent slots)
			if (slotStartMs <= now + 30 * 60 * 1000) {
				currentSlotStart = new Date(currentSlotStart.getTime() + slotTotalMs);
				continue;
			}

			// Check if at least one host is available for this slot
			let hostAvailable = false;
			for (const host of calendar.hosts) {
				// Get this host's bookings for today
				const hostBookingsToday = confirmedToday.filter(
					(b) => b.hostId === host.userId,
				);

				// Check max per day per host
				if (calendar.maxPerDay && hostBookingsToday.length >= calendar.maxPerDay) {
					continue;
				}

				// Check if host has a conflicting booking (including buffers)
				const hasConflict = hostBookingsToday.some((b) => {
					const existingStart = b.startTime - bufferBeforeMs;
					const existingEnd = b.endTime + bufferAfterMs;
					return slotStartMs < existingEnd && slotEndMs > existingStart;
				});

				if (!hasConflict) {
					hostAvailable = true;
					break;
				}
			}

			if (hostAvailable) {
				const hours = currentSlotStart.getHours().toString().padStart(2, "0");
				const minutes = currentSlotStart.getMinutes().toString().padStart(2, "0");
				slots.push({
					time: slotStartMs,
					display: `${hours}:${minutes}`,
				});
			}

			currentSlotStart = new Date(currentSlotStart.getTime() + slotTotalMs);
		}

		return slots;
	},
});

/**
 * PUBLIC query — get available days for a month (for calendar highlighting)
 */
export const getAvailableDays = query({
	args: {
		calendarSlug: v.string(),
		month: v.number(), // 0-11
		year: v.number(),
	},
	handler: async (ctx, { calendarSlug, month, year }) => {
		const calendar = await ctx.db
			.query("calendars")
			.withIndex("by_slug", (q) => q.eq("slug", calendarSlug))
			.first();

		if (!calendar || !calendar.active) return [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const availableDays: number[] = [];

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			// Skip past dates
			if (date < today) continue;
			// Check if day of week is available
			if (calendar.availableDays.includes(date.getDay())) {
				availableDays.push(day);
			}
		}

		return availableDays;
	},
});

// ============================================================
// MUTATIONS
// ============================================================

export const create = mutation({
	args: {
		calendarId: v.id("calendars"),
		prospectEmail: v.string(),
		prospectFirstName: v.string(),
		prospectLastName: v.string(),
		prospectPhone: v.optional(v.string()),
		startTime: v.number(),
		formAnswers: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		// Public — no auth required
		const calendar = await ctx.db.get(args.calendarId);
		if (!calendar || !calendar.active) {
			throw new Error("Calendrier non disponible");
		}

		const durationMs = calendar.duration * 60 * 1000;
		const endTime = args.startTime + durationMs;
		const bufferBeforeMs = (calendar.bufferBefore || 0) * 60 * 1000;
		const bufferAfterMs = (calendar.bufferAfter || 0) * 60 * 1000;

		// Round-robin: select host
		const weekStart = getStartOfWeek(args.startTime);
		const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

		// Get all bookings this week for counting
		const allBookings = await ctx.db
			.query("bookings")
			.withIndex("by_calendarId", (q) => q.eq("calendarId", calendar._id))
			.collect();

		const weekBookings = allBookings.filter(
			(b) =>
				b.status === "confirmed" &&
				b.startTime >= weekStart &&
				b.startTime < weekEnd,
		);

		// Day bookings for maxPerDay check
		const dayStart = getStartOfDay(args.startTime);
		const dayEnd = getEndOfDay(args.startTime);
		const dayBookings = allBookings.filter(
			(b) =>
				b.status === "confirmed" &&
				b.startTime >= dayStart &&
				b.startTime <= dayEnd,
		);

		// Sort hosts by priority (high → medium → low)
		const priorityOrder = { high: 0, medium: 1, low: 2 };
		const sortedHosts = [...calendar.hosts].sort(
			(a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
		);

		// Group by priority
		const priorityGroups = new Map<string, typeof sortedHosts>();
		for (const host of sortedHosts) {
			const group = priorityGroups.get(host.priority) || [];
			group.push(host);
			priorityGroups.set(host.priority, group);
		}

		let selectedHostId: Id<"users"> | null = null;

		for (const priority of ["high", "medium", "low"]) {
			const group = priorityGroups.get(priority);
			if (!group || group.length === 0) continue;

			// Within same priority: pick least booked this week + available for slot
			const candidates = group
				.map((host) => {
					const hostWeekCount = weekBookings.filter(
						(b) => b.hostId === host.userId,
					).length;
					const hostDayBookings = dayBookings.filter(
						(b) => b.hostId === host.userId,
					);

					// Check maxPerDay
					if (calendar.maxPerDay && hostDayBookings.length >= calendar.maxPerDay) {
						return null;
					}

					// Check time conflict with buffers
					const hasConflict = hostDayBookings.some((b) => {
						const existingStart = b.startTime - bufferBeforeMs;
						const existingEnd = b.endTime + bufferAfterMs;
						return args.startTime < existingEnd && endTime > existingStart;
					});

					if (hasConflict) return null;

					return { userId: host.userId, weekCount: hostWeekCount };
				})
				.filter(Boolean) as { userId: Id<"users">; weekCount: number }[];

			if (candidates.length === 0) continue;

			// Pick the one with least bookings this week
			candidates.sort((a, b) => a.weekCount - b.weekCount);
			selectedHostId = candidates[0].userId;
			break;
		}

		if (!selectedHostId) {
			throw new Error("Aucun creneau disponible pour cet horaire");
		}

		const prospectName = `${args.prospectFirstName} ${args.prospectLastName}`;

		// Create booking
		const bookingId = await ctx.db.insert("bookings", {
			calendarId: args.calendarId,
			hostId: selectedHostId!,
			prospectName,
			prospectEmail: args.prospectEmail,
			prospectFirstName: args.prospectFirstName,
			prospectLastName: args.prospectLastName,
			prospectPhone: args.prospectPhone,
			startTime: args.startTime,
			endTime,
			timezone: calendar.timezone,
			status: "confirmed",
			formAnswers: args.formAnswers,
			sourceTag: calendar.sourceTag,
			calendarSlug: calendar.slug,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		// Create lead in CRM
		const existingLead = await ctx.db
			.query("leads")
			.withIndex("by_email", (q) => q.eq("email", args.prospectEmail))
			.first();

		if (existingLead) {
			// Update existing lead
			await ctx.db.patch(existingLead._id, {
				dateBookingCall: args.startTime,
				etapeClosing: "appel_a_venir",
				bookingId,
				calendarSlug: calendar.slug,
				updatedAt: Date.now(),
			});
		} else {
			// Create new lead
			await ctx.db.insert("leads", {
				name: prospectName,
				firstName: args.prospectFirstName,
				lastName: args.prospectLastName,
				email: args.prospectEmail,
				phone: args.prospectPhone,
				source: calendar.sourceTag || calendar.slug,
				type: "prospect",
				qualification: "pending",
				etapeClosing: "appel_a_venir",
				dateBookingCall: args.startTime,
				bookingId,
				calendarSlug: calendar.slug,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			});
		}

		return {
			bookingId,
			startTime: args.startTime,
			endTime,
			hostId: selectedHostId,
		};
	},
});

export const cancel = mutation({
	args: { id: v.id("bookings") },
	handler: async (ctx, { id }) => {
		await ctx.db.patch(id, { status: "cancelled", updatedAt: Date.now() });
	},
});

export const markNoShow = mutation({
	args: { id: v.id("bookings") },
	handler: async (ctx, { id }) => {

		await ctx.db.patch(id, { status: "no_show", updatedAt: Date.now() });

		// Update lead etape
		const booking = await ctx.db.get(id);
		if (booking?.leadId) {
			await ctx.db.patch(booking.leadId, {
				etapeClosing: "no_show",
				updatedAt: Date.now(),
			});
		}
	},
});

export const markCompleted = mutation({
	args: { id: v.id("bookings") },
	handler: async (ctx, { id }) => {

		await ctx.db.patch(id, { status: "completed", updatedAt: Date.now() });

		// Update lead etape
		const booking = await ctx.db.get(id);
		if (booking?.leadId) {
			await ctx.db.patch(booking.leadId, {
				etapeClosing: "appel_effectue",
				updatedAt: Date.now(),
			});
		}
	},
});
