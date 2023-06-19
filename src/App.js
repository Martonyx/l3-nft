import React, { useState, useEffect } from "react";

import { ethers } from "ethers";
import { L3_CONTRACT_ADDRESS, L3_CONTRACT_ABI } from "./constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);
  const [isLoadingD, setIsLoadingD] = useState(false);
  const [signerAddress, setSignerAddress] = useState("");
  const [isMumbaiNetwork, setIsMumbaiNetwork] = useState(false);
  const [mintSuccess, setMntSuccess] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  const isInputEmpty = depositAmount === "";

  useEffect(() => {
    // Check if the user has an Ethereum-enabled browser
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const getSignerAddress = async () => {
        const network = await provider.getNetwork();
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setSignerAddress(address);
        if (network.chainId === 80001) {
          setIsMumbaiNetwork(true);
        } else {
          window.alert("change to shardeum network");
        }
      };

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          setWalletConnected(false);
        }
      };

      // Subscribe to the accountsChanged event
      window.ethereum.on("accountsChanged", handleAccountsChanged);

      // Check if the wallet is already connected
      provider.listAccounts().then(async (accounts) => {
        if (accounts.length > 0) {
          setWalletConnected(true);
          getSignerAddress();
        }
      });
    }
  }, []);

  const getSignerAddress = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await provider.getNetwork();
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setSignerAddress(address);
    if (network.chainId === 80001) {
      setIsMumbaiNetwork(true);
    } else {
      window.alert("change to Mumbai network");
    }
  };

  const connectWallet = async () => {
    try {
      setIsLoadingB(true);
      await window.ethereum.enable();
      setWalletConnected(true);
      await getSignerAddress();
      setIsLoadingB(false);
    } catch (error) {
      console.log(error);
    }
  };

  const mintNFT = async () => {
    try {
      setIsLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const L3Contract = new ethers.Contract(
        L3_CONTRACT_ADDRESS,
        L3_CONTRACT_ABI,
        signer
      );

      // const _depositAmount = depositAmount.toString();
      // const etherValue = ethers.utils.formatUnits(_depositAmount, "ether");

      // console.log(etherValue);
      const transaction = await L3Contract.mintNFT({
        value: ethers.utils.parseEther(depositAmount),
      });
      await transaction.wait();
      setMntSuccess(true);
      setMintError(null);
    } catch (error) {
      console.error(error);
      setMntSuccess(false);
      setMintError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawTokens = async () => {
    try {
      setIsLoadingD(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const L3Contract = new ethers.Contract(
        L3_CONTRACT_ADDRESS,
        L3_CONTRACT_ABI,
        signer
      );
      const tx = await L3Contract.withdraw();
      await tx.wait();
      setMntSuccess(true);
      setMintError(null);
    } catch (error) {
      console.error(error);
      setMntSuccess(false);
      setMintError("Withdrawal failed");
    } finally {
      setIsLoadingD(false);
    }
  };

  const renderButton = () => {
    if (!walletConnected) {
      return (
        <div className="flex justify-end m-0 p-0">
          <button
            onClick={connectWallet}
            className="bg-white hover:bg-blue-200 text-gray font-bold py-2 px-4 mt-5 mr-4 rounded"
          >
            {isLoadingB ? "connecting..." : "connect wallet"}
          </button>
        </div>
      );
    }

    if (walletConnected) {
      return (
        <div className="flex justify-end m-0 p-0">
          <button className="bg-white hover:bg-blue-200 text-gray font-bold py-2 px-4 mt-5 mr-4 rounded">
            {signerAddress.substring(0, 4)}...
            {signerAddress.substring(signerAddress.length - 4)}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-red-300 py-4">
        <div className="container mx-auto">
          <h1 className="text-white text-3xl font-bold">Welcome</h1>
          {renderButton()}
        </div>
      </header>

      <div className="container mx-auto px-4 h-screen">
        <h1 className="text-3xl font-bold mb-4">L3 NFT TICKETS</h1>
        <div className="flex justify-center items-center">
          <div>
            <img
              src={"L3_Ticket_NFT.png"}
              alt="L3_Ticket_NFT"
              className="w-45 h-45"
            />
          </div>
        </div>
        {isMumbaiNetwork && walletConnected ? (
          <div className="flex flex-col justify-center items-center">
            <div className="mb-4">
              <label className="inline-flex items-center flex-col">
                <p className="text-lg mb-4">Mint Fee : 0.01 MATIC </p>
                <input
                  value={depositAmount}
                  type="Number"
                  placeholder="Enter MATIC Amount"
                  className="border border-gray-300 p-2 outline-none rounded"
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </label>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={mintNFT}
              disabled={isLoading || isInputEmpty}
            >
              {isLoading ? "Minting..." : "Mint NFT"}
            </button>

            {mintSuccess && (
              <>
                <p className="text-green-500 mt-2">mint successful</p>
                <button>view on opensea</button>
              </>
            )}
            {mintError && <p className="text-red-500 mt-2">{mintError}</p>}
          </div>
        ) : (
          <>
            <h2 className="text-blue-500 text-3xl font-bold">
              Please connect your wallet to mint your L3 NFT TICKET
            </h2>
          </>
        )}
      </div>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Martonyx. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
