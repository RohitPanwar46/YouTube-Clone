// pages/channels.js
"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getAllChannels, toggleSubscribe, getUserSubscriptions } from "@/app/lib/api";

export default function ChannelsPage() {
  const [subscribed, setSubscribed] = useState({});
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState({}); // Track which channels are being subscribed to
  const router = useRouter();
  const { data: session } = useSession();

  const toggleSubscription = async (channelId) => {
    if (!session || !session.accessToken) {
      return;
    }
    // Set loading state for this specific channel
    setSubscribing((prev) => ({
      ...prev,
      [channelId]: true,
    }));

    try {
      const result = await toggleSubscribe(channelId, session.accessToken);
      
      // Extract subscription status from backend response
      let isSubscribed = false;
      if (result && result.IsSubscribed !== undefined) {
        isSubscribed = result.IsSubscribed;
      }
      
      setSubscribed((prev) => ({
        ...prev,
        [channelId]: isSubscribed,
      }));
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      // Optionally show a toast notification here
    } finally {
      // Clear loading state for this channel
      setSubscribing((prev) => ({
        ...prev,
        [channelId]: false,
      }));
    }
  };

  useEffect(() => {
    const fetchChannelsAndSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all channels (no auth required)
        const channelsData = await getAllChannels();
        
        // Filter out the current user's channel
        const filteredChannels = channelsData.filter(channel => {
          const channelId = channel._id || channel.id;
          const userId = session?.user?.id || session?.user?._id;
          return channelId !== userId;
        });
        
        setChannels(filteredChannels);

        // Fetch user subscriptions if logged in
        if (session?.accessToken && session?.user?.id) {
          try {
            const subscriptions = await getUserSubscriptions(session.user.id, session.accessToken);
            
            if (subscriptions && Array.isArray(subscriptions)) {
              const subscriptionMap = {};
              subscriptions.forEach(sub => {
                // Handle different possible channel ID formats
                let channelId;
                
                if (typeof sub.channel === 'object' && sub.channel !== null) {
                  // If channel is an object, extract the ID
                  channelId = sub.channel._id || sub.channel.id;
                } else {
                  // If channel is a string ID
                  channelId = sub.channel || sub.channelId || sub._id;
                }
                
                if (channelId) {
                  subscriptionMap[channelId] = true;
                }
              });
              setSubscribed(subscriptionMap);
            }
          } catch (subError) {
            console.error('Failed to fetch subscriptions:', subError);
            // Don't set error for subscription fetch failure, just log it
          }
        }
      } catch (err) {
        console.error('Failed to fetch channels:', err);
        setError('Failed to load channels. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when session is loaded (not null)
    if (session !== undefined) {
      fetchChannelsAndSubscriptions();
    }
  }, [session]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0f0f0f] mt-14">
        <Head>
          <title>Modern Channels | StreamHub</title>
          <meta
            name="description"
            content="Browse and subscribe to modern channels"
          />
          {/* Custom font links moved to _document.js for global loading */}
        </Head>

        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600 mb-4">
              Discover Channels
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Explore our curated selection of content creators and find your
              next favorite channel
            </p>
          </header>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-300">Loading channels...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.map((channel) => (
              <div
                key={channel._id || channel.id}
                className="relative bg-[#181818] bg-opacity-50 rounded-xl overflow-hidden hover:bg-[#202020] transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn group"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <div className="absolute inset-0 bg-gradient-to-b f"></div>

                <div className="px-6 pb-6 pt-3 relative z-10">
                  <div className="flex items-center justify-center mb-4 cursor-pointer"
                    onClick={() =>{router.push(`/subscriptions/${channel._id || channel.id}`)}}
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                      <Image
                        src={channel.avatar || '/default-avatar.png'}
                        alt={channel.username || channel.name}
                        width={40}
                        height={40}
                        className="rounded-full w-full h-full object-cover"
                        unoptimized
                        priority
                      />
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-center text-white mb-2 cursor-pointer"
                    onClick={() =>{router.push(`/subscriptions/${channel._id || channel.id}`)}}
                  >
                    {channel.username || channel.name}
                  </h2>

                  <button
                    onClick={() => toggleSubscription(channel._id || channel.id)}
                    disabled={subscribing[channel._id || channel.id]}
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      subscribing[channel._id || channel.id]
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white cursor-not-allowed opacity-75"
                        : subscribed[channel._id || channel.id]
                        ? "bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg shadow-green-500/20"
                        : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-500/30"
                    }`}
                  >
                    {subscribing[channel._id || channel.id] ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : subscribed[channel._id || channel.id] ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Subscribed
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {!loading && !error && channels.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-900/20 border border-gray-600/30 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-gray-400">No channels found.</p>
              </div>
            </div>
          )}

          <style jsx global>{`
            body {
              font-family: "Poppins", sans-serif;
            }

            @keyframes gradient {
              0% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
              }
            }

            .bg-gradient-to-br {
              background-size: 200% 200%;
              animation: gradient 15s ease infinite;
            }
          `}</style>
        </div>
      </div>
      <footer className="text-center my-4 pt-4 border-t border-gray-800 text-gray-500">
        <p>© 2025 Modern Channels. All rights reserved. Creator Rohit Panwar.</p>
      </footer>
    </>
  );
}
