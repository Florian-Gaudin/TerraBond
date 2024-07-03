import React, { useState } from "react";
import { ethers } from "ethers";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { RocketIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// Wagmi
import {
    useAccount,
    useSigner,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import { contractAbi, contractAddress } from "@/constants";
import { parseAbiItem } from "viem";
import { publicClient } from "@/utils/client";

function BuyTokens() {
    const { address, isConnected } = useAccount();

    const [inputValue, setInputValue] = useState(null);
    const [events, setEvents] = useState([]);

    const { toast } = useToast();

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const {
        data: hash,
        error,
        isPending: setIsPending,
        writeContract,
    } = useWriteContract({});

    const handleBuyTokens = async () => {
        if (isConnected) {
            try {
                writeContract({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: "buyTokens",
                    args: [number],
                });
                alert("Tokens achetés avec succès");
            } catch (error) {
                console.error(error);
                alert("Echec de la transaction");
            }
        } else {
            alert("Connectez votre portefeuille");
        }
    };

    const {
        isLoading: isConfirming,
        isSuccess,
        error: errorConfirmation,
    } = useWaitForTransactionReceipt({
        hash,
    });

    return (
        <div className="w-1/3 mt-8 flex flex-col space-y-10">
            <div className="text-lg text-center">J'investis en euros </div>
            <Input
                className="mr-2"
                type="text"
                placeholder="ex : 1000 €"
                value={inputValue}
                onChange={handleInputChange}
            />
            <Button
                disabled={setIsPending}
                onClick={handleBuyTokens}
                variant="outline"
            >
                {setIsPending ? "Envoi en cours" : "Investir"}
            </Button>
            <div className="flex flex-col w-full">
                {hash && (
                    <Alert className="mb-4 bg-lime-200">
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            Transaction Hash : {hash}
                        </AlertDescription>
                    </Alert>
                )}
                {isConfirming && (
                    <Alert className="mb-4 bg-amber-200">
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            En attente de confirmation ...
                        </AlertDescription>
                    </Alert>
                )}
                {isSuccess && (
                    <Alert className="mb-4 bg-lime-200">
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>Information</AlertTitle>
                        <AlertDescription>
                            Transaction confirmée
                        </AlertDescription>
                    </Alert>
                )}
                {errorConfirmation && (
                    <Alert className="mb-4 bg-red-400">
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {errorConfirmation.shortMessage ||
                                errorConfirmation.message}
                        </AlertDescription>
                    </Alert>
                )}
                {error && (
                    <Alert className="mb-4 bg-red-400">
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>
                            {error.shortMessage || error.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="flex flex-col w-full">Events</div>
        </div>
    );
}

export default BuyTokens;
