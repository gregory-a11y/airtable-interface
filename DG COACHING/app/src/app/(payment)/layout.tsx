import type { Metadata } from "next";
import { ConvexProvider } from "@/components/convex-provider";
import "../globals.css";

export const metadata: Metadata = {
	title: "Paiement — Prime Coaching",
	description: "Page de paiement securisee Prime Coaching",
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
	return children;
}
