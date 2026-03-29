import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ConvexProvider } from "@/components/convex-provider";
import "../globals.css";

export const metadata: Metadata = {
	title: "Reserver un appel — Prime Coaching",
	description: "Reservez votre rendez-vous avec un conseiller Prime Coaching",
	icons: { icon: "/favicon.png" },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<body className="min-h-screen bg-white antialiased">
				<ConvexProvider>
					{children}
					<Toaster position="top-center" richColors />
				</ConvexProvider>
			</body>
		</html>
	);
}
