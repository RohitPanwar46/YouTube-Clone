"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "../lib/api";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";


const Page = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const title = params.title;

  useEffect(() => {
    const fetchVideos = async () => {
      // fetching videos
      try {
        const data = await apiRequest(`api/v1/videos?query=${title}`, {
          method: "GET",
        });
        setVideos(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [title]);

  return (
    <div>
      <Navbar />
      {/* Video Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-[#303030] border-t-red-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
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
                    <span>{video.views} views</span>
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
  );
};

export default Page;
