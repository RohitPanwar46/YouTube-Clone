"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../app/lib/getCroppedImg";

export default function AvatarCropper({ imageSrc, onComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      // blob is ready to be appended to FormData
      onComplete(blob);
    } catch (err) {
      console.error("Crop/save error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel}></div>

      <div className="relative w-full max-w-md bg-[#131313] rounded-lg p-4 z-10">
        <div className="w-full h-80 relative bg-gray-800">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={(z) => setZoom(Number(z))}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1 bg-gray-700 rounded text-white">Cancel</button>
            <button type="button" onClick={handleSave} className="px-3 py-1 bg-red-600 rounded text-white">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
