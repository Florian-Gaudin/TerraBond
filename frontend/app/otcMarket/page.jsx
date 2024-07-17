"use client";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import NotConnected from "@/components/shared/NotConnected";
import OTCmarket from "@/components/shared/OTCMarket";
import PolygonClipPath from "@/components/shared/PolygonClipPath";
import "../../styles/_homepageHeader.scss";
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
            <div className="text-center fade-in">
                <h1 className="text-4xl md:text-8xl uppercase font-title font-extrabold bg-move bg-gradient-to-r from-purple via-red to-purple text-transparent bg-clip-text">
                    TerraBond
                </h1>

                <p className="mt-6 text-2xl leading-8 uppercase font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                    L'investissement immobilier réinventé par la blockchain
                </p>
            </div>
            {isConnected ? (
                <div>
                    <OTCmarket
                        onTransactionSuccess={handleTransactionSuccess}
                    />
                </div>
            ) : (
                <NotConnected />
            )}
            <Footer />
        </div>
    );
};

export default OtcMarket;
