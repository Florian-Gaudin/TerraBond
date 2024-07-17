"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { RocketIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
// Wagmi
import {
    useAccount,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt,
} from "wagmi";
import { contractAbi, contractAddress } from "@/constants";
// import Wallet from "./Wallet";

function SellTokens({ onTransactionSuccess }) {
    const { isConnected } = useAccount();
    const { toast } = useToast();

    const [ethPriceInUSD, setEthPriceInUSD] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [isOverLimit, setIsOverLimit] = useState(false);

    // Input token amount value
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (parseFloat(value) > 50) {
            setIsOverLimit(true);
        } else {
            setIsOverLimit(false);
        }
    };

    // Chainlink hook for ETH/USD price
    const { data: ethPrice } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getChainlinkDataFeedLatestAnswer",
    });

    // Handle conversion of token amount to ETH
    useEffect(() => {
        if (ethPrice) {
            const ethPriceInUSD = Number(ethPrice) / 10 ** 8;
            setEthPriceInUSD(ethPriceInUSD);
        }
    }, [ethPrice]);

    // Handle Wagmi hooks
    const {
        data: hash,
        error,
        isPending: setIsPending,
        writeContract,
    } = useWriteContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "burn",
    });

    const {
        isLoading: isConfirming,
        isSuccess,
        error: errorConfirmation,
    } = useWaitForTransactionReceipt({
        hash,
    });

    const renderBurnButton = () => (
        <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl transition-transform hover:scale-105 bg-white">
            <div className="mt-6 text-2xl text-center leading-8 uppercase font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                Je vends mes jetons TRB
            </div>
            <Input
                className="m-4 text-black placeholder-gray-500 placeholder-opacity-100"
                type="text"
                placeholder="ex : 10 TRB"
                value={inputValue}
                onChange={handleInputChange}
            />
            {isOverLimit && (
                <div className="text-red-500">
                    Attention : la vente directe de TRB est limitée à 50 token
                    par jour. Ce montant nécessite le passage par la vente de
                    gré à gré.
                </div>
            )}
            <Button
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-6 rounded-full hover:from-red-600 hover:to-orange-600 transition duration-300"
                disabled={setIsPending || isOverLimit}
                onClick={() => handleSellTokens(inputValue)}
                variant="outline"
            >
                {setIsPending ? (
                    "Envoi en cours"
                ) : inputValue ? (
                    <h2 className="text-xl font-bold text-center leading-8 uppercase bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                        Vendre {inputValue} TRB
                        <span className="text-xl font-bold text-center leading-8 uppercase bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                            (~
                            {ethPriceInUSD &&
                                ((inputValue * 100) / ethPriceInUSD).toFixed(
                                    4
                                )}{" "}
                            ETH)
                        </span>
                    </h2>
                ) : (
                    <span className="text-xl font-bold text-center leading-8 uppercase bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                        Investir
                    </span>
                )}
            </Button>
        </div>
    );

    const handleSellTokens = async (amountInTokens) => {
        if (isConnected) {
            try {
                writeContract({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: "burn",
                    args: [amountInTokens],
                });
                toast({
                    title: "Transaction en cours",
                    description: `Vente de ${amountInTokens} TRB en cours`,
                    status: "info",
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Echec de la transaction",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
            }
        } else {
            toast({
                title: "Connectez votre portefeuille",
                description:
                    "Vous devez connecter votre portefeuille pour vendre des tokens",
                status: "warning",
                duration: 5000,
            });
        }
    };

    // Refetch TRB balance and display toast if transaction is successful
    useEffect(() => {
        if (isSuccess) {
            onTransactionSuccess();
            toast({
                title: "Tokens vendus avec succès",
                description: "Transaction confirmée",
                status: "success",
                duration: 5000,
            });
        }
    }, [isSuccess, toast]);

    return (
        <div className="flex justify-center m-10 p-10 rounded-md opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent shadow-sm">
            <div className="w-1/3 mt-8 flex flex-col space-y-10">
                {renderBurnButton()}

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
            </div>
        </div>
    );
}

export default SellTokens;
