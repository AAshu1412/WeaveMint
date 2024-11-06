import { ethers } from "ethers";
import weavemintABI from "./abi.json";

// Contracts
export const WEAVEMINT_ADDRESS = "0x61a5d7B751C0e249ED4c418789Bd230c00Be2e5a";
export const WEAVEMINT_ABI = weavemintABI;

// Initialize provider
export const initializeProvider = () => {
  if (typeof window === "undefined") {
    console.warn(
      "initializeProvider: Window object not available on the server."
    );
    return null;
  }

  const ethereum = window.ethereum;
  if (ethereum) {
    return new ethers.BrowserProvider(ethereum);
  } else {
    console.warn("initializeProvider: BrowserProvider not available.");
    return null;
  }
};

export const provider =
  typeof window !== "undefined" ? initializeProvider() : null;

export const initializeSigner = async () => {
  if (!provider) return null;
  return provider.getSigner();
};

export const initializeContract = async () => {
  const signer = await initializeSigner();
  return signer
    ? new ethers.Contract(WEAVEMINT_ADDRESS, WEAVEMINT_ABI, signer)
    : null;
};

// Function to call the contract
export const contractCall = async (userAddress, data) => {
  try {
    const weaveMintContract = await initializeContract();
    if (!weaveMintContract) {
      console.warn("Contract instance not available");
      return;
    }

    const trx = await weaveMintContract.mintNft(userAddress, data);
    await trx.wait();
    console.log("TRX:", JSON.stringify(trx));
  } catch (error) {
    console.error(
      "Error in contract call:",
      error.message || JSON.stringify(error)
    );
  }
};
