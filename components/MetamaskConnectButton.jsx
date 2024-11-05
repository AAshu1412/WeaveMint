"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useDisconnect } from "wagmi";

const WEAVEVM_TESTNET_PARAMS = {
  chainId: "0x2518", // Hex for 9496
  chainName: "WeaveVM Testnet",
  nativeCurrency: {
    name: "Test WeaveVM",
    symbol: "tWVM",
    decimals: 18,
  },
  rpcUrls: ["https://testnet-rpc.wvm.dev"],
  blockExplorerUrls: ["https://explorer.wvm.dev"],
};

export default function MetamaskConnectButton() {
  const [account, setAccount] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  const { disconnect } = useDisconnect();

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      // Check network when accounts change
      checkNetwork();
    } else {
      setAccount(null);
    }
  };

  const handleChainChanged = () => {
    checkNetwork();
    window.location.reload();
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      // Check if the user is already connected
      window.ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccountsChanged)
        .catch((err) => {
          console.log(err);
        });

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Check network on load
      checkNetwork();
    } else {
      console.log("Please install MetaMask!");
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  const checkNetwork = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== WEAVEVM_TESTNET_PARAMS.chainId) {
          setIsCorrectNetwork(false);
        } else {
          setIsCorrectNetwork(true);
        }
      } catch (err) {
        console.log("Error checking network:", err);
      }
    }
  };

  const switchToZoraSepoliaTestnet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
      return;
    }

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: WEAVEVM_TESTNET_PARAMS.chainId }],
      });
      setIsCorrectNetwork(true);
      // @ts-ignore
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [WEAVEVM_TESTNET_PARAMS],
          });
          setIsCorrectNetwork(true);
        } catch (addError) {
          console.log(
            "Failed to add the Zora Sepolia Testnet network:",
            addError
          );
          alert("Failed to add the Zora Sepolia Testnet network.");
        }
      } else {
        console.log(
          "Failed to switch to the Zora Sepolia Testnet network:",
          switchError
        );
        alert("Failed to switch to the Zora Sepolia Testnet network.");
      }
    }
  };

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask or another Ethereum-compatible wallet!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      handleAccountsChanged(accounts);
      await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToZoraSepoliaTestnet();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const disconnectAccount = () => {
    setAccount(null);
  };

  const switchAccount = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("Please install MetaMask or another Ethereum-compatible wallet!");
        return;
      }

      // Prompt the user to select an account
      const accounts = await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      if (accounts) {
        const updatedAccounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        handleAccountsChanged(updatedAccounts);
      }
    } catch (err) {
      console.log("Error switching accounts:", err);
    }
  };

  const shortenAddress = (address) => {
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <Menubar className="px-6 mr-10 py-6 bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors border border-[#252525] hover:border-[#343434] ">
      {account ? (
        isCorrectNetwork ? (
          <MenubarMenu>
            <MenubarTrigger className=" items-center font-semibold">
              {/* <div className="flex font-semibold"> */}
              🟢 {shortenAddress(account)}
              {/* </div> */}
            </MenubarTrigger>
            <MenubarContent
              forceMount
              className="bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors border border-[#252525] hover:border-[#343434]"
            >
              <MenubarItem inset onSelect={switchAccount}>
                Switch Account
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                inset
                onSelect={() => {
                  disconnect();
                  disconnectAccount();
                }}
              >
                Disconnect
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        ) : (
          <button onClick={switchToZoraSepoliaTestnet} className="">
            Switch to Zora Sepolia Testnet
          </button>
        )
      ) : (
        <button className=" flex items-center gap-3" onClick={connect}>
       <Image src="/metamsk.png" alt="Metamask" width={20} height={20} />   <p>Connect Wallet
       </p>   </button>
      )}
    </Menubar>
  );
}
