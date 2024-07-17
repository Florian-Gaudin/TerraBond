"use client";

import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import NotConnected from "@/components/shared/NotConnected";
import PolygonClipPath from "@/components/shared/PolygonClipPath";
import "../styles/_homepageHeader.scss";
import "./globals.css";
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
            <div className="bg-bg relative isolate pt-14 bg-fixed bg-center bg-cover bg-no-repeat bg-home w-full">
                <PolygonClipPath />
                <div className="flex flex-col min-h-screen w-full">
                    <Header refreshTrigger={refreshTrigger} />
                    <div className="text-center fade-in">
                        <h1 className="text-4xl md:text-8xl uppercase font-title font-extrabold bg-move bg-gradient-to-r from-purple via-red to-purple text-transparent bg-clip-text">
                            TerraBond
                        </h1>

                        <p className="mt-6 text-2xl leading-8 uppercase font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                            L'investissement immobilier réinventé par la
                            blockchain
                        </p>
                    </div>
                    {isConnected ? (
                        <div>
                            <div className="mt-12 pt-12 flex items-center justify-center gap-x-16 flex-col md:flex-row">
                                <a
                                    href="/buy"
                                    className="px-5 py-4 my-4 md:px-12 md:py-5 min-w-[250px] md:min-w-[300px] opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent border-2 border-white shadow-sm hover:bg-white hover:text-bg duration-500"
                                >
                                    Acheter des TRB
                                </a>
                                <a
                                    href="/sell"
                                    className="px-5 py-4 my-4 md:px-12 md:py-5 min-w-[250px] md:min-w-[300px] opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent border-2 border-white shadow-sm hover:bg-white hover:text-bg duration-500"
                                >
                                    Vendre des TRB
                                </a>
                                <a
                                    href="/otcMarket"
                                    className="px-5 py-4 my-4 md:px-12 md:py-5 min-w-[250px] md:min-w-[300px] opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent border-2 border-white shadow-sm hover:bg-white hover:text-bg duration-500"
                                >
                                    Accéder au marché de gré à gré
                                </a>
                            </div>
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
