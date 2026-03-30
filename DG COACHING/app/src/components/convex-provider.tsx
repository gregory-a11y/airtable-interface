"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider as BaseConvexProvider } from "convex/react";
import type { ReactNode } from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const TOKEN_KEY = "gc_session";

interface AuthContextType {
	user: any | null | undefined;
	token: string | null;
	signIn: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
	changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
	isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
	user: undefined,
	token: null,
	signIn: async () => {},
	signOut: async () => {},
	changePassword: async () => {},
	isLoading: true,
});

export function useAuth() {
	return useContext(AuthContext);
}

function AuthProvider({ children }: { children: ReactNode }) {
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem(TOKEN_KEY);
		setToken(stored);
		setIsLoading(false);
	}, []);

	const user = useQuery(api.auth.getSession, token ? { token } : "skip");
	const signInMutation = useMutation(api.auth.signIn);
	const signOutMutation = useMutation(api.auth.signOut);
	const changePasswordMutation = useMutation(api.auth.changePassword);

	const signIn = useCallback(
		async (email: string, password: string) => {
			const result = await signInMutation({ email, password });
			localStorage.setItem(TOKEN_KEY, result.token);
			setToken(result.token);
			return result;
		},
		[signInMutation],
	);

	const signOut = useCallback(async () => {
		if (token) {
			try {
				await signOutMutation({ token });
			} catch {
				// ignore
			}
		}
		localStorage.removeItem(TOKEN_KEY);
		setToken(null);
	}, [token, signOutMutation]);

	const changePassword = useCallback(
		async (currentPassword: string, newPassword: string) => {
			if (!token) throw new Error("Non connecte");
			await changePasswordMutation({ token, currentPassword, newPassword });
		},
		[token, changePasswordMutation],
	);

	// If session expired, clear token
	useEffect(() => {
		if (user === null && token) {
			localStorage.removeItem(TOKEN_KEY);
			setToken(null);
		}
	}, [user, token]);

	return (
		<AuthContext.Provider value={{ user, token, signIn, signOut, changePassword, isLoading }}>
			{children}
		</AuthContext.Provider>
	);
}

export function ConvexProvider({ children }: { children: ReactNode }) {
	return (
		<BaseConvexProvider client={convex}>
			<AuthProvider>{children}</AuthProvider>
		</BaseConvexProvider>
	);
}
