import { ethers } from "ethers";
import { encodeData } from "./encode"

// Contracts
export const WEAVEMINT_ADDRESS = "0x4fA3F94C97fa9733A63F3056919325E96A45f81e";

export const WEAVEMINT_ABI = []

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
export const signer = provider ? await provider.getSigner() : null;

// Contract instances with provider and signer configurations
export const weaveMintContractWithProvider = provider
    ? new ethers.Contract(WEAVEMINT_ADDRESS, WEAVEMINT_ABI, provider)
    : null;
export const weaveMintContractWithSigner = signer
    ? new ethers.Contract(WEAVEMINT_ADDRESS, WEAVEMINT_ABI, signer)
    : null;

// Contract instances connected with signer
export const weaveMintContract = weaveMintContractWithSigner?.connect(signer);

// function call

const contractCall = async (userAddress, data) => {
    const encodedData = await encodeData(data);
    const trx = await weaveMintContract.mintNft(userAddress, encodedData);
    await trx.wait();
}