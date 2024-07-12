"use client";
// Wagmi
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "@/constants";

// UI Components
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@/components/ui/badge";
import Wallet from "./Wallet";
import { useState, useEffect } from "react";

const Header = ({ refreshTrigger }) => {
    const { address, isConnected } = useAccount();

    // State variable to trigger re-fetching the wallet balance
    // const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Fetch the owner of the contract
    const { data: owner, isPending: isPendingOwner } = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "owner",
    });

    // Fetch the TRB balance of the connected account
    const {
        data: trbBalance,
        refetch: refetchBalance,
        isPending: isPendingBalance,
    } = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "balanceOf",
        args: [address], // Pass the connected address as an argument
        watch: true, // Automatically refetch when the balance changes
    });

    useEffect(() => {
        if (isConnected) {
            refetchBalance();
        }
    }, [refreshTrigger, isConnected, refetchBalance]);

    // Function to get badge text
    const getBadgeText = () => {
        if (!isPendingOwner && owner === address) {
            return "Admin";
        }
        if (!isPendingOwner && owner !== address) {
            return "Connecté";
        }
    };

    return (
        <nav className="navbar flex justify-between p-8">
            <div>Logo Terrabond</div>
            <div className="flex items-center space-x-4">
                {isConnected ? (
                    <>
                        <Badge variant>{getBadgeText()}</Badge>
                        {!isPendingBalance && trbBalance && (
                            <span className="text-white">
                                {parseFloat(trbBalance.toString()) / 10 ** 18}{" "}
                                TRB
                            </span>
                        )}
                    </>
                ) : (
                    <Badge variant>Déconnecté</Badge>
                )}
            </div>
            <div>
                <ConnectButton />
            </div>
            {isConnected && (
                <Wallet address={address} refreshTrigger={refreshTrigger} />
            )}
        </nav>
    );
};

export default Header;
