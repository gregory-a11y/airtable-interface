export interface PasswordValidation {
	isValid: boolean;
	errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
	const errors: string[] = [];

	if (password.length < 8) {
		errors.push("Minimum 8 caracteres");
	}
	if (!/[A-Z]/.test(password)) {
		errors.push("Au moins 1 lettre majuscule");
	}
	if (!/[a-z]/.test(password)) {
		errors.push("Au moins 1 lettre minuscule");
	}
	if (!/[0-9]/.test(password)) {
		errors.push("Au moins 1 chiffre");
	}
	if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push("Au moins 1 caractere special (!@#$%&*...)");
	}

	return { isValid: errors.length === 0, errors };
}

export function getPasswordStrength(password: string): {
	score: number;
	label: string;
	color: string;
} {
	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[a-z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

	if (score <= 2) return { score, label: "Faible", color: "bg-red-500" };
	if (score <= 4) return { score, label: "Moyen", color: "bg-amber-500" };
	return { score, label: "Fort", color: "bg-emerald-500" };
}
