import dotenv from "dotenv";
import { ethers } from "ethers";

import { WEAVEMINT_ADDRESS, WEAVEMINT_ABI } from "./constants.js";
import { encodeData } from "./encode.js";

dotenv.config();

// sample data

export const userAddress = "0x709d29dc073F42feF70B6aa751A8D186425b2750";
// export const data = "0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000f50726f66696c6520506963747572650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003f68747470733a2f2f617277656176652e6e65742f55776c514b74344868383670494138675f3347583730756a364931464f4c7341444e4f4e706548396a556b0000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000055374796c6500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000044c6f6f6b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004436f6f6c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000752656c6178656400000000000000000000000000000000000000000000000000"

// Ensure the provider URL is valid
const provider = new ethers.JsonRpcProvider("https://testnet-rpc.wvm.dev");

// Retrieve the private key from environment variables with error handling
if (!process.env.PRIVATE_KEY) {
    throw new Error("Private key is missing from environment variables.");
}

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Instantiate the contract
const weaveMintContract = new ethers.Contract(WEAVEMINT_ADDRESS, WEAVEMINT_ABI, wallet);
const sample = {
    name: "Profile Picture",
    image: "https://arweave.net/UwlQKt4Hh86pIA8g_3GX70uj6I1FOLsADNONpeH9jUk",
    traits: ["Style", "Look"],
    values: ["Cool", "Relaxed"]
};

const contractCall = async () => {
    try {

        const data = await encodeData(sample);
        const trx = await weaveMintContract.mintNft(userAddress, data);
        console.log("Transaction submitted:", trx.hash);

        const receipt = await trx.wait();
        console.log("Transaction confirmed:", receipt);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
};

contractCall();