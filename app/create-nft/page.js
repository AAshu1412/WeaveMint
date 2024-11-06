"use client";
import React, { useState, useRef, useEffect, use } from "react";
import { Upload } from "lucide-react";
import Arweave from "arweave";
// import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";
import MetamaskConnectButton from "@/components/MetamaskConnectButton";
import TraitsTable from "@/components/Traitstable";
import { LivepeerCore } from "@livepeer/ai/core";
import { generateTextToImage } from "@livepeer/ai/funcs/generateTextToImage";
import imageCompression from "browser-image-compression";
import { SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

export default function CreateNFT() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const [traits, setTraits] = useState([]);
  const [values, setValues] = useState([]);
  const [editingIndex, setEditingIndex] = useState({ row: -1, col: -1 });

  const [livepeerPrompt, setLivepeerPrompt] = useState(null);
  const [imageName, setImageName] = useState(null);
  const [livepeer, setLivepeer] = useState(null);

  const { address, chainId, chain, status } = useAccount();

  useEffect(() => {
    const _livepeer = new LivepeerCore({
      httpBearer: process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN,
    });
    setLivepeer(_livepeer);
    console.log(_livepeer);
    console.log(process.env.NEXT_PUBLIC_LIVEPEER_API_TOKEN);
  }, []);

  //////////////////////////////////////////////////////////////////////////////////////
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

  /////////////////////////////////////////////////////////////////////////////////////////////////

  const addRow = () => {
    setTraits([...traits, ""]);
    setValues([...values, ""]);
  };

  const startEditing = (row, col) => {
    setEditingIndex({ row, col });
  };

  const updateValue = (event, row, col) => {
    const newValue = event.target.value;
    if (col === 0) {
      const newTraits = [...traits];
      newTraits[row] = newValue;
      setTraits(newTraits);
    } else {
      const newValues = [...values];
      newValues[row] = newValue;
      setValues(newValues);
    }
  };

  const deleteRow = (index) => {
    const updatedTraits = [...traits];
    const updatedValues = [...values];
    updatedTraits.splice(index, 1);
    updatedValues.splice(index, 1);
    setTraits(updatedTraits);
    setValues(updatedValues);
  };

  ///////////////////////////////////////////////////////////////////////////////

  const encodeData = async (data) => {
    const abiCoder = new ethers.AbiCoder();
    const encodedData = abiCoder.encode(
      ["string", "string", "string[]", "string[]"],
      [data.name, data.image, data.traits, data.values]
    );

    console.log("Encoded Data:", encodedData); // Encoded data is a single hex string
    return encodedData;
  };

  const decodeData = (encodedData) => {
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(
      ["string", "string", "string[]", "string[]"],
      encodedData
    );

    console.log("Decoded Data:", {
      name: decodedData[0],
      image: decodedData[1],
      traits: decodedData[2],
      values: decodedData[3],
    });
    return decodedData;
  };

  //////////////////////////////////////////////////////////////////////////////

  async function uploadToArweave(imageInput) {
    if (!imageInput) {
      toast("Error: No image provided");
      return;
    }

    let fileToUpload;

    // Check if the input is a URL or a file
    if (typeof imageInput === "string") {
      // Handle image URL
      const response = await fetch(imageInput);
      if (!response.ok) {
        toast("Error: Failed to fetch image from URL");
        return;
      }
      fileToUpload = await response.blob(); // Convert to Blob
    } else if (imageInput instanceof File) {
      // Handle file input (already handled)
      fileToUpload = imageInput;
    } else {
      toast("Error: Invalid image input");
      return;
    }

    // Initialize Arweave
    const ar = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    });

    const reader = new FileReader();
    reader.readAsArrayBuffer(fileToUpload);

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        const buffer = new Uint8Array(await fileToUpload.arrayBuffer());
        const txn = await ar.createTransaction(
          { data: buffer },
          JSON.parse(process.env.NEXT_PUBLIC_WALLET)
        );
        txn.addTag("App-Name", "WeaveMint");
        txn.addTag(
          "Content-Type",
          fileToUpload.type || "application/octet-stream"
        );
        txn.addTag("WeaveMint-Function", "Create-Profile");
        txn.addTag("File-Name", fileToUpload.name || "unknown");

        await ar.transactions.sign(
          txn,
          JSON.parse(process.env.NEXT_PUBLIC_WALLET)
        );

        try {
          await ar.transactions.post(txn);
          resolve(txn.id);
          console.log("txn.id = " + txn.id);
        } catch (e) {
          console.log("Error: " + e);
          reject(e);
        }
      };

      reader.onerror = (err) => reject(err);
    });
  }

  const handleUrlSubmit = async (url) => {
    if (url && url.startsWith("http")) {
      try {
        const txnId = await uploadToArweave(url); // Passing URL directly
        console.log("Image uploaded with txn ID:", txnId);
      } catch (e) {
        console.log("Error uploading image:", e);
      }
    } else {
      toast("Error: Invalid URL");
    }
  };

  // function uploadToArweave() {
  //   if (preview) {
  //     const ar = Arweave.init({
  //       host: "arweave.net",
  //       port: 443,
  //       protocol: "https",
  //     });

  //     const reader = new FileReader();
  //     reader.readAsArrayBuffer(file);

  //     return new Promise((resolve, reject) => {
  //       reader.onload = async () => {
  //         const buffer = new Uint8Array(await file.arrayBuffer());
  //         const txn = await ar.createTransaction(
  //           { data: buffer },
  //           JSON.parse(process.env.NEXT_PUBLIC_WALLET)
  //         );
  //         txn.addTag("App-Name", "WeaveMint");
  //         // txn.addTag("App-Version", AppVersion)
  //         txn.addTag("Content-Type", file.type || "application/octet-stream");
  //         txn.addTag("WeaveMint-Function", "Create-Profile");
  //         txn.addTag("File-Name", file.name || "unknown");
  //         await ar.transactions.sign(
  //           txn,
  //           JSON.parse(process.env.NEXT_PUBLIC_WALLET)
  //         );
  //         try {
  //           await ar.transactions.post(txn);
  //           resolve(txn.id);
  //           console.log("txn.id = " + txn.id);
  //           return txn.id;
  //           // console.log("txn = " + JSON.stringify(txn));
  //         } catch (e) {
  //           console.log("Error: " + e);
  //         }
  //       };

  //       reader.onerror = (err) => reject(err);
  //     });
  //   } else {
  //     toast("Error: Upload the image first");
  //   }
  // }

  async function minting() {
    try {
      const imageUploadArDriveTxID = await uploadToArweave(preview);
      const jsonVariable = {
        name: imageName,
        image: imageUploadArDriveTxID,
        traits: traits,
        values: values,
      };
      console.log("JsonVariable: " + JSON.stringify(jsonVariable));

      const encodeJsonVariable = await encodeData(jsonVariable);
      console.log("encodeJsonVariable: " + encodeJsonVariable);
    } catch (error) {
      toast(error);
    }
  }

  //////////////////////////////////////////////////////////////

  // Get image dimensions
  const getImageInfo = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(blob); // Create URL synchronously

        img.onload = () => {
          // Clean up the object URL after we're done
          URL.revokeObjectURL(objectUrl);

          resolve({
            width: img.width,
            height: img.height,
            size: (blob.size / 1024).toFixed(2) + " KB", // Convert to KB
          });
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image"));
        };

        img.src = objectUrl;
      });
    } catch (error) {
      console.error("Error processing image:", error);
      throw error;
    }
  };

  //////////////////////////
  const compressImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const options = {
      maxSizeMB: 0.1, // 100KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    const compressedBlob = await imageCompression(blob, options);
    return URL.createObjectURL(compressedBlob);
  };

  // Compress image
  // const compressImage = async (imageUrl) => {
  //   try {
  //     const response = await fetch(imageUrl);
  //     const blob = await response.blob();

  //     // First attempt with initial options
  //     let options = {
  //       maxSizeMB: 0.1, // 100KB
  //       maxWidthOrHeight: 1920,
  //       useWebWorker: true,
  //       initialQuality: 0.7, // Start with 70% quality
  //     };

  //     let compressedBlob = await imageCompression(blob, options);
  //     let currentSize = compressedBlob.size / 1024; // Convert to KB

  //     // If still over 100KB, try more aggressive compression
  //     if (currentSize > 100) {
  //       // Second attempt with more aggressive options
  //       options = {
  //         maxSizeMB: 0.095, // Slightly under 100KB
  //         maxWidthOrHeight: 1600, // Reduce max dimensions
  //         useWebWorker: true,
  //         initialQuality: 0.5, // Reduce initial quality
  //         maxIteration: 10, // Allow more compression iterations
  //       };

  //       compressedBlob = await imageCompression(blob, options);
  //       currentSize = compressedBlob.size / 1024;

  //       // If still over 100KB, try final aggressive compression
  //       if (currentSize > 100) {
  //         options = {
  //           maxSizeMB: 0.095,
  //           maxWidthOrHeight: 1200,
  //           useWebWorker: true,
  //           initialQuality: 0.3,
  //           maxIteration: 15,
  //           fileType: "image/jpeg", // Force JPEG format for better compression
  //         };

  //         compressedBlob = await imageCompression(blob, options);
  //       }
  //     }

  //     // Return both URL and size for verification
  //     return {
  //       url: URL.createObjectURL(compressedBlob),
  //       size: (compressedBlob.size / 1024).toFixed(2), // Size in KB
  //     };
  //   } catch (error) {
  //     console.error("Error in compression:", error);
  //     throw error;
  //   }
  // };

  ///////////////////////////////////////////////////////////////

  async function generateImage(prompt) {
    const res = await generateTextToImage(livepeer, {
      modelId: "SG161222/RealVisXL_V4.0_Lightning",
      prompt,
    });

    console.log(res);

    if (!res.ok) {
      console.error("Unable to generate image");
      return;
    }
    // Cast the response value to the expected type
    const responseValue = res.value?.imageResponse;

    const images = responseValue?.images;
    if (images && images.length > 0) {
      const imageUrl = images[0].url;
      // setPreview(imageUrl);
      var sizeimage = imageUrl;
      const maxIterations = 10; // Set a maximum to avoid an infinite loop
      let currentIteration = 0;

      const data1 = await getImageInfo(imageUrl);
      console.log("Data1: " + JSON.stringify(data1));

      while (true) {
        const data2 = await compressImage(sizeimage);
        sizeimage = data2; // Update to the new compressed image URL
        const data3 = await getImageInfo(sizeimage);

        console.log("Data3: " + JSON.stringify(data3));

        // Terminate if the image size is below 100 KB or max iterations are reached
        if (data3.size < 100.0 || currentIteration >= maxIterations) {
          break;
        }

        currentIteration++; // Increment the iteration count
      }
      await uploadToArweave(sizeimage);
      console.log("sizeimage type : " + typeof sizeimage);
      console.log("sizeimage: " + sizeimage);
      setPreview(sizeimage);
      console.log("Imageurl: " + imageUrl);
      //  await handleUrlSubmit(sizeimage);
      return imageUrl;
    } else {
      throw new Error("No images returned from the API.");
    }
  }

  const handleInput = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    console.log(name, value);
    if (name == "LivepeerPrompt") setLivepeerPrompt(value);
    if (name == "ImageName") setImageName(value);
  };

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
          {/* {status == "connected" ? (
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
          )} */}
          <div>
            <div className="space-y-4 border-b border-gray-600/50 pb-5">
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
                  {file && (
                    <p className="text-sm mt-2">Selected: {file.name}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-lg font-semibold">Text to Image</h1>
                <div className="flex flex-col gap-1">
                  <textarea
                    className="w-full bg-[#343434] text-[#FFFFFF] rounded-sm h-[5%] p-3"
                    type="text"
                    autoComplete="off"
                    value={livepeerPrompt}
                    onChange={handleInput}
                    name="LivepeerPrompt"
                    id="LivepeerPrompt"
                    placeholder="Write the prompt"
                  />
                  <button
                    onClick={async () => await generateImage(livepeerPrompt)}
                    className="mt-2 px-4 w-[20%] py-2 bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
              {preview ? (
                <div className="flex flex-col gap-2">
                  <h1 className="text-lg font-semibold">Name</h1>
                  <input
                    className="w-full bg-[#343434] text-[#FFFFFF] rounded-sm h-[5%] p-3"
                    type="text"
                    autoComplete="off"
                    value={imageName}
                    onChange={handleInput}
                    name="ImageName"
                    id="ImageName"
                    placeholder="Write the prompt"
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-[#FFFFFF]">Traits</h1>
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-[#252525]">
                <tr>
                  <th className="w-[5%]"></th>
                  <th className="w-[47.5%] px-4 py-2 text-lg">Traits</th>
                  <th className="w-[47.5%] px-4 py-2 text-lg">Value</th>
                </tr>
              </thead>
              <tbody>
                {traits.map((trait, index) => (
                  <tr key={index} className="hover:bg-[#343434] group">
                    {/* <td
                className="px-2 py-1 cursor-pointer text-red-600"
                onClick={addRow}
              >
                +
              </td> */}

                    <td className="px-2 py-1 border-r border-gray-600/50">
                      <button
                        onClick={() => deleteRow(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        X
                      </button>
                    </td>

                    <td
                      className="px-2 py-1 cursor-pointer border-r border-gray-600/50"
                      onClick={() => startEditing(index, 0)}
                    >
                      {editingIndex.row === index && editingIndex.col === 0 ? (
                        <input
                          value={trait}
                          onChange={(e) => updateValue(e, index, 0)}
                          onBlur={() => setEditingIndex({ row: -1, col: -1 })}
                          autoFocus
                          className="bg-transparent border-b border-gray-500"
                        />
                      ) : (
                        trait
                      )}
                    </td>
                    <td
                      className="px-2 py-1 cursor-pointer"
                      onClick={() => startEditing(index, 1)}
                    >
                      {editingIndex.row === index && editingIndex.col === 1 ? (
                        <input
                          value={values[index]}
                          onChange={(e) => updateValue(e, index, 1)}
                          onBlur={() => setEditingIndex({ row: -1, col: -1 })}
                          autoFocus
                          className="bg-transparent border-b border-gray-500"
                        />
                      ) : (
                        values[index]
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addRow}
              className="mt-2 px-4 py-2 bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors"
            >
              + Add New Trait
            </button>
          </div>

          <div>
            <button
              className="mt-2 px-4 py-2 bg-[#252525] text-[#FFFFFF] rounded-lg hover:bg-[#343434] transition-colors"
              onClick={minting}
            >
              Mint
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
