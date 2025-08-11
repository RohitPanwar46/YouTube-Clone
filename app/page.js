"use client"
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import {apiRequest, API_ENDPOINTS} from './lib/api';
import Image from 'next/image';

// Icons component
const Icons = () => (
  <div style={{ display: 'none' }}>
    {/* YouTube Logo */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
    </svg>
    
    {/* Search Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
    </svg>
    
    {/* Menu Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
    </svg>
    
    {/* Home Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
      <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
    </svg>
    
    {/* Fire Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 85.96 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"/>
    </svg>
    
    {/* Compass Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31l-55.5 144.3c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
    </svg>
    
    {/* Folder Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"/>
    </svg>
    
    {/* Clock Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
    </svg>
    
    {/* Thumbs Up Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
    </svg>
    
    {/* Bell Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3S207 512 224 512s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/>
    </svg>
    
    {/* User Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
    </svg>
    
    {/* Play Icon */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
    </svg>
  </div>
);

export default function YouTubeHome() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const sidebarItems = [
    { icon: 'home', text: 'Home' },
    { icon: 'fire', text: 'Trending' },
    { icon: 'compass', text: 'Explore' },
    { icon: 'folder', text: 'Subscriptions' },
    { separator: true },
    { icon: 'photo-video', text: 'Library' },
    { icon: 'history', text: 'History' },
    { icon: 'clock', text: 'Watch later' },
    { icon: 'thumbs-up', text: 'Liked videos' },
    { separator: true },
    { title: 'Subscriptions' },
    { icon: 'circle', color: 'text-red-400', text: 'Tech Insider' },
    { icon: 'circle', color: 'text-green-400', text: 'Nature World' },
    { icon: 'circle', color: 'text-blue-400', text: 'Film Theory' },
    { icon: 'circle', color: 'text-yellow-400', text: 'Gaming Central' },
  ];

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Video data
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const result = await apiRequest(API_ENDPOINTS.GETVIDEOS, { method: 'GET', credentials: "include" });
        setVideos(result.data.videos);
        console.log('Fetched videos:', result);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };
    fetchVideos();
  }, []);

  const categories = [
    'All', 'Gaming', 'Music', 'Live', 'JavaScript', 'React', 
    'Podcasts', 'Comedy', 'Recently uploaded', 'Watched'
  ];



  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 576 512">
            <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
          </svg>
        );
      case 'fire':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 384 512">
            <path d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 85.96 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"/>
          </svg>
        );
      case 'compass':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm50.7-186.9L162.4 380.6c-19.4 7.5-38.5-11.6-31-31l55.5-144.3c3.3-8.5 9.9-15.1 18.4-18.4l144.3-55.5c19.4-7.5 38.5 11.6 31 31l-55.5 144.3c-3.2 8.5-9.9 15.1-18.4 18.4zM288 256a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M64 480H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H288c-10.1 0-19.6-4.7-25.6-12.8L243.2 57.6C231.1 41.5 212.1 32 192 32H64C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64z"/>
          </svg>
        );
      case 'photo-video':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 640 512">
            <path d="M64 256V160H224v96H64zm0 64H224v96H64V320zm224 96V320H576v96H288zM576 256H288V160H576v96zM0 128C0 92.7 28.7 64 64 64H576c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/>
          </svg>
        );
      case 'history':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"/>
          </svg>
        );
      case 'clock':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"/>
          </svg>
        );
      case 'thumbs-up':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
          </svg>
        );
      case 'circle':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 512 512">
            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/>
          </svg>
        );
      default:
        return null;
    }
  };



  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <Icons />

      {/* Navbar Component */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-16 flex">
        {/* Sidebar - Always Visible */}
        <aside className="fixed top-16 bottom-0 bg-[#0f0f0f] w-64 z-40 overflow-y-auto">
          <div className="py-4">
            {sidebarItems.map((item, index) => (
              item.separator ? (
                <div key={index} className="h-px bg-[#303030] my-3 mx-4"></div>
              ) : item.title ? (
                <div key={index} className="px-6 py-2 text-xs uppercase text-[#aaa] tracking-wider">
                  {item.title}
                </div>
              ) : (
                <div 
                  key={index}
                  className="flex items-center px-6 py-3 cursor-pointer hover:bg-[#181818] transition-all duration-300 group"
                >
                  <div className={`w-6 mr-4 ${item.color || 'text-white'} group-hover:text-red-500 transition-colors duration-300`}>
                    {getIcon(item.icon)}
                  </div>
                  <span className="group-hover:text-white transition-colors duration-300">{item.text}</span>
                </div>
              )
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 ml-64">
          {/* Category Navigation */}
          <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`whitespace-nowrap px-4 py-2 mr-3 rounded-full transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-white text-black' 
                    : 'bg-[#202020] hover:bg-[#303030]'
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map(video => (
                <div 
                  key={video._id}
                  className="bg-[#181818] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-r from-[#202020] to-[#303030] relative overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-20">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-500 w-14 h-14 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 384 512">
                            <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
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
                      <div className="flex text-[#aaa] text-sm">
                        <span>{video.views} views</span>
                        <span className="mx-2">•</span>
                        <span>{video.createdAt}</span>
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