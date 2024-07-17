"use client";

import BuyTokens from "@/components/shared/BuyTokens";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import NotConnected from "@/components/shared/NotConnected";
import PolygonClipPath from "@/components/shared/PolygonClipPath";
import "../styles/_homepageHeader.scss";
import SellTokens from "@/components/shared/SellTokens";
import { useState } from "react";
import { useAccount } from "wagmi";
import OTCMarket from "@/components/shared/OTCMarket";

export default function Home() {
    const { isConnected } = useAccount();
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const handleTransactionSuccess = () => {
        setRefreshTrigger((prev) => !prev);
    };

    return (
        <>
            <div className="bg-bg relative isolate pt-14 bg-fixed bg-center bg-cover bg-no-repeat bg-home w-full">
                <PolygonClipPath />
                <div className="flex flex-col min-h-screen w-full">
                    <Header refreshTrigger={refreshTrigger} />
                    {isConnected ? (
                        <div>
                            {/* <div className="w-full flex justify-center">
                                <BuyTokens
                                    onTransactionSuccess={
                                        handleTransactionSuccess
                                    }
                                />
                                <SellTokens
                                    onTransactionSuccess={
                                        handleTransactionSuccess
                                    }
                                />
                            </div>
                            <OTCMarket
                                onTransactionSuccess={handleTransactionSuccess}
                            /> */}
                        </div>
                    ) : (
                        <NotConnected />
                    )}
                    <Footer />
                </div>
            </div>
        </>
    );
}
