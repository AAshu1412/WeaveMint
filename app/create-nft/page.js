"use client";
import React, { useState } from "react";
import { Upload } from "lucide-react";

export default function CreateNFT() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#121212] mx-auto p-6">
      <div className="grid grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Upload file</h2>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
            <div className="text-center space-y-4">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*, video/*, audio/*"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    PNG, GIF, WEBP, MP4 or MP3. Max 100mb.
                  </span>
                  <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    Choose File
                  </button>
                </div>
              </label>
              {file && (
                <p className="text-sm text-gray-400 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Preview Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Preview</h2>
          <div className="border border-gray-600 rounded-lg p-4 h-64 flex items-center justify-center">
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
    </div>
  );
}
