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
  const [mintSuccess, setMintSuccess] = useState(false);
  const [mintError, setMintError] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [latestTokenId, setLatestTokenId] = useState("");
  const [owner, setOwner] = useState(null);

  const isInputEmpty = depositAmount === "";

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

      const divide_ = depositAmount / 100;

      const transaction = await L3Contract.mintNFT(depositAmount, {
        value: ethers.utils.parseEther(divide_.toString()),
      });
      await transaction.wait();
      tokenId();
      setMintSuccess(true);
      setMintError(null);
    } catch (error) {
      console.error(error);
      setMintSuccess(false);
      setMintError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const tokenId = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const L3Contract = new ethers.Contract(
        L3_CONTRACT_ADDRESS,
        L3_CONTRACT_ABI,
        signer
      );

      const tx = await L3Contract.getMostRecentNFTTokenId(signerAddress);
      setLatestTokenId(tx);
    } catch (error) {
      setLatestTokenId(error);
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
      setWithdrawSuccess(true);
      setMintError(null);
    } catch (error) {
      console.error(error);
      setWithdrawSuccess(false);
      setMintError("Withdrawal failed");
    } finally {
      setIsLoadingD(false);
    }
  };

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

      const getOwner = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const L3Contract = new ethers.Contract(
          L3_CONTRACT_ADDRESS,
          L3_CONTRACT_ABI,
          signer
        );
        const ownerAcc = await L3Contract.owner();

        setOwner(ownerAcc);
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
          getOwner();
        }
      });
    }
  }, []);

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
      <header className="bg-slate-800 py-4">
        <div className="container mx-auto">
          <div className="container mx-auto">
            <div className="flex flex-row items-center">
              <img src="l3_footer.png" alt="headl3" />
              {!walletConnected ? (
                <h1 className="text-white text-5xl font-bold">Welcome</h1>
              ) : (
                <>
                  <h1 className="text-white text-5xl font-bold">Lottery NFT</h1>
                </>
              )}
            </div>
            {walletConnected ? (
              <p className="text-lg text-white">
                Lottery, By the community, for the community
              </p>
            ) : null}
          </div>

          {renderButton()}
        </div>
      </header>

      {isMumbaiNetwork && walletConnected ? (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
              <div className="max-w-md mx-auto">
                <div className="flex items-center space-x-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-blue-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8L12 12 14 14" />
                  </svg>
                  <h2 className="text-3xl font-bold text-gray-800">
                    L3 NFT Ticket
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center">
                      <div>
                        <img
                          src={"L3_Ticket_NFT.png"}
                          alt="L3_Ticket_NFT"
                          className="w-45 h-45"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="inline-flex items-center flex-col">
                        <p className="text-lg mb-4">Mint Fee : 0.01 MATIC </p>
                        <input
                          value={depositAmount}
                          type="Number"
                          placeholder="Number of Tickets"
                          className="border border-gray-300 p-2 outline-none rounded"
                          onChange={(e) => setDepositAmount(e.target.value)}
                        />
                      </label>
                    </div>
                    <div className="flex justify-center items-center h-full">
                      <button
                        className="bg-red-500 text-white px-4 py-2 m-2 rounded"
                        onClick={mintNFT}
                        disabled={isLoading || isInputEmpty}
                      >
                        {isLoading ? "minting..." : "Mint NFT"}
                      </button>
                      {owner === signerAddress && (
                        <button
                          className="bg-green-500 text-white px-4 py-2 m-2 rounded"
                          onClick={withdrawTokens}
                        >
                          {isLoadingD ? "loading..." : "Withdraw"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen">
          <div>
            <h1 className="text-3xl font-bold text-center text-blue-500 mt-20">
              NFT TICKETS
            </h1>
            <p className="text-lg text-center text-gray-700">
              Lottery, By the community, for the community
            </p>
            <h2 className="text-blue-500 text-center text-3xl font-bold">
              Please connect your wallet to mint your L3 NFT TICKET
            </h2>
          </div>
          <div className="flex flex-col justify-center items-center">
            <div className="w-96 h-96">
              <img
                src={"L3_Ticket_NFT.png"}
                alt="L3_Ticket_NFT"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      {mintSuccess && (
        <div className="text-center bg-gray-100 mb-5">
          <p className="text-green-500 text-center text-2xl">mint successful</p>
          <a
            className="hover:text-red-500 text-2xl font-bold"
            target="_blank"
            rel="noreferrer"
            href={`https://testnets.opensea.io/assets/mumbai/0x28b8BF4dF88baa2b02ba87Bd13Cc7911e5bbFb55/${latestTokenId}`}
          >
            view on opensea
          </a>
        </div>
      )}
      {withdrawSuccess && (
        <p className="text-green-500 text-center text-2xl bg-gray-100 mb-5">
          Withdraw successful
        </p>
      )}
      {mintError && <p className="text-red-500 mt-2">{mintError}</p>}
      <footer className="bg-slate-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p className="mt-10 text-center">
            Copyright &copy; 2023{" "}
            <img
              src={"l3_footer.png"}
              alt="l3_footer"
              className="inline-block w-4 h-4"
            />
          </p>
        </div>
      </footer>
    </div>
  );
}
