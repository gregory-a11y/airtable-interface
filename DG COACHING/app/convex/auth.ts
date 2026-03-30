import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ============================================================
// Password hashing with Web Crypto (PBKDF2)
// ============================================================

async function hashPassword(password: string, salt: string): Promise<string> {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
		keyMaterial,
		256,
	);
	return Array.from(new Uint8Array(bits))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function generateSalt(): string {
	const arr = new Uint8Array(16);
	crypto.getRandomValues(arr);
	return Array.from(arr)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function generateSessionToken(): string {
	const arr = new Uint8Array(32);
	crypto.getRandomValues(arr);
	return Array.from(arr)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function generateTempPassword(): string {
	const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
	const lower = "abcdefghjkmnpqrstuvwxyz";
	const digits = "23456789";
	const special = "!@#$%&*";
	const all = upper + lower + digits + special;
	let pwd = "";
	pwd += upper[Math.floor(Math.random() * upper.length)];
	pwd += lower[Math.floor(Math.random() * lower.length)];
	pwd += digits[Math.floor(Math.random() * digits.length)];
	pwd += special[Math.floor(Math.random() * special.length)];
	for (let i = 0; i < 8; i++) {
		pwd += all[Math.floor(Math.random() * all.length)];
	}
	return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

// ============================================================
// Auth mutations
// ============================================================

export const signIn = mutation({
	args: { email: v.string(), password: v.string() },
	handler: async (ctx, { email, password }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
			.first();

		if (!user) throw new Error("Email ou mot de passe incorrect");
		if (user.status === "disabled") throw new Error("Compte desactive");
		if (!user.passwordSalt || !user.passwordHash) throw new Error("Email ou mot de passe incorrect");

		const hash = await hashPassword(password, user.passwordSalt);
		if (hash !== user.passwordHash) throw new Error("Email ou mot de passe incorrect");

		const token = generateSessionToken();
		const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 jours

		await ctx.db.patch(user._id, { sessionToken: token, sessionExpiry: expiry });

		return {
			token,
			user: {
				id: user._id,
				email: user.email,
				name: user.name,
				role: user.role,
				mustChangePassword: user.mustChangePassword,
			},
		};
	},
});

export const signOut = mutation({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_sessionToken", (q) => q.eq("sessionToken", token))
			.first();
		if (user) {
			await ctx.db.patch(user._id, { sessionToken: undefined, sessionExpiry: undefined });
		}
	},
});

export const getSession = query({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		if (!token) return null;
		const user = await ctx.db
			.query("users")
			.withIndex("by_sessionToken", (q) => q.eq("sessionToken", token))
			.first();
		if (!user) return null;
		if (user.sessionExpiry && user.sessionExpiry < Date.now()) return null;
		return user;
	},
});

export const changePassword = mutation({
	args: { token: v.string(), currentPassword: v.string(), newPassword: v.string() },
	handler: async (ctx, { token, currentPassword, newPassword }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_sessionToken", (q) => q.eq("sessionToken", token))
			.first();
		if (!user) throw new Error("Session invalide");
		if (!user.passwordSalt || !user.passwordHash) throw new Error("Session invalide");

		// Verify current password
		const currentHash = await hashPassword(currentPassword, user.passwordSalt);
		if (currentHash !== user.passwordHash) throw new Error("Mot de passe actuel incorrect");

		// Hash new password
		const newSalt = generateSalt();
		const newHash = await hashPassword(newPassword, newSalt);

		await ctx.db.patch(user._id, {
			passwordHash: newHash,
			passwordSalt: newSalt,
			mustChangePassword: false,
		});

		return { success: true };
	},
});

// ============================================================
// Create account (server-side, for invitations)
// ============================================================

export const createAccount = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.string(),
		role: v.union(v.literal("admin"), v.literal("sales"), v.literal("coach")),
		mustChangePassword: v.boolean(),
	},
	handler: async (ctx, { email, password, name, role, mustChangePassword }) => {
		// Check if email exists
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
			.first();
		if (existing) throw new Error("Email deja utilise");

		const salt = generateSalt();
		const hash = await hashPassword(password, salt);

		const userId = await ctx.db.insert("users", {
			email: email.toLowerCase(),
			name,
			passwordHash: hash,
			passwordSalt: salt,
			role,
			status: "active",
			mustChangePassword,
		});

		return userId;
	},
});

// ============================================================
// Invite + send email (action for Resend API call)
// ============================================================

export const inviteAndSendEmail = action({
	args: {
		email: v.string(),
		name: v.string(),
		role: v.union(v.literal("admin"), v.literal("sales"), v.literal("coach")),
		siteUrl: v.string(),
	},
	handler: async (ctx, { email, name, role, siteUrl }) => {
		const tempPassword = generateTempPassword();

		// Create the account
		await ctx.runMutation(api.auth.createAccount, {
			email,
			password: tempPassword,
			name,
			role,
			mustChangePassword: true,
		});

		// Send email via Resend
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: "Prime Coaching <noreply@send.galdencoaching.com>",
				to: [email],
				subject: "Bienvenue chez Prime Coaching",
				html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0A0A0F;font-family:'Inter','Helvetica Neue',Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0F;min-height:100vh">
<tr><td align="center" style="padding:48px 20px">

<!-- Red glow effect -->
<div style="width:300px;height:300px;background:radial-gradient(circle,rgba(208,0,60,0.12) 0%,transparent 70%);position:absolute;top:0;left:50%;transform:translateX(-50%);pointer-events:none"></div>

<!-- Main container -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

<!-- Logo -->
<tr><td align="center" style="padding-bottom:40px">
	<img src="${siteUrl}/logo-blanc.png" alt="Prime Coaching" width="48" height="48" style="display:block;margin-bottom:16px">
	<h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.5px">Prime Coaching</h1>
	<p style="color:rgba(255,255,255,0.4);font-size:13px;margin:6px 0 0;letter-spacing:0.5px">PLATEFORME INTERNE</p>
</td></tr>

<!-- Card -->
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1A1A19;border:1px solid rgba(255,255,255,0.06);border-radius:20px;overflow:hidden">

<!-- Card header with subtle red accent -->
<tr><td style="height:3px;background:linear-gradient(90deg,transparent,#D0003C,transparent)"></td></tr>

<!-- Card content -->
<tr><td style="padding:40px 36px">
	<h2 style="color:#F6F6F6;font-size:20px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px">Bienvenue ${name} !</h2>
	<p style="color:#8A8A8A;font-size:14px;line-height:1.7;margin:0 0 28px">
		Votre compte a ete cree sur la plateforme Prime Coaching.<br>Voici vos identifiants de connexion :
	</p>

	<!-- Credentials box -->
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.06);border-radius:14px;margin-bottom:28px">
	<tr><td style="padding:24px">
		<p style="color:#8A8A8A;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Email</p>
		<p style="color:#F6F6F6;font-size:15px;font-weight:600;margin:0 0 20px">${email}</p>
		<div style="height:1px;background:rgba(255,255,255,0.06);margin:0 0 20px"></div>
		<p style="color:#8A8A8A;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600">Mot de passe temporaire</p>
		<p style="color:#D0003C;font-size:22px;font-weight:700;margin:0;font-family:'SF Mono','Fira Code',monospace;letter-spacing:3px">${tempPassword}</p>
	</td></tr>
	</table>

	<p style="color:#8A8A8A;font-size:13px;line-height:1.6;margin:0 0 32px">
		Lors de votre premiere connexion, vous serez invite a choisir un nouveau mot de passe securise.
	</p>

	<!-- CTA Button -->
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
	<tr><td align="center">
		<a href="${siteUrl}/login" style="display:inline-block;background:#D0003C;color:#FFFFFF;padding:16px 48px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 4px 20px rgba(208,0,60,0.3)">
			Se connecter
		</a>
	</td></tr>
	</table>
</td></tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td align="center" style="padding-top:32px">
	<p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0">Prime Coaching &mdash; Plateforme interne</p>
	<p style="color:rgba(255,255,255,0.12);font-size:11px;margin:8px 0 0">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
			}),
		});

		if (!res.ok) {
			const err = await res.text();
			throw new Error(`Resend: ${err}`);
		}

		return { success: true, email, tempPassword };
	},
});
