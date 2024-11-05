"use client";
import React, { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import Arweave from "arweave";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";
import MetamaskConnectButton from "@/components/MetamaskConnectButton";
import TraitsTable from "@/components/Traitstable";
import { LivepeerCore } from "@livepeer/ai/core";
import { generateTextToImage } from "@livepeer/ai/funcs/generateTextToImage";

export default function CreateNFT() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const { address, chainId, chain, status } = useAccount();

  useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 99 * 1024) {
        toast("Error: File size exceeds 99KB");
        setFile(null);
        setPreview(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  function uploadToArweave() {
    if (preview) {
      const ar = Arweave.init({
        host: "arweave.net",
        port: 443,
        protocol: "https",
      });

      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          const buffer = new Uint8Array(await file.arrayBuffer());
          const txn = await ar.createTransaction(
            { data: buffer },
            "use_wallet"
          );
          txn.addTag("App-Name", "WeaveMint");
          // txn.addTag("App-Version", AppVersion)
          txn.addTag("Content-Type", file.type || "application/octet-stream");
          txn.addTag("WeaveMint-Function", "Create-Profile");
          txn.addTag("File-Name", file.name || "unknown");
          await ar.transactions.sign(txn, "use_wallet");
          try {
            await ar.transactions.post(txn);
            resolve(txn.id);
            console.log("txn.id = " + txn.id);
            console.log("txn = " + JSON.stringify(txn));
          } catch (e) {
            console.log("Error: " + e);
          }
        };

        reader.onerror = (err) => reject(err);
      });
    } else {
      toast("Error: Upload the image first");
    }
  }

  return (
    <ScrollArea className="w-full h-screen bg-[#121212] mx-auto px-6 pt-6 pb-2 text-[#FFFFFF]">
      <div className="flex items-center justify-between border-b border-gray-600/50">
        <Link href="/">
          <div className="flex items-center ">
            <img src="/weavemint.svg" className="w-[70%]" />
            <h1 className="text-5xl font-semibold"> WeaveMint</h1>
          </div>
        </Link>

        <MetamaskConnectButton />
      </div>

      <div className="flex gap-8 justify-center mt-[3%]">
        {/* Upload Section */}
        <div className="flex flex-col gap-10 w-[30%] ">
          <h1 className="text-5xl font-semibold">Create New NFT</h1>
          {/* <ConnectKitButton showBalance={true} /> */}
          {status == "connected" ? (
            <div className="border-[1px] border-solid border-[#FFFFFF] rounded-lg p-5 flex gap-5 items-center">
              <div>
                <Image
                  src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTZDMy41ODE3MiAxNiAwIDEyLjQxODMgMCA4QzAgMy41ODE3MiAzLjU4MTcyIDAgOCAwQzEyLjQxODMgMCAxNiAzLjU4MTcyIDE2IDhDMTYgMTIuNDE4MyAxMi40MTgzIDE2IDggMTZaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfNjUxM181MjI3NikiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMS4xMjQ3IDguMDkxNDRMNy45OTk4NyAzTDQuODc2MjcgOC4wOTE0NEw3Ljk5OTg3IDkuOTI2NzdMMTEuMTI0NyA4LjA5MTQ0Wk0xMS4xMjQ4IDguNjc0NzVMNy45OTk5IDEwLjQ4NjJMNC44NzQyMSA4LjY3Mjk2TDcuOTk5OSAxMi45OTc0TDExLjEyNDggOC42NzQ3NVoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfNjUxM181MjI3NiIgeDE9IjgiIHkxPSIwIiB4Mj0iOCIgeTI9IjE2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiM2QjhDRUYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNkI3MEVGIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg=="
                  alt="External image"
                  width={35}
                  height={35}
                />
              </div>
              <div className="flex flex-col relative w-full">
                <h1>{address.slice(0, 6) + "....." + address.slice(-6)}</h1>
                <h1>WeaveVM Testnet</h1>
                <h1 className="absolute right-0 text-[#28b833] bg-[#1a2c21] rounded p-1">
                  {status}
                </h1>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#FFFFFF]">Upload file</h2>
            <div className="border-2 border-dashed border-[#FFFFFF] rounded-lg p-8">
              <div className="text-center space-y-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  ref={fileInputRef} // Assign ref to the input
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-4">
                    <Upload className="w-12 h-12 " />
                    <span className="text-sm ">PNG, JPEG, JPG Max 99KB.</span>
                    <button
                      onClick={handleButtonClick} // Trigger input on button click
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                </label>
                {file && <p className="text-sm mt-2">Selected: {file.name}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#FFFFFF]">Traits</h1>
            <TraitsTable />
          </div>

          <div>
            <button
              className="mt-2 px-4 py-2 bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors"
              onClick={uploadToArweave}
            >
              Upload To Arweave
            </button>
          </div>
        </div>
        {/* Preview Section */}
        <div className="space-y-4 mt-[10%]">
          <h2 className="text-2xl font-bold text-white">Preview</h2>
          <div className="border border-[#FFFFFF] rounded-lg p-4 h-64 flex items-center justify-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-sm text-gray-400 text-center">
                Upload file to preview your content
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </ScrollArea>
  );
}
