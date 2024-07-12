"use client";
// Wagmi
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "@/constants";

// UI Components
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@/components/ui/badge";
import Wallet from "./Wallet";
import { useEffect } from "react";

const Header = ({ refreshTrigger }) => {
    const { address, isConnected } = useAccount();

    // Fetch the owner of the contract
    const { data: owner, isPending: isPendingOwner } = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "owner",
    });

    // Fetch the TRB balance of the connected account
    const { refetch: refetchBalance } = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "balanceOf",
        args: [address],
        watch: true,
    });

    //Trigger the TRB balance refetch
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
                    <Badge variant>{getBadgeText()}</Badge>
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
