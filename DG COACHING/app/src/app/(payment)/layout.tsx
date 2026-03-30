import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ConvexProvider } from "@/components/convex-provider";
import "../globals.css";

export const metadata: Metadata = {
	title: "Paiement — Prime Coaching",
	description: "Page de paiement securisee Prime Coaching",
	icons: { icon: "/favicon.png" },
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<body className="min-h-screen bg-background antialiased">
				<ConvexProvider>
					{children}
					<Toaster position="top-center" richColors />
				</ConvexProvider>
			</body>
		</html>
	);
}
