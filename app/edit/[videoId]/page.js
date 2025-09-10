"use client";
import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiSave, FiArrowLeft, FiImage, FiVideo } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

const EditVideoDetails = ({ params }) => {
  const { videoId } = React.use(params);
  const router = useRouter();
  
  const [formData, setFormData] = useState({});
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const { data: session } = useSession();

  // Fetch video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos/${videoId}`,{
          method: 'GET',
        });

        if(!response.ok) {
          throw new Error('Failed to fetch video details');
        }

        const data = await response.json();
        setFormData(data.data);
        setThumbnailPreview(data.data.thumbnail); // Set initial thumbnail preview
        setLoading(false);
      } catch (error) {
        console.error('Error fetching video details:', error);
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setNewThumbnail(null);
    setThumbnailPreview(formData.thumbnail);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (newThumbnail) {
        formDataToSend.append('thumbnail', newThumbnail);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URI}/api/v1/videos/${videoId}`, {
        method: 'PATCH',
        body: formDataToSend,
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        // Redirect back to dashboard on success
        router.push('/dashboard');
      } else {
        console.error('Failed to update video:', await response.json());
      }
    } catch (error) {
      console.error('Error updating video:', error);
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-[#303030] py-4 px-4 sm:px-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-2 sm:mr-4 p-2 rounded-full hover:bg-[#202020] transition-colors"
            >
              <FiArrowLeft className="text-xl" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold">Edit Video Details</h1>
          </div>
          <button
            type='submit'
            onClick={handleSubmit}
            disabled={saving}
            className={`flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              saving ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {saving ? (
              <>
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5 sm:mr-2"></div>
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Save</span>
              </>
            ) : (
              <>
                <FiSave className="mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Video Preview (Larger) */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <div className="bg-[#181818] rounded-xl p-4 sm:p-6">
              <h2 className="text-lg font-medium mb-4">Video Preview</h2>
              
              <div className="aspect-video bg-[#202020] rounded-lg overflow-hidden mb-4 relative">
                {formData.videoFile ? (
                  <video
                    src={formData.videoFile}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#303030] p-4">
                    <FiVideo className="text-3xl sm:text-4xl text-gray-500 mb-2" />
                    <p className="text-gray-400 text-sm sm:text-base text-center">Video not available</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <p className="text-sm text-gray-400 break-all">Video ID: {videoId}</p>
                <p className="text-sm text-gray-400">
                  {formData.duration ? `Duration: ${formData.duration}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="bg-[#181818] rounded-xl p-4 sm:p-6 xl:sticky xl:top-24">
              <h2 className="text-lg font-medium mb-4 sm:mb-6">Video Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail</label>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="w-full h-32 sm:h-40 bg-[#202020] rounded-md overflow-hidden relative">
                      {thumbnailPreview ? (
                        <Image
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#303030]">
                          <FiImage className="text-xl sm:text-2xl text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center cursor-pointer transition-colors ${
                          errors.thumbnail ? 'border-red-500' : 'border-[#303030] hover:border-red-500'
                        }`}
                        onClick={() => document.getElementById('thumbnail-upload').click()}
                      >
                        <FiUpload className="mx-auto text-lg sm:text-xl text-gray-400 mb-1 sm:mb-2" />
                        <p className="text-xs sm:text-sm">Upload new thumbnail</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, or GIF (max 5MB)</p>
                        <input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                      </div>
                      
                      {newThumbnail && (
                        <div className="flex items-center mt-2 sm:mt-3">
                          <span className="text-xs sm:text-sm text-gray-400 truncate flex-grow">
                            {newThumbnail.name}
                          </span>
                          <button
                            type="button"
                            onClick={removeThumbnail}
                            className="ml-2 p-1 text-gray-400 hover:text-white rounded-full hover:bg-[#303030]"
                          >
                            <FiX className="text-sm sm:text-base" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.thumbnail && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.thumbnail}</p>
                  )}
                </div>

                {/* Title Input */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    className={`w-full bg-[#202020] border rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 focus:border-red-500 focus:outline-none transition-colors text-sm sm:text-base ${
                      errors.title ? 'border-red-500' : 'border-[#303030]'
                    }`}
                    placeholder="Add a title that describes your video"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {(formData.title?.length || 0)}/100 characters
                  </p>
                </div>

                {/* Description Input */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full bg-[#202020] border rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 focus:border-red-500 focus:outline-none transition-colors text-sm sm:text-base ${
                      errors.description ? 'border-red-500' : 'border-[#303030]'
                    }`}
                    placeholder="Tell viewers about your video"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {(formData.description?.length || 0)}/5000 characters
                  </p>
                </div>
                
                {/* Mobile Save Button (sticky at bottom) */}
                <div className="block xl:hidden sticky bottom-0 py-3 bg-[#181818] border-t border-[#303030] -mx-4 -mb-4 px-4">
                  <button
                    type='submit'
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`w-full flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                      saving ? 'bg-red-800 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVideoDetails;