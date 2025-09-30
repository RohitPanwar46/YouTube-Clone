"use client";
import React, { useEffect, useState } from "react";
import { FiPlay, FiEye, FiUsers, FiClock, FiHeart, FiShare, FiBell } from "react-icons/fi";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";

const Channel = ({ params }) => {
  const { username } = React.use(params);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const [channelId, setChannelId] = useState(null);

  useEffect(() => {
    async function fetchChannelDetails() {
      if(!session){
        return;
      }
      try {
        setLoading(true);
        
        // Fetch channel details
        const channelRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/users/c/${username}`,{
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.accessToken}`
            }
          }
        );
        
        if (!channelRes.ok) {
          throw new Error('Failed to fetch channel details');
        }
        
        const channelData = await channelRes.json();
        setChannel(channelData.data || null);
        setIsSubscribed(channelData.data.isSubscribed || false);
        setChannelId(channelData.data._id || null);
        // Fetch channel videos
        const videosRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/dashboard/videos?channelId=${channelId}`,{
            method: 'GET',
            headers: {
              Authorization: `Bearer ${session.accessToken}`
            }
          }
        );
        
        if (videosRes.ok) {
          const videosData = await videosRes.json();
          setVideos(videosData.data || []);
        } else {
          setVideos([]);
        }
      } catch (err) {
        setError("Failed to load channel details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchChannelDetails();
  }, [username, session, channelId]);

  const handleSubscribe = async () => {
    if (!session) {
      // Redirect to login or show login prompt
      return;
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/subscriptions/c/${channelId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        setIsSubscribed(result.data.IsSubscribed);
        
        // Update subscriber count optimistically
        if (channel) {
          setChannel({
            ...channel,
            subscribers: result.data.IsSubscribed 
              ? channel.subscribers + 1 
              : Math.max(0, channel.subscribers - 1)
          });
        }
      }
    } catch (err) {
      console.error('Error toggling subscription:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <Navbar />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
          <div className="text-center py-16 bg-[#181818] rounded-xl border border-[#303030]">
            <div className="mb-6">
              <FiUsers className="w-16 h-16 text-red-600 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">Error Loading Channel</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Navbar />
      
      {/* Channel Banner */}
      <div className="w-full h-48 md:h-60 bg-gradient-to-r from-red-900 to-red-800 relative overflow-hidden">
        {channel?.coverImage && (
          <Image
            src={channel.coverImage}
            alt="Channel Banner"
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 -mt-16 relative z-10">
        {/* Channel Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-1.5">
            <div className="w-full h-full rounded-full bg-[#303030] overflow-hidden">
              {channel?.avatar ? (
                <Image
                  src={channel.avatar}
                  alt="Channel Avatar"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-red-900 flex items-center justify-center">
                  <span className="text-3xl font-bold">{channel?.username?.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-grow">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{channel?.username}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center">
                <FiUsers className="mr-1" /> 
                {channel?.subscriberCount || 0} subscribers
              </span>
              <span className="flex items-center">
                <FiPlay className="mr-1" /> 
                {videos.length} videos
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  isSubscribed
                    ? 'bg-[#303030] text-white border border-[#404040]'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? (
                  <>
                    <FiBell className="inline mr-2" /> Subscribed
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
              
              <button className="p-2 bg-[#303030] rounded-full hover:bg-[#404040] transition-colors">
                <FiShare className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-6 pb-2 border-b border-[#303030]">Videos</h2>
          
          {videos.length === 0 ? (
            <div className="text-center py-16 bg-[#181818] rounded-xl border border-[#303030]">
              <FiPlay className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos yet</h3>
              <p className="text-gray-400">This channel hasn&apos;t uploaded any videos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <div 
                  key={video._id}
                  className="bg-[#181818] rounded-xl overflow-hidden hover:bg-[#202020] transition-all duration-300 group animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div 
                    className="relative aspect-video bg-[#303030] overflow-hidden cursor-pointer"
                    onClick={() => window.location.href = `/player/${video._id}`}
                  >
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center">
                        <FiPlay className="text-3xl text-white opacity-70" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-xs px-1.5 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="flex items-center mr-3">
                        <FiEye className="mr-1" /> 
                        {video.views?.toLocaleString() || 0}
                      </span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* About Section */}
        {channel?.description && (
          <div className="bg-[#181818] rounded-xl p-6 border border-[#303030]">
            <h2 className="text-xl font-bold mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed">{channel.description}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Channel;