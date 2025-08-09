import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function AvatarCropper({ imageSrc, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(async () => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    // Convert to blob or base64
    canvas.toBlob((blob) => {
      onComplete(blob);
    }, "image/jpeg");
  }, [croppedAreaPixels, imageSrc, onComplete]);

  return (
    <div className="relative w-full h-[400px] bg-black">
      <Cropper
        image={imageSrc}
        crop={crop}
        zoom={zoom}
        aspect={1}
        cropShape="round"
        showGrid={false}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
      />

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4">
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        />
        <button
          onClick={getCroppedImg}
          className="bg-red-500 px-4 py-2 rounded text-white"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// Utility: load image
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(error));
    img.setAttribute("crossOrigin", "anonymous"); // Avoid CORS issues
    img.src = url;
  });
}
