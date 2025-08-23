"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FiThumbsUp, FiThumbsDown, FiShare2, FiSave, FiMoreHorizontal, 
  FiMessageSquare, FiSend, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { apiRequest } from '@/app/lib/api';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const Player = ({ params }) => {
  const { videoId } = React.use(params);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  const {data: session} = useSession();

  // Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await apiRequest(`/api/v1/videos/${videoId}`, { method: "GET" });
        setVideo(response.data);
        console.log("Video fetched:", response.data);
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    fetchVideo();
  }, [videoId]);

  // Fetch likes count
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const userId = session ? session?.user?.id : null;
        const response = await apiRequest(`/api/v1/likes/count/${videoId}?userId=${userId}`, { method: "GET"});
        console.log("Likes count response:", response);
        setIsLiked(response.data.likedByUser);
        setLikeCount(response.data.likesCount);
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [videoId, session]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await apiRequest(`/api/v1/comments/${videoId}?page=${currentPage}&limit=10`, { 
          method: "GET" 
        });
        setComments(response.data.comments || []);
        setTotalComments(response.data.total || 0);
        console.log("Comments fetched:", response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [videoId, currentPage]);

  // Toggle like video
  const handleLike = async () => {
    if (isDisliked) {
      setIsDisliked(false);
    }
      try {
        const response = await apiRequest(`/api/v1/likes/toggle/v/${videoId}`, {
          method: "POST",
          credentials: "include"
        });
        if (response.data === "liked") {
          setIsLiked(true);
          setLikeCount(likeCount + 1);
        } else {
          setIsLiked(false);
          setLikeCount(likeCount - 1);
        }
      } catch (error) {
        if (error.message === "Unauthorized reqest"){
          router.push('/login');
        }
        console.error("Error liking video:", error);
      }
  };

  // Toggle dislike video
  const handleDislike = async () => {
    if (isLiked) {
      setIsDisliked(!isDisliked);
      handleLike();
    } else {
      setIsDisliked(!isDisliked);
    }
  };

  // Toggle subscribe
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    // In a real app, you would make an API call here
  };

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await apiRequest(`/api/v1/comments/${videoId}`, {
        method: "POST",
        body: JSON.stringify({ content: newComment })
      });

      // Optimistically update UI
      const newCommentObj = {
        ...response.data,
        owner: { 
          username: "You", 
          avatar: session?.user?.avatar || "/default-avatar.png" 
        }
      };

      setComments(prev => [newCommentObj, ...prev]);
      setTotalComments(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Start editing a comment
  const startEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingComment(null);
    setEditCommentText('');
  };

  // Update comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      await apiRequest(`/api/v1/comments/${commentId}`, {
        method: "PUT",
        body: JSON.stringify({ content: editCommentText })
      });

      // Update UI
      setComments(prev => prev.map(comment => 
        comment._id === commentId ? { ...comment, content: editCommentText } : comment
      ));
      cancelEdit();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await apiRequest(`/api/v1/comments/${commentId}`, { method: "DELETE" });
      
      // Update UI
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      setTotalComments(prev => prev - 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Toggle like on comment
  const handleLikeComment = async (commentId) => {
    try {
      // Optimistically update UI
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          const wasLiked = comment.isLiked;
          return {
            ...comment,
            isLiked: !wasLiked,
            likes: wasLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));

      // Make API call
      if (comments.find(c => c._id === commentId).isLiked) {
        await apiRequest(`/api/v1/comments/${commentId}/unlike`, { method: "POST" });
      } else {
        await apiRequest(`/api/v1/comments/${commentId}/like`, { method: "POST" });
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Revert UI on error
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  if (!video) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="w-16 h-16 border-4 border-[#303030] border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-[#0f0f0f] mt-12 text-white min-h-screen">
        {/* Video Player Section */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
          <div className="w-full lg:w-8/12">
            {/* Video Player */}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
              <video 
                ref={videoRef}
                src={video.videoFile} 
                controls 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Title */}
            <h1 className="text-xl font-bold mt-4">{video.title}</h1>

            {/* Video Stats and Actions */}
            <div className="flex flex-wrap items-center justify-between mt-3 pb-4 border-b border-[#303030]">
              <div className="text-gray-400 text-sm">
                {formatViewCount(video.views || 0)} views • {formatDate(video.createdAt)}
              </div>
              
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                {/* Like Button */}
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${isLiked ? 'bg-[#272727] text-red-500' : 'hover:bg-[#272727] text-gray-300'}`}
                >
                  <FiThumbsUp className="text-lg" />
                  <span>{formatViewCount(likeCount)}</span>
                </button>
                
                {/* Dislike Button */}
                <button 
                  onClick={handleDislike}
                  className={`flex items-center gap-1 px-4 py-2 rounded-full ${isDisliked ? 'bg-[#272727] text-blue-500' : 'hover:bg-[#272727] text-gray-300'}`}
                >
                  <FiThumbsDown className="text-lg" />
                </button>
                
                {/* Share Button */}
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#272727] text-gray-300">
                  <FiShare2 className="text-lg" />
                  <span>Share</span>
                </button>
                
                {/* Save Button */}
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#272727] text-gray-300">
                  <FiSave className="text-lg" />
                  <span>Save</span>
                </button>
                
                {/* More Button */}
                <button className="p-2 rounded-full hover:bg-[#272727] text-gray-300">
                  <FiMoreHorizontal className="text-lg" />
                </button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center justify-between py-4 border-b border-[#303030]">
              <div className="flex items-center gap-3">
                <Image 
                  src={video.owner?.avatar || "/default-avatar.png"} 
                  alt={video.owner?.username}
                  height={48}
                  width={48}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold">{video.owner?.username}</h3>
                  <p className="text-gray-400 text-sm">100K subscribers</p>
                </div>
              </div>
              
              <button 
                onClick={handleSubscribe}
                className={`px-4 py-2 rounded-full font-medium ${isSubscribed ? 'bg-[#303030] text-white' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Video Description */}
            <div className={`mt-4 bg-[#181818] rounded-lg p-4 ${showAllDescription ? '' : 'max-h-24 overflow-hidden'}`}>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <span>{formatViewCount(video.views || 0)} views</span>
                <span className="mx-2">•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>
              <p className="whitespace-pre-line">
                {video.description}
              </p>
              <button 
                onClick={() => setShowAllDescription(!showAllDescription)}
                className="mt-2 text-sm font-medium text-gray-400 hover:text-white"
              >
                {showAllDescription ? "Show less" : "Show more"}
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{totalComments} Comments</h2>
                <div className="flex items-center text-sm text-gray-400">
                  <span>Sort by</span>
                  <button className="ml-2 flex items-center font-medium text-white">
                    Top comments <FiChevronDown className="ml-1" />
                  </button>
                </div>
              </div>

              {/* Add Comment */}
              <div className="flex gap-3 mb-6">
                <Image
                  src={session?.user?.avatar || "/default-avatar.png"}
                  alt="Your avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <form onSubmit={handleAddComment} className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-[#303030] pb-2 pr-10 focus:outline-none focus:border-white transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={!newComment.trim()}
                      className={`absolute right-2 bottom-2 ${newComment.trim() ? 'text-white' : 'text-gray-600'}`}
                    >
                      <FiSend />
                    </button>
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment._id} className="flex gap-3">
                    <Image
                      src={comment.owner?.avatar || "/default-avatar.png"}
                      alt={comment.owner?.username}
                      width={40}
                      height={40}
                      className="rounded-full h-10 w-10"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{comment.owner?.username}</h4>
                        <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      </div>
                      
                      {editingComment === comment._id ? (
                        <div className="mt-1">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full bg-[#181818] border border-[#303030] rounded px-3 py-2 focus:outline-none focus:border-red-500"
                            rows="3"
                          />
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => handleUpdateComment(comment._id)}
                              className="px-3 py-1 bg-red-600 rounded text-sm"
                            >
                              Save
                            </button>
                            <button 
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-[#303030] rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-1">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <button 
                              onClick={() => handleLikeComment(comment._id)}
                              className={`flex items-center gap-1 text-sm ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
                            >
                              <FiThumbsUp />
                              <span>{formatViewCount(comment.likes || 0)}</span>
                            </button>
                            <button className="text-gray-400 hover:text-white text-sm">
                              Reply
                            </button>
                            
                            {/* Comment owner actions */}
                            {comment.owner?.username === "You" && (
                              <div className="flex gap-3 ml-auto">
                                <button 
                                  onClick={() => startEditComment(comment)}
                                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                                >
                                  <FiEdit2 size={14} /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                                >
                                  <FiTrash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalComments > 10 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-[#303030] text-gray-500' : 'bg-[#272727] hover:bg-[#3a3a3a]'}`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, Math.ceil(totalComments / 10)) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded ${currentPage === page ? 'bg-red-600' : 'bg-[#272727] hover:bg-[#3a3a3a]'}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalComments / 10), prev + 1))}
                      disabled={currentPage === Math.ceil(totalComments / 10)}
                      className={`px-4 py-2 rounded ${currentPage === Math.ceil(totalComments / 10) ? 'bg-[#303030] text-gray-500' : 'bg-[#272727] hover:bg-[#3a3a3a]'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Suggested Videos Sidebar */}
          <div className="w-full lg:w-4/12 mt-8 lg:mt-0">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 cursor-pointer hover:bg-[#181818] p-2 rounded-lg transition-colors">
                  <div className="w-40 h-24 bg-[#181818] rounded-lg overflow-hidden">
                    <Image
                      src="http://res.cloudinary.com/rohitstore/image/upload/v1754325236/g9ih8sd1hlzqhku3fpv5.png"
                      alt="Thumbnail"
                      width={160}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-2">How to Build a YouTube Clone with Next.js</h4>
                    <p className="text-sm text-gray-400 mt-1">Web Dev Simplified</p>
                    <div className="text-xs text-gray-500 mt-1">250K views • 2 days ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Player;