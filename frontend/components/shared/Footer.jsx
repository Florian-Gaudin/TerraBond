"use client";

// Wagmi
import { useWatchContractEvent } from "wagmi";
import { contractAddress, contractAbi } from "@/constants";

// React
import { useState } from "react";

// UI components
import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Footer = () => {
    const [eventsValue, setEventsValue] = useState([]);

    useWatchContractEvent({
        address: contractAddress,
        abi: contractAbi,
        fromBlock: BigInt(0),
        onLogs(logs) {
            setEventsValue(logs);
        },
    });

    return (
        <div>
            <div className="p-10 m-10 rounded-md opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent shadow-sm">
                <div>Events :</div>
                {eventsValue && eventsValue.length > 0 ? (
                    <div className="w-full h-36 border overflow-y-scroll">
                        {eventsValue
                            .slice()
                            .reverse()
                            .map((event, index) => (
                                <Alert key={index}>
                                    <Terminal className="h-4 w-4 p-2" />
                                    <AlertTitle>{event.eventName}</AlertTitle>
                                    <AlertDescription>
                                        {event.address}
                                    </AlertDescription>
                                </Alert>
                            ))}
                    </div>
                ) : (
                    <div className="w-full h-10 border flex items-center justify-center">
                        Chargement...
                    </div>
                )}
            </div>
            <footer className="text-center w-full p-10 m-10 opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent ">
                All rights reserved &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default Footer;
