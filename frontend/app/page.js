"use client";

import BuyTokens from "@/components/shared/BuyTokens";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import NotConnected from "@/components/shared/NotConnected";
import SellTokens from "@/components/shared/SellTokens";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
    const { isConnected } = useAccount();
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const handleTransactionSuccess = () => {
        setRefreshTrigger((prev) => !prev);
    };

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <Header refreshTrigger={refreshTrigger} />
                {isConnected ? (
                    <div className="w-full">
                        <BuyTokens
                            onTransactionSuccess={handleTransactionSuccess}
                        />
                        <SellTokens
                            onTransactionSuccess={handleTransactionSuccess}
                        />
                    </div>
                ) : (
                    <NotConnected />
                )}
                <Footer />
            </div>
        </>
    );
}
