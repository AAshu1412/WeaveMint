"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const images = [
    "https://images.unsplash.com/photo-1509721434272-b79147e0e708?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    "https://images.unsplash.com/photo-1506710507565-203b9f24669b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1536&q=80",
    "https://images.unsplash.com/photo-1536987333706-fc9adfb10d91?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
    "https://images.unsplash.com/photo-1444525873963-75d329ef9e1b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1500&q=80",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Update the current index every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, [images.length]);

  return (
    <div className="w-full h-screen flex  bg-[#121212]">
      <div className="w-1/2 relative">
        {/* Content with dynamic scrollbar */}
        <div className="h-full overflow-y-hidden scrollbar-hover text-[#FFFFFF]">
          <div className="p-8 h-full overflow-y-auto">
            <div className="absolute top-[30%]">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-5">
                  <h1 className="text-5xl font-semibold">WeaveMint</h1>
                  <h1 className="text-lg w-[70%]">
                    At Weavemint, we're revolutionizing NFT minting by
                    integrating Arweave's WeaveVM precompiles directly into the
                    ERC721 standard. Say goodbye to the hassle of multiple
                    uploads and metadata management — with Weavemint, creators
                    and collectors can mint and manage their NFTs seamlessly in
                    a single, streamlined transaction.
                  </h1>
                </div>
                <Link href="/create-nft">
                  <div className="w-[80%] bg-[#252525] rounded-lg p-6 transition-transform transform hover:-translate-y-1 hover:bg-[#343434]">
                    <div className="flex flex-col gap-3">
                      <h1 className="text-2xl font-semibold">Create NFT</h1>
                      <h1 className="text-lg">Yo create your nft</h1>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative w-1/2 h-screen overflow-hidden">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Slide ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
