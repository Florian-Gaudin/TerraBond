"use client";

import BuyTokens from "@/components/shared/BuyTokens";
import NotConnected from "@/components/shared/NotConnected";
import SellTokens from "@/components/shared/SellTokens";
import { useAccount } from "wagmi";

export default function Home() {
    const { isConnected } = useAccount();

    return (
        <>
            {isConnected ? (
                <div className="w-full">
                    <BuyTokens />
                    <SellTokens />
                </div>
            ) : (
                <NotConnected />
            )}
        </>
    );
}
