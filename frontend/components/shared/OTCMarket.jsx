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

    // useEffect(() => {
    //     if (ethPrice) {
    //         const ethPriceInUSD = Number(ethPrice) / 10 ** 8;
    //         setEthPriceInUSD(ethPriceInUSD);
    //     }
    // }, [ethPrice]);
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
            console.log("Offers data:", offersData);
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

    // Handle creating a new offer
    const { data: createOfferHash, writeContract: createOffer } =
        useWriteContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "createOffer",
        });

    // Handle accepting an offer
    const { data: acceptOfferHash, writeContract: acceptOffer } =
        useWriteContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "acceptOffer",
        });

    // Handle cancelling an offer
    const { data: cancelOfferHash, writeContract: cancelOffer } =
        useWriteContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: "cancelOffer",
        });

    // const {
    //     isLoading: isConfirming,
    //     isSuccess,
    //     error: errorConfirmation,
    // } = useWaitForTransactionReceipt({
    //     hash,
    // });

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
                    title: "Offer Created",
                    description: `Your offer to sell ${inputValue} TRB has been created.`,
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
                title: "Connect your wallet",
                description:
                    "You need to connect your wallet to create an offer",
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
                    title: "Offer Accepted",
                    description: `You have accepted the offer to buy ${amount} TRB.`,
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
                title: "Connect your wallet",
                description:
                    "You need to connect your wallet to accept an offer",
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
                    title: "Offer Cancelled",
                    description: `Your offer has been cancelled.`,
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
                title: "Connect your wallet",
                description:
                    "You need to connect your wallet to cancel an offer",
                status: "warning",
                duration: 5000,
            });
        }
    };

    return (
        <div className="w-1/3 mt-8 flex flex-col space-y-10">
            <div className="text-lg text-center">OTC Market</div>

            <div className="flex flex-col items-center p-8 bg-gray-800 rounded-lg shadow-2xl transition-transform hover:scale-105">
                <Input
                    className="mr-2"
                    type="text"
                    placeholder="Amount in TRB"
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <Button
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 rounded-full hover:from-blue-600 hover:to-purple-600 transition duration-300"
                    onClick={handleCreateOffer}
                >
                    Create Offer
                </Button>
            </div>

            <div className="flex flex-col w-full">
                {offers.map((offer) => {
                    const amount = offer.amount.toString();

                    return (
                        <Alert key={offer.offerId} className="mb-4 bg-gray-200">
                            <RocketIcon className="h-4 w-4" />
                            <AlertTitle>
                                Offre ID # {offer.offerId.toString()}
                            </AlertTitle>
                            <AlertDescription className="flex flex-col">
                                <span>Montant de l'offre : {amount} TRB</span>{" "}
                                <div>
                                    Equivalent ETH:{" "}
                                    {calculateEthEquivalent(amount)} ETH
                                </div>
                                <span>Vendeur: {offer.seller.toString()}</span>
                                <div className="flex justify-center">
                                    <Button
                                        className="ml-4 bg-green-500 text-white"
                                        onClick={() =>
                                            handleAcceptOffer(
                                                offer.offerId,
                                                offer.amount
                                            )
                                        }
                                    >
                                        Accept
                                    </Button>
                                    {offer.seller === address && (
                                        <Button
                                            className="ml-2 bg-red-500 text-white"
                                            onClick={() =>
                                                handleCancelOffer(offer.offerId)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </AlertDescription>
                        </Alert>
                    );
                })}
            </div>
        </div>
    );
}

export default OTCmarket;
