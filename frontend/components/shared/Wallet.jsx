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
        <a href="/">
            <div className="rounded-md px-5 py-4 my-4 md:px-12 md:py-5 min-w-[250px] md:min-w-[300px] opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent border-2 border-white shadow-sm hover:bg-white hover:text-bg duration-500">
                <span>Mon Portefeuille : </span>
                <span>{balance !== null ? balance + " TRB" : "0 TRB"}</span>
            </div>{" "}
        </a>
    );
};

export default Wallet;
