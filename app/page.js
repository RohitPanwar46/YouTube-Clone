"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { apiRequest, API_ENDPOINTS, getUserSubscriptions } from "./lib/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function YouTubeHome() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [showServerNote, setShowServerNote] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();
  const [subscriptions, setSubscriptions] = useState([]);

  const sidebarItems = [
    { icon: "home", text: "Home", url: "/" },
    { icon: "fire", text: "Upload", url: "/upload" },
    { icon: "dashboard", text: "Dashboards", url: "/dashboard" },
    { icon: "compass", text: "Channels", url: "/channels" },
    { icon: "folder", text: "Subscriptions", url: "/subscriptions" },
    { separator: true },
    { icon: "photo-video", text: "Playlists", url: "/playlists" },
    { icon: "history", text: "History", url: "/history" },
    { icon: "watch-later", text: "Watch later", url: "/playlists/watch-later" },
    { icon: "thumbs-up", text: "Liked videos", url: "/playlists/liked-videos" },
    { separator: true },
    { title: "Subscriptions" },
  ];

  // Video data
  const [videos, setVideos] = useState([]);

  // fetching videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const result = await apiRequest(API_ENDPOINTS.GETVIDEOS, {
          method: "GET",
        });
        setVideos(result.data.videos);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setIsLoading(false);
        setShowServerNote(false);
      }
    };
    fetchVideos();
  }, [session]);

  // fetching subscribers if session exists
  useEffect(() => {
    const fetchSubscriptions = async () => {
      const result = await getUserSubscriptions(
        session.user.id,
        session.accessToken
      );
      setSubscriptions(result);
    };

    if (session) {
      fetchSubscriptions();
    }
  }, [session]);

  const categories = [
    "All",
    "Gaming",
    "Music",
    "Live",
    "JavaScript",
    "React",
    "Podcasts",
    "Comedy",
    "Recently uploaded",
    "Watched",
  ];

  // formating time
  function timeAgo(date) {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m ago`;

    return "Just now";
  }

  // formating duration
  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // formating views
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count;
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  function handleVideoClick(videoId) {
    router.push(`/player/${videoId}`);
  }

  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 576 512">
            <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" />
          </svg>
        );
      case "fire":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 384 512">
            <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 85.96 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z" />
          </svg>
        );
      case "compass":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31l-55.5 144.3c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
          </svg>
        );
      case "folder":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z" />
          </svg>
        );
      case "photo-video":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 640 512">
            <path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H576v96H288zM576 256H288V160H576v96zM0 128C0 92.7 28.7 64 64 64H576c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
          </svg>
        );
      case "history":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z" />
          </svg>
        );
      case "clock":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z" />
          </svg>
        );
      case "thumbs-up":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z" />
          </svg>
        );
      case "circle":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z" />
          </svg>
        );
      case "watch-later":
        return (
          <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
            {/* Material "watch_later" style */}
            <path d="M12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-.5-13h1v6l4.25 2.52-.75 1.23L11.5 13V7z" />
          </svg>
        );
      case "dashboard":
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            {/* Material "dashboard" style */}
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-h-screen scrollbar-hide overflow-y-scroll relative bg-[#121212] text-white">
      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-14 md:pt-16 flex ">
        {/* Sidebar  */}
        <aside className="hidden max-h-screen scrollbar-hide md:block fixed top-14 md:top-16 bottom-0 bg-[#0f0f0f] w-18 md:w-64 z-40 overflow-y-scroll">
          <div className="py-4">
            {sidebarItems.map((item, index) =>
              item.separator ? (
                <div
                  key={index}
                  className="h-px bg-[#303030] my-3 mx-4"
                ></div>
              ) : item.title ? (
                <div
                  key={index}
                  className="hidden md:inline px-6 py-2 text-xs uppercase text-[#aaa] tracking-wider"
                >
                  {item.title}
                </div>
              ) : (
                <Link
                  key={index}
                  href={item.url}
                  className="flex items-center px-3 md:px-6 py-3 cursor-pointer hover:bg-[#181818] transition-all duration-300 group"
                >
                  <div
                    className={`w-6 mr-4 ${
                      item.color || "text-white"
                    } group-hover:text-red-500 transition-colors duration-300`}
                  >
                    {getIcon(item.icon)}
                  </div>
                  <span className="hidden md:block group-hover:text-white transition-colors duration-300">
                    {item.text}
                  </span>
                </Link>
              )
            )}
            {session && subscriptions?.length > 0 && (
              <>
                {subscriptions.map((sub, index) => (
                  <Link
                    key={index}
                    href={`/channels/${sub.channel.username}`}
                    className="flex items-center px-3 md:px-6 py-3 cursor-pointer hover:bg-[#181818] transition-all duration-300 group"
                  >
                    <Image
                      src={sub.channel.avatar}
                      alt={sub.channel.username}
                      width={30}
                      height={30}
                      className={`mr-3 rounded-full object-cover  group-hover:border-red-500 group-hover:scale-110 transition-all duration-300`}
                    />
                    <span className="hidden md:block group-hover:text-white transition-colors duration-300">
                      {sub.channel.username}
                    </span>
                  </Link>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 md:ml-64 ">
          {/* Server cold-start note */}
          {showServerNote && (
            <div className="mb-4 flex items-start justify-between gap-3 bg-yellow-500/10 border border-yellow-500/40 text-yellow-200 rounded-lg px-4 py-3 text-sm">
              <p>
                ⏳ <span className="font-semibold">Please note:</span> The
                backend is hosted on Render&apos;s free tier, so the first
                request may take <b>30-60 seconds</b> while the server wakes
                up. Subsequent requests will be fast.
              </p>
              <button
                onClick={() => setShowServerNote(false)}
                className="text-yellow-200 hover:text-white text-lg leading-none"
                aria-label="Close note"
              >
                ×
              </button>
            </div>
          )}

          {/* Category Navigation */}
          <div className="hidden md:flex overflow-x-auto pb-4 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`whitespace-nowrap px-4 py-2 mr-3 rounded-full transition-all duration-300 ${
                  activeCategory === category
                    ? "bg-white text-black"
                    : "bg-[#202020] hover:bg-[#303030]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-[#303030] border-t-red-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
              {videos.map((video) => (
                <div
                  key={video._id}
                  onClick={() => handleVideoClick(video._id)}
                  className="bg-[#181818] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-r from-[#202020] to-[#303030] relative overflow-hidden">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        loading="eager"
                        style={{ objectFit: "cover" }}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-20">
                        {formatDuration(video.duration)}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-500 w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 384 512"
                          >
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 flex">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 mr-3 flex-shrink-0 overflow-hidden">
                      <Image
                        src={video.owner.avatar}
                        alt={video.owner.username}
                        className="w-full h-full object-cover"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1 group-hover:text-red-500 transition-colors duration-300 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-[#aaa] text-sm group-hover:text-white transition-colors duration-300">
                        {video.owner.username}
                      </p>
                      <div className="flex items-center text-[#aaa] text-sm">
                        <span>{formatViewCount(video.views)} views</span>
                        <span className="mx-2">•</span>
                        <span>{timeAgo(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}