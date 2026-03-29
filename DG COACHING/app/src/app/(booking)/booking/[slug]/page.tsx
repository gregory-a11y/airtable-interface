"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
	ChevronLeft,
	ChevronRight,
	Check,
	Clock,
	Calendar,
	User,
	Mail,
	Phone,
	Loader2,
	CheckCircle2,
	CalendarCheck,
} from "lucide-react";

// ============================================================
// MAIN BOOKING PAGE
// ============================================================

export default function BookingPage() {
	const params = useParams();
	const slug = params.slug as string;

	const calendar = useQuery(api.calendars.getBySlug, { slug });

	if (calendar === undefined) {
		return <BookingShell><LoadingSpinner /></BookingShell>;
	}

	if (calendar === null) {
		return (
			<BookingShell>
				<div className="py-20 text-center">
					<CalendarCheck size={48} className="mx-auto text-slate-300" />
					<h2 className="mt-4 text-xl font-semibold text-slate-700">
						Calendrier introuvable
					</h2>
					<p className="mt-2 text-sm text-slate-500">
						Ce lien de reservation n'est pas valide ou le calendrier a ete desactive.
					</p>
				</div>
			</BookingShell>
		);
	}

	if (!calendar.active) {
		return (
			<BookingShell>
				<div className="py-20 text-center">
					<CalendarCheck size={48} className="mx-auto text-slate-300" />
					<h2 className="mt-4 text-xl font-semibold text-slate-700">
						Reservations suspendues
					</h2>
					<p className="mt-2 text-sm text-slate-500">
						Les reservations ne sont pas disponibles pour le moment. Revenez plus tard.
					</p>
				</div>
			</BookingShell>
		);
	}

	return (
		<BookingShell>
			<BookingFlow calendar={calendar} />
		</BookingShell>
	);
}

// ============================================================
// SHELL (Header + Container)
// ============================================================

function BookingShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col bg-slate-50">
			{/* Header */}
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto flex h-16 max-w-4xl items-center px-4">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D0003C]">
							<span className="text-sm font-black text-white">P</span>
						</div>
						<div>
							<div className="text-sm font-bold text-slate-800">Prime Coaching</div>
							<div className="text-[10px] text-slate-400">Reservez votre rendez-vous</div>
						</div>
					</div>
				</div>
			</header>

			{/* Content */}
			<div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</div>
		</div>
	);
}

// ============================================================
// BOOKING FLOW
// ============================================================

type CalendarDoc = NonNullable<ReturnType<typeof useQuery<typeof api.calendars.getBySlug>>>;

function BookingFlow({ calendar }: { calendar: CalendarDoc }) {
	const [step, setStep] = useState<1 | 2 | 3>(1);

	// Form state
	const [email, setEmail] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

	// Calendar state
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

	// Result
	const [bookingResult, setBookingResult] = useState<{
		startTime: number;
		endTime: number;
	} | null>(null);

	const createBooking = useMutation(api.bookings.create);

	const handleFormSubmit = () => {
		if (!email.trim() || !firstName.trim() || !lastName.trim()) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}
		// Simple email validation
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			toast.error("Adresse email invalide");
			return;
		}
		setStep(2);
	};

	const handleConfirmBooking = async () => {
		if (!selectedSlot) return;

		try {
			const result = await createBooking({
				calendarId: calendar._id,
				prospectEmail: email,
				prospectFirstName: firstName,
				prospectLastName: lastName,
				prospectPhone: phone || undefined,
				startTime: selectedSlot,
				formAnswers:
					Object.keys(customAnswers).length > 0
						? JSON.stringify(customAnswers)
						: undefined,
			});
			setBookingResult({
				startTime: result.startTime,
				endTime: result.endTime,
			});
			setStep(3);
		} catch (err: any) {
			toast.error(
				err.message || "Erreur lors de la reservation. Veuillez reessayer.",
			);
		}
	};

	return (
		<div>
			{/* Step Indicator */}
			<StepIndicator currentStep={step} />

			{/* Step Content */}
			{step === 1 && (
				<div className="mt-6 grid gap-6 lg:grid-cols-5">
					{/* Form (left, larger) */}
					<div className="lg:col-span-3">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							{/* Calendar Info */}
							<div className="mb-6 border-b border-slate-100 pb-4">
								<h2 className="text-xl font-bold text-slate-800">
									{calendar.name}
								</h2>
								{calendar.description && (
									<p className="mt-1 text-sm text-slate-500">
										{calendar.description}
									</p>
								)}
								<div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
									<span className="flex items-center gap-1">
										<Clock size={13} />
										{calendar.duration} min
									</span>
								</div>
							</div>

							{/* Form Fields */}
							<div className="space-y-4">
								<div>
									<label className="mb-1.5 block text-sm font-medium text-slate-700">
										Email <span className="text-[#D0003C]">*</span>
									</label>
									<div className="relative">
										<Mail
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
										/>
										<input
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-2 focus:ring-[#D0003C]/20"
											placeholder="votre@email.com"
											required
										/>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="mb-1.5 block text-sm font-medium text-slate-700">
											Prenom <span className="text-[#D0003C]">*</span>
										</label>
										<div className="relative">
											<User
												size={16}
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
											/>
											<input
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-2 focus:ring-[#D0003C]/20"
												placeholder="Votre prenom"
												required
											/>
										</div>
									</div>
									<div>
										<label className="mb-1.5 block text-sm font-medium text-slate-700">
											Nom <span className="text-[#D0003C]">*</span>
										</label>
										<div className="relative">
											<User
												size={16}
												className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
											/>
											<input
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-2 focus:ring-[#D0003C]/20"
												placeholder="Votre nom"
												required
											/>
										</div>
									</div>
								</div>

								<div>
									<label className="mb-1.5 block text-sm font-medium text-slate-700">
										Telephone
									</label>
									<div className="relative">
										<Phone
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
										/>
										<input
											type="tel"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-[#D0003C] focus:ring-2 focus:ring-[#D0003C]/20"
											placeholder="+33 6 12 34 56 78"
										/>
									</div>
								</div>
							</div>

							{/* Legal */}
							<p className="mt-5 text-[11px] text-slate-400">
								En reservant, vous acceptez que vos informations soient utilisees
								pour vous contacter dans le cadre de votre demande. Vos donnees
								sont traitees conformement a notre politique de confidentialite.
							</p>

							{/* Submit */}
							<button
								type="button"
								onClick={handleFormSubmit}
								className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#D0003C] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B00034]"
							>
								Continuer
								<ChevronRight size={16} />
							</button>
						</div>
					</div>

					{/* Calendar Preview (right, smaller) */}
					<div className="lg:col-span-2">
						<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<div className="flex items-center gap-2 text-sm font-medium text-slate-400">
								<Calendar size={16} />
								Selectionnez un creneau
							</div>
							<div className="relative mt-4">
								{/* Blurred overlay */}
								<div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-[2px]">
									<div className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-white shadow-lg">
										Remplissez le formulaire d'abord
									</div>
								</div>
								<MiniCalendarPreview calendar={calendar} />
							</div>
						</div>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="mt-6">
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
						{/* Back button */}
						<button
							type="button"
							onClick={() => {
								setStep(1);
								setSelectedDate(null);
								setSelectedSlot(null);
							}}
							className="mb-4 flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-700"
						>
							<ChevronLeft size={16} />
							Retour au formulaire
						</button>

						<h2 className="text-xl font-bold text-slate-800">
							Choisissez votre creneau
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							{calendar.name} — {calendar.duration} min
						</p>

						<div className="mt-6 grid gap-6 lg:grid-cols-5">
							{/* Calendar */}
							<div className="lg:col-span-3">
								<DatePicker
									calendar={calendar}
									selectedDate={selectedDate}
									onSelectDate={(d) => {
										setSelectedDate(d);
										setSelectedSlot(null);
									}}
								/>
							</div>

							{/* Time slots */}
							<div className="lg:col-span-2">
								{selectedDate ? (
									<TimeSlots
										calendarSlug={calendar.slug}
										date={selectedDate}
										selectedSlot={selectedSlot}
										onSelectSlot={setSelectedSlot}
										duration={calendar.duration}
									/>
								) : (
									<div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
										<div>
											<Calendar size={32} className="mx-auto text-slate-300" />
											<p className="mt-2 text-sm text-slate-400">
												Selectionnez un jour dans le calendrier
											</p>
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Confirm button */}
						{selectedSlot && (
							<div className="mt-6 border-t border-slate-100 pt-4">
								<div className="flex items-center justify-between">
									<div className="text-sm text-slate-600">
										<span className="font-medium">
											{new Intl.DateTimeFormat("fr-FR", {
												weekday: "long",
												day: "numeric",
												month: "long",
												year: "numeric",
											}).format(new Date(selectedSlot))}
										</span>
										{" a "}
										<span className="font-medium">
											{new Date(selectedSlot)
												.getHours()
												.toString()
												.padStart(2, "0")}
											:
											{new Date(selectedSlot)
												.getMinutes()
												.toString()
												.padStart(2, "0")}
										</span>
									</div>
									<button
										type="button"
										onClick={handleConfirmBooking}
										className="flex items-center gap-2 rounded-lg bg-[#D0003C] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#B00034]"
									>
										<Check size={16} />
										Confirmer le rendez-vous
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{step === 3 && bookingResult && (
				<div className="mt-6">
					<ConfirmationStep
						calendar={calendar}
						booking={bookingResult}
						prospectName={`${firstName} ${lastName}`}
						prospectEmail={email}
					/>
				</div>
			)}
		</div>
	);
}

// ============================================================
// STEP INDICATOR
// ============================================================

function StepIndicator({ currentStep }: { currentStep: number }) {
	const steps = [
		{ number: 1, label: "Remplir le formulaire" },
		{ number: 2, label: "Choisir un creneau" },
		{ number: 3, label: "Confirmation" },
	];

	return (
		<div className="flex items-center justify-center gap-2">
			{steps.map((s, i) => (
				<div key={s.number} className="flex items-center gap-2">
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
								currentStep === s.number
									? "bg-[#D0003C] text-white"
									: currentStep > s.number
										? "bg-emerald-500 text-white"
										: "bg-slate-200 text-slate-500",
							)}
						>
							{currentStep > s.number ? (
								<Check size={14} />
							) : (
								s.number
							)}
						</div>
						<span
							className={cn(
								"hidden text-sm font-medium sm:inline",
								currentStep === s.number
									? "text-slate-800"
									: currentStep > s.number
										? "text-emerald-600"
										: "text-slate-400",
							)}
						>
							{s.label}
						</span>
					</div>
					{i < steps.length - 1 && (
						<div
							className={cn(
								"mx-2 h-px w-8 sm:w-12",
								currentStep > s.number ? "bg-emerald-300" : "bg-slate-200",
							)}
						/>
					)}
				</div>
			))}
		</div>
	);
}

// ============================================================
// MINI CALENDAR PREVIEW (Step 1 blurred)
// ============================================================

function MiniCalendarPreview({ calendar }: { calendar: CalendarDoc }) {
	const now = new Date();
	const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
	// Adjust for Monday start (0=Mon ... 6=Sun)
	const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

	const monthName = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(now);

	return (
		<div>
			<div className="mb-3 text-center text-sm font-semibold capitalize text-slate-600">
				{monthName}
			</div>
			<div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
				{["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
					<div key={d} className="py-1">{d}</div>
				))}
			</div>
			<div className="grid grid-cols-7 gap-1">
				{Array.from({ length: startOffset }).map((_, i) => (
					<div key={`empty-${i}`} />
				))}
				{Array.from({ length: daysInMonth }, (_, i) => {
					const day = i + 1;
					const date = new Date(now.getFullYear(), now.getMonth(), day);
					const isAvailable =
						day >= now.getDate() &&
						calendar.availableDays.includes(date.getDay());
					return (
						<div
							key={day}
							className={cn(
								"flex h-8 items-center justify-center rounded-md text-xs",
								isAvailable
									? "font-medium text-slate-700"
									: "text-slate-300",
							)}
						>
							{day}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ============================================================
// DATE PICKER
// ============================================================

function DatePicker({
	calendar,
	selectedDate,
	onSelectDate,
}: {
	calendar: CalendarDoc;
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
}) {
	const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
	const [viewYear, setViewYear] = useState(() => new Date().getFullYear());

	const availableDays = useQuery(api.bookings.getAvailableDays, {
		calendarSlug: calendar.slug,
		month: viewMonth,
		year: viewYear,
	});

	const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
	const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
	const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

	const monthName = new Intl.DateTimeFormat("fr-FR", {
		month: "long",
		year: "numeric",
	}).format(new Date(viewYear, viewMonth));

	const goToPrevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear(viewYear - 1);
		} else {
			setViewMonth(viewMonth - 1);
		}
	};

	const goToNextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear(viewYear + 1);
		} else {
			setViewMonth(viewMonth + 1);
		}
	};

	// Prevent navigating to past months
	const now = new Date();
	const canGoPrev =
		viewYear > now.getFullYear() ||
		(viewYear === now.getFullYear() && viewMonth > now.getMonth());

	return (
		<div>
			{/* Month navigation */}
			<div className="mb-4 flex items-center justify-between">
				<button
					type="button"
					onClick={goToPrevMonth}
					disabled={!canGoPrev}
					className={cn(
						"rounded-lg p-2 transition-colors",
						canGoPrev
							? "text-slate-600 hover:bg-slate-100"
							: "cursor-not-allowed text-slate-300",
					)}
				>
					<ChevronLeft size={18} />
				</button>
				<h3 className="text-sm font-semibold capitalize text-slate-700">
					{monthName}
				</h3>
				<button
					type="button"
					onClick={goToNextMonth}
					className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
				>
					<ChevronRight size={18} />
				</button>
			</div>

			{/* Day headers */}
			<div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
				{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
					<div key={d} className="py-2">{d}</div>
				))}
			</div>

			{/* Day grid */}
			<div className="grid grid-cols-7 gap-1">
				{Array.from({ length: startOffset }).map((_, i) => (
					<div key={`empty-${i}`} />
				))}
				{Array.from({ length: daysInMonth }, (_, i) => {
					const day = i + 1;
					const isAvailable = availableDays?.includes(day) ?? false;
					const isSelected =
						selectedDate?.getDate() === day &&
						selectedDate?.getMonth() === viewMonth &&
						selectedDate?.getFullYear() === viewYear;

					return (
						<button
							key={day}
							type="button"
							disabled={!isAvailable}
							onClick={() => {
								onSelectDate(new Date(viewYear, viewMonth, day));
							}}
							className={cn(
								"flex h-10 items-center justify-center rounded-lg text-sm transition-all",
								isSelected
									? "bg-[#D0003C] font-bold text-white shadow-md"
									: isAvailable
										? "font-medium text-slate-700 hover:bg-[#D0003C]/10 hover:text-[#D0003C]"
										: "cursor-not-allowed text-slate-300",
							)}
						>
							{day}
						</button>
					);
				})}
			</div>
		</div>
	);
}

// ============================================================
// TIME SLOTS
// ============================================================

function TimeSlots({
	calendarSlug,
	date,
	selectedSlot,
	onSelectSlot,
	duration,
}: {
	calendarSlug: string;
	date: Date;
	selectedSlot: number | null;
	onSelectSlot: (slot: number) => void;
	duration: number;
}) {
	const slots = useQuery(api.bookings.getAvailableSlots, {
		calendarSlug,
		date: date.getTime(),
	});

	const dateLabel = new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
	}).format(date);

	if (slots === undefined) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 size={24} className="animate-spin text-[#D0003C]" />
			</div>
		);
	}

	return (
		<div>
			<div className="mb-3 text-sm font-medium capitalize text-slate-600">
				{dateLabel}
			</div>

			{slots.length === 0 ? (
				<div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
					<Clock size={24} className="mx-auto text-slate-300" />
					<p className="mt-2 text-sm text-slate-400">
						Aucun creneau disponible ce jour
					</p>
				</div>
			) : (
				<div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
					{slots.map((slot) => {
						const isSelected = selectedSlot === slot.time;
						const endTime = new Date(slot.time + duration * 60 * 1000);
						const endDisplay = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;

						return (
							<button
								key={slot.time}
								type="button"
								onClick={() => onSelectSlot(slot.time)}
								className={cn(
									"flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all",
									isSelected
										? "border-[#D0003C] bg-[#D0003C]/5 text-[#D0003C] shadow-sm"
										: "border-slate-200 text-slate-700 hover:border-[#D0003C]/40 hover:bg-slate-50",
								)}
							>
								<div className="flex items-center gap-2">
									<Clock
										size={14}
										className={isSelected ? "text-[#D0003C]" : "text-slate-400"}
									/>
									<span className="font-medium">{slot.display}</span>
									<span className="text-xs text-slate-400">
										— {endDisplay}
									</span>
								</div>
								{isSelected && (
									<Check size={16} className="text-[#D0003C]" />
								)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

// ============================================================
// CONFIRMATION STEP
// ============================================================

function ConfirmationStep({
	calendar,
	booking,
	prospectName,
	prospectEmail,
}: {
	calendar: CalendarDoc;
	booking: { startTime: number; endTime: number };
	prospectName: string;
	prospectEmail: string;
}) {
	const startDate = new Date(booking.startTime);
	const endDate = new Date(booking.endTime);

	const dateStr = new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(startDate);

	const startTimeStr = `${startDate.getHours().toString().padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;
	const endTimeStr = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
			<div className="mx-auto max-w-md text-center">
				{/* Success icon */}
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
					<CheckCircle2 size={36} className="text-emerald-500" />
				</div>

				<h2 className="mt-5 text-2xl font-bold text-slate-800">
					Votre rendez-vous est confirme !
				</h2>

				{calendar.confirmationMessage && (
					<p className="mt-2 text-sm text-slate-500">
						{calendar.confirmationMessage}
					</p>
				)}

				{/* Details card */}
				<div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5 text-left">
					<div className="space-y-3">
						<div className="flex items-start gap-3">
							<Calendar size={16} className="mt-0.5 text-[#D0003C]" />
							<div>
								<div className="text-sm font-medium capitalize text-slate-700">
									{dateStr}
								</div>
								<div className="text-xs text-slate-500">
									{startTimeStr} — {endTimeStr} ({calendar.duration} min)
								</div>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<User size={16} className="mt-0.5 text-[#D0003C]" />
							<div>
								<div className="text-sm font-medium text-slate-700">
									{prospectName}
								</div>
								<div className="text-xs text-slate-500">{prospectEmail}</div>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<Phone size={16} className="mt-0.5 text-[#D0003C]" />
							<div>
								<div className="text-sm font-medium text-slate-700">
									{calendar.name}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Email notice */}
				<div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
					<Mail size={14} />
					Un email de confirmation vous a ete envoye
				</div>
			</div>
		</div>
	);
}

// ============================================================
// LOADING
// ============================================================

function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center py-20">
			<div className="h-8 w-8 animate-spin rounded-full border-3 border-[#D0003C] border-t-transparent" />
		</div>
	);
}
