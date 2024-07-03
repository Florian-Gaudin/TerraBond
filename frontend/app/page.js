"use client";

import BuyTokens from "@/components/shared/BuyTokens";
import NotConnected from "@/components/shared/NotConnected";
import { useAccount } from "wagmi";

export default function Home() {
    const { isConnected } = useAccount();

    return <>{isConnected ? <BuyTokens /> : <NotConnected />}</>;
}
