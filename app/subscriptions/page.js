"use client";
import React, { useState, useEffect } from 'react';
import { FiPlay, FiSearch, FiHeart, FiEye, FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

const SubscriptionsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [allChannels, setAllChannels] = useState([]);
  const { data: session } = useSession();
  const [subscriptionBtnLoading, setSubscriptionBtnLoading] = useState(false);
  const router = useRouter();
  // Calculate unsubscribed channels
  const unsubscribedChannels = allChannels.filter(
    channel => !subscribedChannels.some(subscribed => subscribed._id === channel._id)
  );

  // Fetch subscribed channels and their videos
  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;
      
      try {
        setLoading(true);
        
        // Fetch user's subscribed channels
        const subscribedResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/subscriptions/u/${session.user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`
            }
          }
        );
        
        if (!subscribedResponse.ok) {
          throw new Error('Failed to fetch subscribed channels');
        }
        
        const subscribedData = await subscribedResponse.json();
        const channelsWithVideos = await Promise.all(
          subscribedData.data.map(async (subscription) => {
            // Fetch videos for each channel
            const videosResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos?userId=${subscription.channel._id}&limit=3`
            );
            
            if (videosResponse.ok) {
              const videosData = await videosResponse.json();
              return {
                ...subscription.channel,
                videos: videosData.data.videos || []
              };
            }
            
            return {
              ...subscription.channel,
              videos: []
            };
          })
        );
        
        setSubscribedChannels(channelsWithVideos);
        
        // Fetch all channels for browsing
        const allChannelsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/subscriptions/all/channels`
        );
        
        if (allChannelsResponse.ok) {
          const allChannelsData = await allChannelsResponse.json();
          allChannelsData.data = allChannelsData.data.filter(ch => ch._id !== session.user.id); // Exclude self
          setAllChannels(allChannelsData.data || []);
        }
        
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Toggle subscription for a channel
  const toggleSubscription = async (channelId) => {
    if (!session) return;
    
    try {
      setSubscriptionBtnLoading(true);
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
        
        if (result.data.IsSubscribed) {
          // Add to subscribed channels
          const channelToAdd = allChannels.find(ch => ch._id === channelId);
          if (channelToAdd) {
            // Fetch videos for the newly subscribed channel
            const videosResponse = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos?userId=${channelId}&limit=3`
            );
            
            let videos = [];
            if (videosResponse.ok) {
              const videosData = await videosResponse.json();
              videos = videosData.data.videos || [];
            }
            
            setSubscribedChannels(prev => [...prev, { ...channelToAdd, videos }]);
          }
        } else {
          // Remove from subscribed channels
          setSubscribedChannels(prev => prev.filter(ch => ch._id !== channelId));
        }
        setSubscriptionBtnLoading(false);
      }
    } catch (err) {
      setSubscriptionBtnLoading(false);
      console.error('Error toggling subscription:', err);
    }
  };

  const filteredChannels = subscribedChannels.filter(channel => {
    if (activeTab === 'new' && channel.videos.length === 0) return false;
    
    return channel.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           channel.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
              <FiHeart className="w-16 h-16 text-red-600 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">Error Loading Subscriptions</h3>
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
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
            Your Subscriptions
          </h1>
          <p className="text-gray-400">Latest videos from channels you follow</p>
        </header>

        {/* Tabs and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex space-x-1 bg-[#181818] p-1 rounded-lg">
            {['all', 'new'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'all' ? 'All Channels' : 'New Videos'}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              className="w-full pl-10 pr-4 py-2 bg-[#181818] border border-[#303030] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Subscribed Channels */}
        {filteredChannels.length > 0 ? (
          <div className="space-y-6">
            {filteredChannels.map((channel, index) => (
              <div 
                key={channel._id}
                className="bg-[#181818] rounded-xl p-4 md:p-6 border border-[#303030] hover:border-red-900 transition-all duration-500 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Channel Header */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-0.5">
                    <div onClick={() => router.push(`/channels/${channel.username}`)} className="w-full h-full cursor-pointer rounded-full bg-[#303030] overflow-hidden">
                      {channel.avatar ? (
                        <Image
                          src={channel.avatar}
                          alt={channel.username}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-red-900 flex items-center justify-center">
                          <span className="text-lg font-bold">{channel.username?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-grow">
                    <h2 className="font-bold">{channel.username}</h2>
                    <p className="text-sm text-gray-400">@{channel.username}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleSubscription(channel._id)}
                    className={`bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full text-sm transition-colors ${subscriptionBtnLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={subscriptionBtnLoading}
                  >
                    {subscriptionBtnLoading ? 'Processing...' : 'Unsubscribe'}
                  </button>
                </div>

                {/* Videos Grid */}
                {channel.videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {channel.videos.map(video => (
                      <div 
                        key={video._id}
                        className="bg-[#202020] rounded-lg overflow-hidden hover:bg-[#252525] transition-all duration-300 group cursor-pointer"
                        onClick={() => window.location.href = `/player/${video._id}`}
                      >
                        <div className="relative aspect-video bg-[#303030] overflow-hidden">
                          {/* Thumbnail */}
                          {video.thumbnail ? (
                            <Image
                              src={video.thumbnail}
                              alt={video.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center">
                              <FiPlay className="text-3xl text-white opacity-70" />
                            </div>
                          )}
                          
                          {/* Duration */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-xs px-1.5 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-medium line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                            {video.title}
                          </h3>
                          <div className="flex items-center text-xs text-gray-400">
                            <span className="flex items-center mr-3">
                              <FiEye className="mr-1" size={12} />
                              {video.views}
                            </span>
                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiPlay className="text-3xl mx-auto mb-2" />
                    <p>No videos from this channel yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16 bg-[#181818] rounded-xl border border-[#303030]">
            <div className="mb-6">
              <FiHeart className="w-16 h-16 text-gray-600 mx-auto" />
            </div>
            <h3 className="text-xl font-medium mb-2">
              {activeTab === 'all' 
                ? 'No subscriptions yet' 
                : 'No new videos'}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-6">
              {activeTab === 'all' 
                ? 'Subscribe to your favorite channels to see their latest videos here.' 
                : 'When channels you subscribe to upload new videos, they will appear here.'}
            </p>
            
            {/* Browse Unsubscribed Channels Section */}
            {unsubscribedChannels.length > 0 && (
              <div className="mt-10">
                <h4 className="text-lg font-medium mb-4">Discover Channels</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {unsubscribedChannels.slice(0, 8).map(channel => (
                    <div key={channel._id} className="text-center group">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-700 p-0.5 mx-auto mb-2 relative">
                        <div onClick={() => router.push(`/channels/${channel.username}`)} className="w-full h-full cursor-pointer rounded-full bg-[#303030] overflow-hidden">
                          {channel.avatar ? (
                            <Image
                              src={channel.avatar}
                              alt={channel.username}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-red-900 flex items-center justify-center">
                              <span className="text-lg font-bold">{channel.username?.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => toggleSubscription(channel._id)}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium truncate">{channel.username}</p>
                      <button
                        onClick={() => toggleSubscription(channel._id)}
                        className={`mt-2 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors ${subscriptionBtnLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={subscriptionBtnLoading}
                      >
                        {subscriptionBtnLoading ? 'Processing...' : 'Subscribe'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default SubscriptionsPage;