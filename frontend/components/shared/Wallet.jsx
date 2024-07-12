import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
// Wagmi
import { useReadContract } from "wagmi";
import { contractAbi, contractAddress } from "@/constants";

const Wallet = ({ address, refreshTrigger }) => {
    const [balance, setBalance] = useState(null);

    const { data: tokenBalance, refetch: refetchTokenBalance } =
        useReadContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "balanceOf",
            args: [address],
        });

    useEffect(() => {
        if (tokenBalance) {
            const balanceInTRB = ethers.utils.formatUnits(tokenBalance, 18);
            setBalance(balanceInTRB);
        }
    }, [tokenBalance]);

    useEffect(() => {
        refetchTokenBalance();
    }, [refreshTrigger, refetchTokenBalance]);

    return (
        <div className="w-1/3 mt-8 flex flex-col space-y-10">
            <span>Mon Portefeuille : </span>
            <span>{balance !== null ? balance + " TRB" : "0 TRB"}</span>
        </div>
    );
};

export default Wallet;
