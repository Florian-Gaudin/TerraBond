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
import Wallet from "./Wallet";

function SellTokens() {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    const [ethPriceInUSD, setEthPriceInUSD] = useState(null);
    const [inputValue, setInputValue] = useState("");

    // Trigger refetch wallet balance
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    // Input token amount value
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
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
        <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl transition-transform hover:scale-105">
            <Input
                className="mr-2"
                type="text"
                placeholder="ex : 100 TRB"
                value={inputValue}
                onChange={handleInputChange}
            />

            <Button
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-6 rounded-full hover:from-red-600 hover:to-orange-600 transition duration-300"
                disabled={setIsPending}
                onClick={() => handleSellTokens(inputValue)}
                variant="outline"
            >
                {setIsPending ? (
                    "Envoi en cours"
                ) : inputValue ? (
                    <h2 className="text-3xl font-bold text-white text-center">
                        Vendre {inputValue} TRB
                        <span className="text-sm text-gray-400">
                            (~
                            {ethPriceInUSD &&
                                ((inputValue * 100) / ethPriceInUSD).toFixed(
                                    4
                                )}{" "}
                            ETH)
                        </span>
                    </h2>
                ) : (
                    "Vendre"
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
                    // account: address,
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
            setRefreshTrigger((prev) => !prev);
            toast({
                title: "Tokens vendus avec succès",
                description: "Transaction confirmée",
                status: "success",
                duration: 5000,
            });
        }
    }, [isSuccess, toast]);

    return (
        <div className="w-1/3 mt-8 flex flex-col space-y-10">
            <Wallet address={address} refreshTrigger={refreshTrigger} />
            <div className="text-lg text-center">Je vends mes tokens</div>
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
    );
}

export default SellTokens;
