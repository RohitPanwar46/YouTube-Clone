import React, { useState } from "react";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  RedditShareButton,
  PinterestShareButton,
  EmailShareButton,
  FacebookMessengerShareButton,
  FacebookIcon,
  WhatsappIcon,
  TelegramIcon,
  RedditIcon,
  PinterestIcon,
  EmailIcon,
  FacebookMessengerIcon,
} from "react-share";

export default function ShareMenu({ className = "" }) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const title = "Check out this video!";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const openXShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };


  const openSMS = () => {
    // SMS body param differs by platform; this is a simple cross-platform attempt
    window.location.href = `sms:?body=${encodeURIComponent(title + " " + shareUrl)}`;
  };

  const media = typeof document !== "undefined" ? document.querySelector('meta[property="og:image"]')?.content || shareUrl : shareUrl;

  return (
    <div
      className={`md:w-[41vw] w-auto mx-auto p-3 rounded-lg bg-[#181818] text-white shadow-lg ${className}`}
    >
      {/* Icons row */}
      <div className="flex items-start gap-4">
        <div className="flex flex-wrap gap-3">
          {/* WhatsApp */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <WhatsappShareButton url={shareUrl} title={title} className="">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-500 shadow-sm">
                <WhatsappIcon size={34} round />
              </div>
            </WhatsappShareButton>
            <span className="text-[12px] text-gray-200">WhatsApp</span>
          </div>

          {/* Facebook */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <FacebookShareButton url={shareUrl} quote={title}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3b5998] shadow-sm">
                <FacebookIcon size={34} round />
              </div>
            </FacebookShareButton>
            <span className="text-[12px] text-gray-200">Facebook</span>
          </div>

          {/* Messenger */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <FacebookMessengerShareButton url={shareUrl} appId="">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0084ff] shadow-sm">
                <FacebookMessengerIcon size={34} round />
              </div>
            </FacebookMessengerShareButton>
            <span className="text-[12px] text-gray-200">Messenger</span>
          </div>

          {/* Telegram */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <TelegramShareButton url={shareUrl} title={title}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#26A5E4] shadow-sm">
                <TelegramIcon size={34} round />
              </div>
            </TelegramShareButton>
            <span className="text-[12px] text-gray-200">Telegram</span>
          </div>

          {/* Reddit */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <RedditShareButton url={shareUrl} title={title}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FF4500] shadow-sm">
                <RedditIcon size={34} round />
              </div>
            </RedditShareButton>
            <span className="text-[12px] text-gray-200">Reddit</span>
          </div>

          {/* Pinterest */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <PinterestShareButton url={shareUrl} media={media} description={title}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#E60023] shadow-sm">
                <PinterestIcon size={34} round />
              </div>
            </PinterestShareButton>
            <span className="text-[12px] text-gray-200">Pinterest</span>
          </div>

          {/* X (former Twitter) - custom black circle with white X */}
          <div className="flex flex-col items-center gap-1 text-xs w-16 cursor-pointer">
            <button
              onClick={openXShare}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-black shadow-sm"
              aria-label="Share on X"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4L19 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 4L5 20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-[12px] text-gray-200">X</span>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center gap-1 text-xs w-16">
            <EmailShareButton url={shareUrl} subject={title} body={shareUrl}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-400/20 shadow-sm">
                <EmailIcon size={34} round />
              </div>
            </EmailShareButton>
            <span className="text-[12px] text-gray-200">Email</span>
          </div>

          {/* SMS (custom) */}
          <div className="flex flex-col items-center gap-1 text-xs w-16 cursor-pointer">
            <button
              onClick={openSMS}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-600/40 shadow-sm"
              aria-label="Share via SMS"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12l4-3h10a2 2 0 0 0 2-2v-1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-[12px] text-gray-200">SMS</span>
          </div>

        </div>

      </div>

      {/* URL + Copy row (styled like the image) */}
      <div className="mt-3">
        <div className="flex items-center gap-3 bg-[#0f0f0f] border border-gray-700 rounded-lg px-3 py-2">
          <input
            className="flex-1 bg-transparent outline-none text-sm text-gray-300 truncate"
            readOnly
            value={shareUrl}
            aria-label="Share URL"
            title={shareUrl}
          />

          <button
            onClick={handleCopy}
            className={`px-3 py-1 rounded-full cursor-pointer text-sm font-medium shadow-sm ${
              copied ? "bg-gray-500" : "bg-blue-600"
            }`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
