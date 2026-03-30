import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ConvexProvider } from "@/components/convex-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: "Prime Coaching — ERP",
	description: "Gestion interne Prime Coaching",
	icons: { icon: "/favicon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr" suppressHydrationWarning className="transition-colors duration-300">
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})();`,
					}}
				/>
			</head>
			<body className="antialiased">
				<ConvexProvider>
					{children}
					<Toaster position="top-right" richColors />
				</ConvexProvider>
			</body>
		</html>
	);
}
