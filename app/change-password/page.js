"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

const ChangePasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const togglePassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    try {
      const response = await apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      console.log('Password changed successfully:', response); // Todo: add notification on side when password is changed
    } catch (error) {
      setError('Failed to change password. Please try again later.');
      console.error('Password change error:', error);
      return;
    }
    router.push('/'); // Redirect after successful change
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white mb-6 self-start transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
        
        <div className="max-w-md w-full mx-auto my-auto">
          <div className="text-center mb-8">
            <div className="mx-auto bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <FiLock className="text-2xl" />
            </div>
            <h1 className="text-2xl font-bold">Change Password</h1>
            <p className="text-gray-400 mt-2">Secure your account with a new password</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#181818] rounded-xl p-6 shadow-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mb-5">
              <label htmlFor="oldPassword" className="block text-sm font-medium mb-2 text-gray-400">
                Old Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.old ? "text" : "password"}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#303030] rounded-lg py-3 px-4 pr-10 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Enter your old password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword('old')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword.old ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2 text-gray-400">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#303030] rounded-lg py-3 px-4 pr-10 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Create a new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-400">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#121212] border border-[#303030] rounded-lg py-3 px-4 pr-10 focus:border-red-500 focus:outline-none transition-colors"
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Update Password
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Make sure it&apos;s at least 8 characters including a number and a special character</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;