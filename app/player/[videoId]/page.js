"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiSave,
  FiSend,
  FiEdit2,
  FiTrash2,
  FiChevronDown
} from "react-icons/fi";
import {
  apiRequest,
  toggleVideoLike,
  addView,
  toggleSubscribe,
  getChannelSubscribers,
  addComment,
  updateComment,
  deleteComment
  } from "@/app/lib/api";
import Navbar from "@/components/Navbar";
import ShareMenu from "@/components/shareMenu";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SaveMenu from "@/components/saveMenu";

const Player = ({ params }) => {
  const { videoId } = React.use(params);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [likeCount, setLikeCount] = useState(0);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const videoRef = useRef(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [descriptionHeight, setDescriptionHeight] = useState(0);
  const descriptionRef = useRef(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const shareMenuRef = useRef(null);
  const shareBtnRef = useRef(null);
  const saveMenuRef = useRef(null);
  const saveBtnRef = useRef(null);

  // Measure description height when component mounts or video changes
  useEffect(() => {
    if (descriptionRef.current) {
      setDescriptionHeight(descriptionRef.current.scrollHeight);
    }
  }, [video]);

  // Add view on video
  useEffect(() => {
    const increaseViewCount = async () => {
      try {
        const res = await addView(videoId);
      } catch (error) {
        console.error("Error adding view:", error);
      }
    };

    if (video) {
      increaseViewCount();
    }
  },[video,videoId]);

  // Fetch video details
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await apiRequest(`/api/v1/videos/${videoId}`, {
          method: "GET",
        });
        setVideo(response.data);
        console.log("Video fetched:", response.data);
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    fetchVideo();
  }, [videoId]);

  //fetch channel subscribers
  useEffect(() => {
    const fetchSubscribers = async () => {
  try {
    const userId = session?.user?.id ?? null;
    const response = await getChannelSubscribers(video.owner._id, userId);
    console.log("response of get subscribers: ", response);

    // normalize array from response
    const arr = Array.isArray(response)
      ? response
      : Array.isArray(response?.subscribers)
      ? response.subscribers
      : [];

    // update count (use response.count if provided, else fallback to array length)
    setSubscribersCount(typeof response?.count === "number" ? response.count : arr.length);

    if (!userId || arr.length === 0) {
      setIsSubscribed(false);
      return;
    }

    const found = arr.some(item => String(item?.subscriber) === String(userId));
    setIsSubscribed(found);
  } catch (error) {
    console.error("Error fetching channel subscribers:", error);
  }
};


    if (video) {
      fetchSubscribers();
    }
  }, [video,session]);

  // Fetch likes count
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const userId = session ? session?.user?.id : null;
        const response = await apiRequest(
          `/api/v1/likes/count/${videoId}?userId=${userId}`,
          { method: "GET" }
        );
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
        const response = await apiRequest(
          `/api/v1/comments/${videoId}?page=${currentPage}&limit=10`,
          {
            method: "GET",
          }
        );
        setComments(response.data.comments || []);
        setTotalComments(response.data.total || 0);
        console.log("Comments fetched:", response.data.comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [videoId, currentPage, comments]);

  // Close share menu when clicking outside
  useEffect(() => {
  function handleClickOutside(event) {
      if ((shareMenuRef.current && !shareMenuRef.current.contains(event.target)) && (shareBtnRef.current && !shareBtnRef.current.contains(event.target))) {
      setIsShareMenuOpen(false);
      }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close save menu on clicking outside
  useEffect(() => {
  function handleClickOutside(event) {
      if ((saveMenuRef.current && !saveMenuRef.current.contains(event.target)) && (saveBtnRef.current && !saveBtnRef.current.contains(event.target))) {
      setIsSaveMenuOpen(false);
      }
  }

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle like video
  const handleLike = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (isDisliked) {
      setIsDisliked(false);
    }
    try {
      const response = await toggleVideoLike(
        "/api/v1/likes/toggle/v",
        videoId,
        session?.accessToken
      );
      console.log("Like toggle response:", response);
      if (response.data === "liked") {
        setIsLiked(true);
        setLikeCount(likeCount + 1);
      } else if (response.data === "unliked") {
        setIsLiked(false);
        setLikeCount(likeCount - 1);
      }
    } catch (error) {
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
  const handleSubscribe = async () => {
    if(!session){
      router.push("/login")
    }
    try {
      const response = await toggleSubscribe(video.owner._id, session.accessToken);
      console.log("response of toggle subscribe: ", response)
      if (response.IsSubscribed) {
        setIsSubscribed(true);
        setSubscribersCount(subscribersCount + 1);
      }else{
        setIsSubscribed(false);
        setSubscribersCount(subscribersCount - 1);
      }

    } catch (error) {
      console.error("error in toggle subscribe: ",error)
    }
    
  };

  // Add new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!session){
      router.push("/login")
      return;
    }
    try {
      const response = await addComment(newComment, video._id, session.accessToken);
      console.log("comment adding response: ", response)

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Start editing a comment
  const startEditComment = async (comment) => {
    setEditingComment(comment._id);
    setEditCommentText(comment.content);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingComment(null);
    setEditCommentText("");
  };

  // Update comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentText.trim()) return;

    try {
      await updateComment(commentId, editCommentText, session.accessToken);

      // Update UI
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: editCommentText }
            : comment
        )
      );
      cancelEdit();
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId, session.accessToken);

    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Toggle like on comment
  const handleLikeComment = async (commentId) => {
    try {
      // Optimistically update UI
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            const wasLiked = comment.isLiked;
            return {
              ...comment,
              isLiked: !wasLiked,
              likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          return comment;
        })
      );

      // Make API call
      if (comments.find((c) => c._id === commentId).isLiked) {
        await apiRequest(`/api/v1/comments/${commentId}/unlike`, {
          method: "POST",
        });
      } else {
        await apiRequest(`/api/v1/comments/${commentId}/like`, {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
      // Revert UI on error
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            };
          }
          return comment;
        })
      );
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const secondsAgo = Math.floor((now - date) / 1000);

    if (secondsAgo < 60) return `${secondsAgo} seconds ago`;
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minutes ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hours ago`;
    if (secondsAgo < 2592000) return `${Math.floor(secondsAgo / 86400)} days ago`;
    if (secondsAgo < 31536000) return `${Math.floor(secondsAgo / 2592000)} months ago`;
    return `${Math.floor(secondsAgo / 31536000)} years ago`;
  };

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count;
  };

  // Formate subscribers count
  const formatSubscribersCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
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
      {isShareMenuOpen && <div ref={shareMenuRef}><ShareMenu className="absolute top-30 z-10" /></div>}
      {isSaveMenuOpen && <div ref={saveMenuRef}><SaveMenu videoId={video._id} /></div>}
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
                  {formatViewCount(video.views || 0)} views •{" "}
                  {formatTimeAgo(video.createdAt)}
                </div>

                <div className="flex items-center gap-3 mt-2 sm:mt-0">
                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${
                      isLiked
                        ? "bg-[#272727] text-red-500"
                        : "hover:bg-[#272727] text-gray-300"
                    }`}
                  >
                    <FiThumbsUp className="text-lg" />
                    <span>{formatViewCount(likeCount)}</span>
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={handleDislike}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                      isDisliked
                        ? "bg-[#272727] text-blue-500"
                        : "hover:bg-[#272727] text-gray-300"
                    }`}
                  >
                    <FiThumbsDown className="text-lg" />
                  </button>

                  {/* Share Button */}
                  <div ref={shareBtnRef} onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} className="flex cursor-pointer items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#272727] text-gray-300">
                    <FiShare2 className="text-lg" />
                    <span>Share</span>
                  </div>
                  
                  {/* Save Button */}
                  <button ref={saveBtnRef} onClick={() => setIsSaveMenuOpen(!isSaveMenuOpen)} className="flex mr-1.5 items-center gap-1 px-3 py-1.5 rounded-full hover:bg-[#272727] text-gray-300">
                    <FiSave className="text-lg" />
                    <span>Save</span>
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
                    <p className="text-gray-400 text-sm">{formatSubscribersCount(subscribersCount)} subcribers </p>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  className={`px-4 py-2 rounded-full font-medium ${
                    isSubscribed
                      ? "bg-[#303030] text-white"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </div>

              {/* Video Description */}
              <div
                ref={descriptionRef}
                className="bg-[#181818] mt-1 rounded-lg p-4 overflow-hidden transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: showAllDescription
                    ? `${descriptionHeight}px`
                    : "96px",
                }}
              >
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <span>{formatViewCount(video.views || 0)} views</span>
                  <span className="mx-2">•</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                <p className="whitespace-pre-line">{video.description}</p>
              </div>

              {descriptionHeight > 96 && (
                <button
                  onClick={() => setShowAllDescription(!showAllDescription)}
                  className="pl-2.5 cursor-pointer mt-1 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  {showAllDescription ? "Show less" : "Show more"}
                </button>
              )}

              {/* Comments Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    {totalComments} Comments
                  </h2>
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
                        className={`absolute right-2 bottom-2 cursor-pointer ${
                          newComment.trim() ? "text-white" : "text-gray-600"
                        }`}
                      >
                        <FiSend />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
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
                          <h4 className="font-medium">
                            {comment.owner?.username}
                          </h4>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>

                        {editingComment === comment._id ? (
                          <div className="mt-1">
                            <textarea
                              value={editCommentText}
                              onChange={(e) =>
                                setEditCommentText(e.target.value)
                              }
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
                          <div className="flex items-center justify-between">
                            <p className="mt-1">{comment.content}</p>
                            <div className="flex items-center gap-4">

                              {/* Comment owner actions */}
                              {comment.owner?._id === session.user?.id && (
                                <div className="flex gap-3 ml-auto">
                                  <button
                                    onClick={() => startEditComment(comment)}
                                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                                  >
                                    <FiEdit2 size={14} /> Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComment(comment._id)
                                    }
                                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                                  >
                                    <FiTrash2 size={14} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
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
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded ${
                          currentPage === 1
                            ? "bg-[#303030] text-gray-500"
                            : "bg-[#272727] hover:bg-[#3a3a3a]"
                        }`}
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, Math.ceil(totalComments / 10)) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-4 py-2 rounded ${
                                currentPage === page
                                  ? "bg-red-600"
                                  : "bg-[#272727] hover:bg-[#3a3a3a]"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(Math.ceil(totalComments / 10), prev + 1)
                          )
                        }
                        disabled={currentPage === Math.ceil(totalComments / 10)}
                        className={`px-4 py-2 rounded ${
                          currentPage === Math.ceil(totalComments / 10)
                            ? "bg-[#303030] text-gray-500"
                            : "bg-[#272727] hover:bg-[#3a3a3a]"
                        }`}
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
                  <div
                    key={i}
                    className="flex gap-3 cursor-pointer hover:bg-[#181818] p-2 rounded-lg transition-colors"
                  >
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
                      <h4 className="font-medium line-clamp-2">
                        How to Build a YouTube Clone with Next.js
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Web Dev Simplified
                      </p>
                      <div className="text-xs text-gray-500 mt-1">
                        250K views • 2 days ago
                      </div>
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