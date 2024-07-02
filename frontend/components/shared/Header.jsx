"use client";
import Link from "next/link";
// Wagmi
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "@/constants";

// UI Components
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Badge } from "@/components/ui/badge";

const Header = () => {
    const { address, isConnected } = useAccount();

    const { data: owner, isPending: isPendingOwner } = useReadContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "owner",
    });

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
            <Link href="/">Home</Link>
            <div>
                {isConnected ? (
                    <Badge variant>{getBadgeText()}</Badge>
                ) : (
                    <Badge variant>Déconnecté</Badge>
                )}
            </div>
            <div>
                <ConnectButton />
            </div>
        </nav>
    );
};

export default Header;
