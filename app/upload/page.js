"use client";
import { useState, useRef, useEffect } from 'react';
import { FiUpload, FiVideo, FiImage, FiX, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';

const Uploader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnailFile: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setFormData(prev => ({
          ...prev,
          videoFile: file
        }));
      } else if (file.type.startsWith('image/')) {
        setFormData(prev => ({
          ...prev,
          thumbnailFile: file
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.videoFile) newErrors.videoFile = 'Video file is required';
    if (!formData.thumbnailFile) newErrors.thumbnailFile = 'Thumbnail is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session){
      router.push("/login")
    }
    if (!validateForm()) return;
    
    setIsUploading(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('videoFile', formData.videoFile);
    data.append('thumbnail', formData.thumbnailFile);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${session.accessToken}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
        onDownloadProgress: (progressEvent) => {
          const speed = Math.round(progressEvent.loaded / (progressEvent.timeStamp / 1000) / 1024);
          setUploadSpeed(speed);
        }
      });
      console.log("response of uploading video is: ", response)
      if (response.status < 400) {
        setIsSuccess(true);
      }
      setIsUploading(false);

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (type) => {
    setFormData(prev => ({
      ...prev,
      [type]: null
    }));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a] text-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Upload Video
          </h1>
          <p className="text-gray-400 mt-2">Share your content with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Video File Upload */}
          <div className="bg-[#181818] rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-red-900/10">
            <label className="text-sm font-medium mb-4 flex items-center">
              <FiVideo className="mr-2 text-red-500" />
              Video File
            </label>
            {!formData.videoFile ? (
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragActive 
                    ? 'border-red-500 bg-red-500/10 scale-[1.02] shadow-lg' 
                    : 'border-[#404040] hover:border-red-500'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => videoRef.current?.click()}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <FiVideo className="text-3xl text-red-500" />
                  </div>
                </div>
                <p className="font-medium text-lg">Drag and drop your video file</p>
                <p className="text-gray-400 text-sm mt-2">or click to browse</p>
                <p className="text-xs text-gray-500 mt-4">MP4, WebM, or MOV (max 1GB)</p>
                <input
                  ref={videoRef}
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-[#303030] rounded-xl p-4 flex items-center justify-between bg-[#202020] animate-fadeIn">
                <div className="flex items-center">
                  <div className="p-3 bg-red-500/10 rounded-lg mr-4">
                    <FiVideo className="text-xl text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">{formData.videoFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile('videoFile')}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#303030] rounded-lg transition-colors"
                  aria-label="Remove video"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
            {errors.videoFile && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <FiX className="mr-1" /> {errors.videoFile}
              </p>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div className="bg-[#181818] rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-red-900/10">
            <label className="text-sm font-medium mb-4 flex items-center">
              <FiImage className="mr-2 text-red-500" />
              Thumbnail
            </label>
            {!formData.thumbnailFile ? (
              <div 
                className={`border-2 border-dashed border-[#404040] rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-red-500 hover:scale-[1.01] ${
                  dragActive 
                    ? 'border-red-500 bg-red-500/10 scale-[1.02] shadow-lg' 
                    : 'border-[#404040] hover:border-red-500'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => thumbnailRef.current?.click()}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-500/10 rounded-full">
                    <FiImage className="text-3xl text-red-500" />
                  </div>
                </div>
                <p className="font-medium text-lg">Select a thumbnail</p>
                <p className="text-gray-400 text-sm mt-2">or drag and drop</p>
                <p className="text-xs text-gray-500 mt-4">JPG, PNG, or GIF (max 10MB)</p>
                <input
                  ref={thumbnailRef}
                  type="file"
                  name="thumbnailFile"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="border border-[#303030] rounded-xl p-4 flex items-center justify-between bg-[#202020] animate-fadeIn">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-[#181818] rounded-md overflow-hidden mr-4 border border-[#303030]">
                    <Image
                      width={100}
                      height={100}
                      src={URL.createObjectURL(formData.thumbnailFile)} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{formData.thumbnailFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(formData.thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => removeFile('thumbnailFile')}
                    className="p-2 text-gray-400 hover:text-white hover:bg-[#303030] rounded-lg transition-colors"
                    aria-label="Remove thumbnail"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}
            {errors.thumbnailFile && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <FiX className="mr-1" /> {errors.thumbnailFile}
              </p>
            )}
          </div>

          {/* Title Input */}
          <div className="bg-[#181818] rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-red-900/10">
            <label htmlFor="title" className="text-sm font-medium mb-4 flex items-center">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Add a title that describes your video"
              className="w-full bg-[#202020] border border-[#303030] rounded-lg py-3 px-4 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 focus:outline-none transition-all duration-300"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <FiX className="mr-1" /> {errors.title}
              </p>
            )}
          </div>

          {/* Description Input */}
          <div className="bg-[#181818] rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-red-900/10">
            <label htmlFor="description" className="text-sm font-medium mb-4 flex items-center">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell viewers about your video"
              className="w-full bg-[#202020] border border-[#303030] rounded-lg py-3 px-4 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 focus:outline-none transition-all duration-300"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="bg-[#181818] rounded-xl p-6 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium flex items-center">
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </span>
                <span className="text-sm text-gray-400">{uploadProgress}% {uploadSpeed}KB/s</span>
              </div>
              <div className="w-full bg-[#303030] rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-800 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Please don&apos;t close this window while uploading
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              disabled={isUploading}
              type="button"
              onClick={() => router.back()}
              className="px-6 disabled:opacity-50 py-3 bg-[#303030] rounded-lg hover:bg-[#404040] transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`flex items-center justify-center px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 ${
                isUploading 
                  ? 'bg-red-800 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/30'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="mr-2" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success Message */}
        {isSuccess && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-[#181818] to-[#222222] rounded-xl p-8 max-w-md w-full mx-4 text-center animate-scaleIn">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <FiCheck className="text-4xl text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Upload Complete!</h3>
              <p className="text-gray-400 mb-6">Your video has been successfully uploaded and is processing.</p>
              <div className="w-full bg-[#303030] rounded-full h-1.5 mb-6">
                <div className="bg-green-500 h-1.5 rounded-full animate-progress"></div>
              </div>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-medium transition-colors transform hover:-translate-y-0.5"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out;
        }
      `}</style>
    </div>
    </>
  );
};

export default Uploader;