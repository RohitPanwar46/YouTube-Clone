// lib/getCroppedImg.js
export default function getCroppedImg(imageSrc, pixelCrop) {
  // returns a Promise that resolves to a Blob (image/png)
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      // Draw the cropped area onto the canvas
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // convert to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        resolve(blob);
      }, "image/png");
    };
    image.onerror = (err) => {
      reject(err);
    };
  });
}
