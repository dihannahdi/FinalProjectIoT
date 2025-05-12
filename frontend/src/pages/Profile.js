import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getMyScores } from '../services/gameService';
import { FaUser, FaTrophy, FaKey, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
  const [profileData, setProfileData] = useState({
    name: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    scores: true
  });
  const [errors, setErrors] = useState({
    profile: {},
    password: {}
  });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.name || ''
      });
      
      // Fetch user's scores
      fetchUserScores();
    }
  }, [currentUser]);
  
  const fetchUserScores = async () => {
    try {
      setLoading(prev => ({ ...prev, scores: true }));
      const response = await getMyScores();
      setScores(response.data.scores);
      setLoading(prev => ({ ...prev, scores: false }));
    } catch (error) {
      console.error('Error fetching user scores:', error);
      setLoading(prev => ({ ...prev, scores: false }));
      toast.error('Failed to load your scores');
    }
  };
  
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (errors.profile[e.target.name]) {
      setErrors({
        ...errors,
        profile: {
          ...errors.profile,
          [e.target.name]: ''
        }
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user types
    if (errors.password[e.target.name]) {
      setErrors({
        ...errors,
        password: {
          ...errors.password,
          [e.target.name]: ''
        }
      });
    }
  };
  
  const validateProfile = () => {
    const newErrors = {};
    
    if (!profileData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors({
      ...errors,
      profile: newErrors
    });
    
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePassword = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors({
      ...errors,
      password: newErrors
    });
    
    return Object.keys(newErrors).length === 0;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }
    
    setLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const success = await updateProfile(profileData);
      
      if (success) {
        toast.success('Profile updated successfully');
      }
      
      setLoading(prev => ({ ...prev, profile: false }));
    } catch (error) {
      console.error('Update profile error:', error);
      setLoading(prev => ({ ...prev, profile: false }));
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    setLoading(prev => ({ ...prev, password: true }));
    
    try {
      const success = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (success) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      
      setLoading(prev => ({ ...prev, password: false }));
    } catch (error) {
      console.error('Update password error:', error);
      setLoading(prev => ({ ...prev, password: false }));
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <FaUser className="mr-2 text-blue-500" />
          Profile
        </h1>
        
        <div className="mb-6">
          {/* Profile Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUser className="inline mr-2" />
              Personal Info
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'password'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('password')}
            >
              <FaKey className="inline mr-2" />
              Change Password
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'scores'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('scores')}
            >
              <FaTrophy className="inline mr-2" />
              My Scores
            </button>
          </div>
          
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="pt-6">
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-4">
                  <label htmlFor="name" className="block mb-2 font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className={`form-control ${errors.profile.name ? 'border-red-500' : ''}`}
                    disabled={loading.profile}
                  />
                  {errors.profile.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.profile.name}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Email</label>
                  <div className="form-control bg-gray-100">{currentUser?.email}</div>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 font-medium">High Score</label>
                  <div className="form-control bg-gray-100">{currentUser?.highScore || 0}</div>
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={loading.profile}
                >
                  {loading.profile ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Password Tab Content */}
          {activeTab === 'password' && (
            <div className="pt-6">
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block mb-2 font-medium">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.password.currentPassword ? 'border-red-500' : ''}`}
                    disabled={loading.password}
                  />
                  {errors.password.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.currentPassword}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block mb-2 font-medium">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.password.newPassword ? 'border-red-500' : ''}`}
                    disabled={loading.password}
                  />
                  {errors.password.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.newPassword}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block mb-2 font-medium">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`form-control ${errors.password.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={loading.password}
                  />
                  {errors.password.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.confirmPassword}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary flex items-center"
                  disabled={loading.password}
                >
                  {loading.password ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaKey className="mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* Scores Tab Content */}
          {activeTab === 'scores' && (
            <div className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Game History</h2>
                <button
                  onClick={fetchUserScores}
                  className="btn btn-secondary text-sm"
                  disabled={loading.scores}
                >
                  {loading.scores ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {loading.scores ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : scores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-center">Score</th>
                        <th className="px-4 py-2 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scores.map((score, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 text-center font-semibold">
                            {score.score}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-500">
                            {new Date(score.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">You haven't played any games yet.</p>
                  <a href="/game" className="btn btn-primary mt-4 inline-block">
                    Play Now
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 