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
import { parseEther } from "viem";

function OTCmarket({ onTransactionSuccess }) {
    const { address, isConnected } = useAccount();
    const { toast } = useToast();

    const [offers, setOffers] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [ethPriceInUSD, setEthPriceInUSD] = useState(null);

    // Input amount in TRB
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    // Chainlink hook for ETH/USD price
    const { data: ethPrice } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getChainlinkDataFeedLatestAnswer",
    });

    useEffect(() => {
        if (ethPrice) {
            const ethPriceInUSD = parseFloat(ethPrice) / 10 ** 8;
            setEthPriceInUSD(ethPriceInUSD);
        }
    }, [ethPrice]);

    // Fetch all offers
    const { data: offersData } = useReadContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "getAllOffers",
    });

    useEffect(() => {
        if (offersData && offersData.length > 0) {
            // Filtrer les offres invalides (montant à 0 ou adresse nulle)
            const filteredOffers = offersData.filter(
                (offer) =>
                    offer.amount > 0 &&
                    offer.seller !==
                        "0x0000000000000000000000000000000000000000"
            );
            setOffers(filteredOffers);
        }
    }, [offersData]);

    const calculateEthEquivalent = (trbAmount) => {
        if (ethPriceInUSD) {
            const dollarAmount = parseFloat(trbAmount) * 100; // Convertir TRB en dollar
            const ethEquivalent = dollarAmount / ethPriceInUSD; // Obtenir le montant en ETH
            return ethEquivalent.toFixed(4);
        }
        return "N/A";
    };

    const {
        data: createOfferHash,
        error: createOfferError,
        isPending: isCreateOfferPending,
        writeContract: createOffer,
    } = useWriteContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "createOffer",
    });

    const {
        isLoading: isConfirmingCreateOffer,
        isSuccessCreateOffer,
        error: errorConfirmationCreateOffer,
    } = useWaitForTransactionReceipt({
        createOfferHash,
    });

    const {
        data: acceptOfferHash,
        error: acceptOfferError,
        isPending: isAcceptOfferPending,
        writeContract: acceptOffer,
    } = useWriteContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "acceptOffer",
    });

    const {
        data: cancelOfferHash,
        error: cancelOfferError,
        isPending: isCancelOfferPending,
        writeContract: cancelOffer,
    } = useWriteContract({
        address: contractAddress,
        abi: contractAbi,
        functionName: "cancelOffer",
    });

    const {
        isLoading: isConfirming,
        isSuccessAcceptOffer,
        error: errorConfirmation,
    } = useWaitForTransactionReceipt({
        acceptOfferHash,
    });

    const handleCreateOffer = () => {
        if (isConnected) {
            try {
                createOffer({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: "createOffer",
                    args: [parseInt(inputValue)],
                });
                toast({
                    title: "Envoi de l'offre en cours",
                    description: `Veuillez valider la transaction dans votre portefeuille pour confirmer la mise en vente de ${inputValue} TRB.`,
                    status: "success",
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Failed to create offer",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
            }
        } else {
            toast({
                title: "Connectez votre portefeuille",
                description:
                    "Vous devez vous connecter à votre portefeuille pour créer une offre",
                status: "warning",
                duration: 5000,
            });
        }
    };

    const handleAcceptOffer = (offerId, amount) => {
        if (isConnected) {
            try {
                let price;
                if (ethPriceInUSD) {
                    const amountNumber = parseFloat(amount);
                    const ethPriceInUSDNumber = parseFloat(ethPriceInUSD);
                    if (isNaN(amountNumber) || isNaN(ethPriceInUSDNumber)) {
                        console.error(
                            "Amount or ethPriceInUSD is not a valid number"
                        );
                        return;
                    }
                    const totalPriceInUSD = amountNumber * 100;
                    const priceInEth = totalPriceInUSD / ethPriceInUSDNumber;
                    const priceInEthString = priceInEth.toString();
                    price = parseEther(priceInEthString);
                }
                acceptOffer({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: "acceptOffer",
                    args: [offerId],
                    value: price,
                });
                toast({
                    title: "Acceptation de l'offre en cours",
                    description: `Veuillez valider la transaction dans votre portefeuille pour confirmer l'offre et acheter ${amount} TRB.`,
                    status: "success",
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Failed to accept offer",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
            }
        } else {
            toast({
                title: "Connectez votre portefeuille",
                description:
                    "Vous devez vous connecter à votre portefeuille pour créer une offre",
                status: "warning",
                duration: 5000,
            });
        }
    };

    const handleCancelOffer = (offerId) => {
        if (isConnected) {
            try {
                cancelOffer({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName: "cancelOffer",
                    args: [offerId],
                });
                toast({
                    title: "Annulation de l'offre en cours",
                    description: `Veuillez valider la transaction dans votre portefeuille pour confirmer l'annulation de votre offre.`,
                    status: "success",
                    duration: 5000,
                });
            } catch (error) {
                console.error(error);
                toast({
                    title: "Failed to cancel offer",
                    description: error.message,
                    status: "error",
                    duration: 5000,
                });
            }
        } else {
            toast({
                title: "Connectez votre portefeuille",
                description:
                    "Vous devez vous connecter à votre portefeuille pour créer une offre",
                status: "warning",
                duration: 5000,
            });
        }
    };

    return (
        <div className="flex justify-center m-10 p-10 rounded-md opacity-60 md:opacity-100 text-sm md:text-lg uppercase font-semibold text-bg md:text-white bg-white md:bg-transparent shadow-sm ">
            <div className="w-1/3 mt-8 flex flex-col space-y-10">
                <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl transition-transform hover:scale-105 bg-white">
                    <div className="mt-6 text-2xl text-center leading-8 uppercase font-extrabold bg-gradient-to-r from-purple to-red text-transparent bg-clip-text">
                        OTC Market
                    </div>
                    <Input
                        className="m-4 text-black placeholder-gray-500 placeholder-opacity-100"
                        type="text"
                        placeholder="Montant en TRB"
                        value={inputValue}
                        onChange={handleInputChange}
                    />
                    <Button
                        className="text-xl font-bold text-center leading-8 uppercase bg-gradient-to-r from-purple to-red text-transparent bg-clip-text"
                        onClick={handleCreateOffer}
                    >
                        Créer une offre
                    </Button>
                </div>

                <div className="flex flex-col w-full">
                    {offers.map((offer) => {
                        const amount = offer.amount.toString();

                        return (
                            <Alert
                                key={offer.offerId}
                                className="mb-4 bg-gray-200"
                            >
                                <RocketIcon className="h-4 w-4" />
                                <AlertTitle>
                                    Offre ID # {offer.offerId.toString()}
                                </AlertTitle>
                                <AlertDescription className="flex flex-col">
                                    <span>
                                        Montant de l'offre : {amount} TRB
                                    </span>{" "}
                                    <div>
                                        Equivalent ETH:{" "}
                                        {calculateEthEquivalent(amount)} ETH
                                    </div>
                                    <span>
                                        Vendeur: {offer.seller.toString()}
                                    </span>
                                    <div className="flex justify-center">
                                        {offer.seller != address && (
                                            <Button
                                                className="ml-4 bg-green-500 text-white"
                                                onClick={() =>
                                                    handleAcceptOffer(
                                                        offer.offerId,
                                                        offer.amount
                                                    )
                                                }
                                            >
                                                Accepter l'offre et acheter{" "}
                                                {offer.amount} TRB
                                            </Button>
                                        )}
                                        {offer.seller === address && (
                                            <Button
                                                className="ml-2 bg-red-500 text-white"
                                                onClick={() =>
                                                    handleCancelOffer(
                                                        offer.offerId
                                                    )
                                                }
                                            >
                                                Annuler mon offre
                                            </Button>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default OTCmarket;
