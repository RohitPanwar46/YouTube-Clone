"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  FiEye,
  FiUsers,
  FiVideo,
  FiThumbsUp,
  FiTrendingUp,
  FiUpload,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [channelStats, setChannelStats] = useState(null);
  const [channelVideos, setChannelVideos] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Calculate top performing videos based on views
  const topPerformingVideos = useMemo(() => {
    if (!channelVideos.length) return [];

    const videos = [...channelVideos];

    // Sort by performance score
    return videos
      .sort((a, b) => {
        const aScore = a.views;
        const bScore = b.views;
        return bScore - aScore;
      })
      .slice(0, 4); // Get top 4 videos
  }, [channelVideos]);

  // Fetch data from API
  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user data
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/users/get-user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const userData = await userResponse.json();
        if (userData.statusCode === 200) {
          setUserData(userData.data);
        }

        // Fetch channel stats
        const statsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/dashboard/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const statsData = await statsResponse.json();
        if (statsData.statusCode === 200) {
          setChannelStats(statsData.data);
        }

        // Fetch channel videos
        const videosResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/dashboard/videos`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const videosData = await videosResponse.json();
        if (videosData.statusCode === 200) {
          setChannelVideos(videosData.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, router]);

  const handleVideoDelete = async (videoId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos/${videoId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      if (!response.ok) {
        console.error(response)
      }
      console.log("response of deleted video: ", await response.json());
      setChannelVideos((prevVideos) => prevVideos.filter((video) => video._id !== videoId));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0f0f0f] text-white pt-20">
        {/* Cover Image */}
        {userData?.coverImage && (
          <div className="h-68 w-full relative overflow-hidden rounded-2xl">
            <Image
              src={userData.coverImage}
              alt="Cover"
              fill
              className="object-cover object-center z-10"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner with Channel Info */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-900 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-900 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

            <div className="flex items-center mb-4 relative z-10">
              {userData?.avatar && (
                <div className="w-16 h-16 rounded-full mr-4 border-2 border-white overflow-hidden">
                  <Image
                    src={userData.avatar}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">
                  Welcome back, {userData?.fullName || "Creator"}!
                </h2>
                <p className="text-red-100">@{userData?.username}</p>
              </div>
            </div>
            <p className="text-red-100 relative z-10">
              Your channel is growing fast! You gained{" "}
              {channelStats?.totalSubscribers || 0} subscribers in the last 28
              days.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<FiUsers className="text-2xl" />}
              title="Subscribers"
              value={channelStats?.totalSubscribers?.toLocaleString() || "0"}
              change={channelStats?.subscriberChange || 0}
              isPositive={channelStats?.subscriberChange >= 0}
            />
            <StatCard
              icon={<FiEye className="text-2xl" />}
              title="Total Views"
              value={channelStats?.totalViews?.toLocaleString() || "0"}
              change={channelStats?.viewChange || 0}
              isPositive={channelStats?.viewChange >= 0}
            />
            <StatCard
              icon={<FiVideo className="text-2xl" />}
              title="Videos"
              value={channelStats?.totalVideos?.toLocaleString() || "0"}
              change={channelStats?.videoChange || 0}
              isPositive={channelStats?.videoChange >= 0}
            />
            <StatCard
              icon={<FiThumbsUp className="text-2xl" />}
              title="Total Likes"
              value={channelStats?.totalLikes?.toLocaleString() || "0"}
              change={channelStats?.likeChange || 0}
              isPositive={channelStats?.likeChange >= 0}
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-[#303030] mb-6">
            <nav className="flex space-x-8">
              {["overview", "content", "comments", "earnings"].map((tab) => (
                <button
                  key={tab}
                  className={`py-4 px-1 font-medium text-sm border-b-2 transition-all duration-300 ${
                    activeTab === tab
                      ? "border-red-600 text-white"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* All Videos */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Videos</h3>
                <button
                  onClick={() => router.push("/upload")}
                  className="flex items-center cursor-pointer text-red-500 hover:text-red-400 transition-colors"
                >
                  <FiUpload className="mr-1" /> Upload New
                </button>
              </div>

              {channelVideos.length > 0 ? (
                <div className="space-y-4">
                  {channelVideos.map((video) => (
                    <div
                      key={video._id}
                      className="bg-[#181818] rounded-xl p-4 flex hover:bg-[#202020] transition-all duration-300 animate-fadeIn"
                    >
                      <div
                        onClick={() => router.push(`/player/${video._id}`)}
                        className="w-32 h-20 cursor-pointer bg-[#303030] rounded-md mr-4 flex-shrink-0 overflow-hidden relative"
                      >
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium mb-1 line-clamp-1">
                          {video.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-400">
                          <span className="flex items-center mr-4">
                            <FiEye className="mr-1" />{" "}
                            {video.views?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center">
                            <FiTrendingUp className="mr-1" />{" "}
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Dropdown Menu */}
                      <div className="relative group">
                        <button className="p-2 rounded-full hover:bg-[#303030] transition-colors">
                          <FiMoreVertical className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Dropdown Content */}
                        <div className="absolute right-0 top-10 w-48 bg-[#282828] rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                          <button
                            className="w-full px-4 py-3 text-sm flex items-center hover:bg-[#3D3D3D] transition-colors"
                            onClick={() => {
                              router.push(`/edit/${video._id}`);
                            }}
                          >
                            <FiEdit2 className="mr-3 text-gray-300" />
                            Edit
                          </button>
                          <button
                            className="w-full px-4 py-3 text-sm flex items-center hover:bg-[#3D3D3D] transition-colors text-red-500"
                            onClick={() => {
                              handleVideoDelete(video._id);
                            }}
                          >
                            <FiTrash2 className="mr-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#181818] rounded-xl p-8 text-center">
                  <FiVideo className="text-4xl text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">No videos yet</h4>
                  <p className="text-gray-400 mb-4">
                    Start uploading content to grow your channel
                  </p>
                  <button
                    onClick={() => router.push("/upload")}
                    className="bg-red-600 hover:bg-red-700 py-2 px-4 rounded-lg transition-colors"
                  >
                    Upload Your First Video
                  </button>
                </div>
              )}
            </div>

            {/* Right Sidebar - Expanded Top Performing Videos */}
            <div className="space-y-6">
              {/* Top Performing Videos - Expanded */}
              <div className="bg-[#181818] rounded-xl p-6 animate-fadeIn">
                <h3 className="text-lg font-medium mb-4">
                  Top Performing Videos
                </h3>
                <div className="space-y-4">
                  {topPerformingVideos.length > 0 ? (
                    topPerformingVideos.map((video, index) => (
                      <div
                        key={video._id}
                        className="flex items-center p-3 bg-[#202020] rounded-lg hover:bg-[#252525] transition-colors"
                      >
                        <div className="w-16 h-12 bg-[#303030] rounded-md mr-3 flex-shrink-0 overflow-hidden relative">
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-xs px-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium line-clamp-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <span className="flex items-center mr-3">
                              <FiEye className="mr-1" />{" "}
                              {video.views?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                        <div className="text-green-500 text-sm font-medium">
                          {index === 0
                            ? "🔥"
                            : index === 1
                            ? "⭐"
                            : index === 2
                            ? "🚀"
                            : "👍"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FiVideo className="text-3xl mx-auto mb-2" />
                      <p>No performance data yet</p>
                    </div>
                  )}
                </div>

                {/* Performance Metrics Summary */}
                {topPerformingVideos.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#303030]">
                    <h4 className="text-sm font-medium mb-3">
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#202020] p-2 rounded">
                        <div className="text-gray-400">Total Views</div>
                        <div className="font-medium">
                          {topPerformingVideos
                            .reduce((sum, video) => sum + (video.views || 0), 0)
                            .toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#202020] p-2 rounded">
                        <div className="text-gray-400">Total Likes</div>
                        <div className="font-medium">
                          {channelStats?.totalLikes?.toLocaleString() || "0"}
                        </div>
                      </div>
                      <div className="bg-[#202020] p-2 rounded">
                        <div className="text-gray-400">Avg. Views</div>
                        <div className="font-medium">
                          {Math.round(
                            topPerformingVideos.reduce(
                              (sum, video) => sum + (video.views || 0),
                              0
                            ) / topPerformingVideos.length
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
            animation: fadeIn 0.5s ease-out;
          }
        `}</style>
      </div>
    </>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value }) => {
  return (
    <div className="bg-[#181818] rounded-xl p-6 hover:bg-[#202020] transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-red-500/10 rounded-lg">{icon}</div>
        <span className={`flex items-center text-sm text-green-500`}>
          <FiTrendingUp className={`mr-1`} />
          100%
        </span>
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-gray-400 text-sm">{title}</p>
    </div>
  );
};

export default Dashboard;
