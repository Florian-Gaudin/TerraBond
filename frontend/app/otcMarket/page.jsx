"use client";
import Header from "@/components/shared/Header";
import NotConnected from "@/components/shared/NotConnected";
import OTCmarket from "@/components/shared/OTCMarket";
import PolygonClipPath from "@/components/shared/PolygonClipPath";
import { useState } from "react";
import { useAccount } from "wagmi";

const OtcMarket = () => {
    const { isConnected } = useAccount();
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    const handleTransactionSuccess = () => {
        setRefreshTrigger((prev) => !prev);
    };

    return (
        <div className="bg-bg relative isolate bg-fixed bg-center bg-cover bg-no-repeat bg-home h-[100vh] w-full overflow-x-hidden">
            <PolygonClipPath />
            <Header refreshTrigger={refreshTrigger} />

            {isConnected ? (
                <div>
                    <OTCmarket
                        onTransactionSuccess={handleTransactionSuccess}
                    />
                </div>
            ) : (
                <NotConnected />
            )}
        </div>
    );
};

export default OtcMarket;
