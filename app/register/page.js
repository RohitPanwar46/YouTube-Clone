"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { uploadFiles, API_ENDPOINTS } from "../lib/api";
import AvatarCropper from "@/components/AvatarCropper.jsx";
import Image from "next/image";

const RegisterPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullname: "",
    username: "",
    avatar: null, // will store Blob (cropped) or File
    coverImage: null,
  });

  // local UI states for cropping
  const [selectedImage, setSelectedImage] = useState(null); // blob URL for cropper preview
  const [showCropper, setShowCropper] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // input changes for text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // when user selects a file from file input — open cropper using object URL
  const onFileChange = (e, field = "avatar") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // revoke old if any
    if (selectedImage) URL.revokeObjectURL(selectedImage);

    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setShowCropper(true);
  };

  // This will be called by AvatarCropper after user clicks "Save"
  // croppedBlob is a Blob (image/png)
  const handleCropComplete = (croppedBlob) => {
    // store the Blob in formData.avatar so handleSubmit will send it
    setFormData((prev) => ({
      ...prev,
      avatar: croppedBlob,
    }));

    // cleanup preview url
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
    setShowCropper(false);
  };

  // Cover image unchanged behavior (keeps original)
  const handleFileChange = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // store as File for coverImage (no crop)
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!formData.fullname) newErrors.fullname = "Full name is required";

    if (!formData.username) newErrors.username = "Username is required";
    else if (formData.username.length < 3) newErrors.username = "Username must be at least 3 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("fullName", formData.fullname);
      formDataToSend.append("username", formData.username);

      // Avatar may be a Blob (cropped) or a File if you later change behavior — handle both
      if (formData.avatar) {
        // if Blob -> append with filename, if File -> append directly
        if (formData.avatar instanceof Blob && !(formData.avatar instanceof File)) {
          formDataToSend.append("avatar", formData.avatar, "avatar.png");
        } else {
          formDataToSend.append("avatar", formData.avatar);
        }
      }

      if (formData.coverImage) {
        formDataToSend.append("coverImage", formData.coverImage);
      }

      const data = await uploadFiles(API_ENDPOINTS.REGISTER, formDataToSend);

      alert("Registration successful! Please login.");
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({ submit: error.message || "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // small preview for cropped avatar (shows when formData.avatar exists)
  const avatarPreviewUrl = formData.avatar ? (formData.avatar instanceof Blob ? URL.createObjectURL(formData.avatar) : null) : null;

  // revoke preview when component unmounts or avatar changes
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
      if (selectedImage) URL.revokeObjectURL(selectedImage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center text-3xl font-bold text-red-600 mb-2">
            <svg className="w-10 h-10 mr-2" fill="currentColor" viewBox="0 0 576 512">
              <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
            </svg>
            YouTube
          </Link>
          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="text-gray-400 mt-2">Join YouTube to share your videos</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input id="fullname" name="fullname" type="text" required value={formData.fullname} onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-[#181818] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.fullname ? 'border-red-500' : 'border-[#303030]'}`}
                placeholder="Enter your full name" />
              {errors.fullname && (<p className="mt-1 text-sm text-red-500">{errors.fullname}</p>)}
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input id="username" name="username" type="text" required value={formData.username} onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-[#181818] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.username ? 'border-red-500' : 'border-[#303030]'}`}
                placeholder="Choose a username" />
              {errors.username && (<p className="mt-1 text-sm text-red-500">{errors.username}</p>)}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-[#181818] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-[#303030]'}`}
                placeholder="Enter your email" />
              {errors.email && (<p className="mt-1 text-sm text-red-500">{errors.email}</p>)}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-[#181818] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-[#303030]'}`}
                placeholder="Create a password" />
              {errors.password && (<p className="mt-1 text-sm text-red-500">{errors.password}</p>)}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleInputChange}
                className={`w-full px-3 py-3 bg-[#181818] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-[#303030]'}`}
                placeholder="Confirm your password" />
              {errors.confirmPassword && (<p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>)}
            </div>

            {/* Avatar Upload */}
            {!formData.avatar && (
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                <input id="avatar" name="avatar" type="file" required accept="image/*" onChange={onFileChange}
                  className="w-full px-3 py-3 bg-[#181818] border border-[#303030] rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" />
              </div>
            )}

            {/* show preview if cropped avatar exists */}
            {formData.avatar && (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                  <Image width={0} height={0} sizes="100vw" style={{width:"100%",height: "100%"}} src={avatarPreviewUrl} alt="avatar preview" className="w-full h-full object-cover" />
                </div>
                <button type="button" className="text-sm text-red-400" onClick={() => setFormData(prev => ({ ...prev, avatar: null }))}>
                  Change
                </button>
              </div>
            )}

            {/* show cropper while selecting */}
            {showCropper && selectedImage && (
              <AvatarCropper imageSrc={selectedImage} onComplete={handleCropComplete} onCancel={() => { setShowCropper(false); URL.revokeObjectURL(selectedImage); setSelectedImage(null); }} />
            )}

            {/* Cover Image Upload */}
            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-2">Cover Image (Optional)</label>
              <input id="coverImage" name="coverImage" type="file" accept="image/*" onChange={(e) => handleFileChange(e, "coverImage")}
                className="w-full px-3 py-3 bg-[#181818] border border-[#303030] rounded-lg text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700" />
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (<div className="text-center"><p className="text-sm text-red-500">{errors.submit}</p></div>)}

          {/* Submit Button */}
          <div>
            <button type="submit" disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              {isLoading ? (<div className="flex items-center"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating Account...</div>) : ('Create Account')}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-400">Already have an account?{' '}
              <Link href="/login" className="font-medium text-red-500 hover:text-red-400 transition-colors duration-200">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
