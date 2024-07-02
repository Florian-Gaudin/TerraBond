import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import Layout from "@/components/shared/Layout";
import { WagmiProvider } from "wagmi";
import RainbowKitAndWagmiProvider from "./RainbowKitAndWagmiProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
    subsets: ["latin"],
    variable: "--font-sans",
});

const queryClient = new QueryClient();

export const metadata = {
    title: "Terrabond Project",
    description: "TerraBond DApp",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <head />
            <body
                className={cn(
                    "min-h-screen bg-background font-sans antialiased",
                    fontSans.variable
                )}
            >
                <RainbowKitAndWagmiProvider>
                    <Layout>{children}</Layout>
                </RainbowKitAndWagmiProvider>
            </body>
        </html>
    );
}
