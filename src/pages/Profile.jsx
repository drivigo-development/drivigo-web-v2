import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import { Pencil, Save, X, Award, Book, Clock, Calendar, User } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Loader from '../components/Loader';
import Instructor_Details from '../components/Instructor_Details';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    role: '',
    gender: '',
    phone: '',
    email: '',
    profile_img: ''
  });

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      
      // Get user role from auth metadata
      const role = user.user_metadata?.role || 'user';
      setUserRole(role);
      console.log('User role from auth metadata:', role);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        name: data.name || '',
        age: data.age || '',
        role: data.role || '',
        gender: data.gender || '',
        phone: data.phone || '',
        email: data.email || user.email || '',
        profile_img: data.profile_img || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const userRole = profile?.role || user.user_metadata?.role;
      let query;
      
      // This is a placeholder - you would need to create this table
      if (userRole === 'instructor') {
        // For instructors, get lessons they're teaching
        query = supabase
          .from('lessons')
          .select('*')
          .eq('instructor_id', user.id)
          .order('scheduled_date', { ascending: false });
      } else {
        // For learners, get lessons they're taking
        query = supabase
          .from('lessons')
          .select('*')
          .eq('learner_id', user.id)
          .order('scheduled_date', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const fetchAchievements = async () => {
    try {
      // This is a placeholder - you would need to create this table
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openEditDialog = () => {
    setDialogOpen(true);
  };

  const closeEditDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert age to number if provided
      const updatedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age, 10) : null
      };

      const { error } = await supabase
        .from('users')
        .update(updatedData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setDialogOpen(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Profile not found</h1>
        <p className="mt-2">There was an error loading your profile information.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg lg:shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary-500 p-6 text-white">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white">
                {profile.profile_img ? (
                  <img 
                    src={profile.profile_img} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 text-3xl font-bold">
                    {profile.name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1 border-2 border-white">
                <Award size={20} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl text-black font-bold">{profile.name}</h1>
              <p className="text-black">{user.email}</p>
              <div className="mt-2 inline-block bg-primary-700 px-3 py-1 rounded-full text-sm">
                {profile.role || user.user_metadata?.role || 'User'}
              </div>

            </div>
            <button
              onClick={openEditDialog}
              className="bg-white text-primary-700 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-primary-50 transition-colors"
            >
              <Pencil size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:p-6 pt-3">
            <div className="space-y-8">
              {/* Profile Info */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="mt-2 space-y-2">
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Name:</span> {profile.name || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Email:</span> {profile.email || user.email}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Age:</span> {profile.age || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Gender:</span> {profile.gender || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Phone:</span> {profile.phone || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-bold">Role:</span> {profile.role || userRole || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Instructor Details Component - Only shown for instructors */}
              {userRole === 'instructor' && (
                <div className="mb-2">
                  <Instructor_Details instructorId={user?.id} />
                </div>
              )}
      
              {/* Edit Profile Dialog */}
              <Dialog open={dialogOpen} onClose={closeEditDialog} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                      Edit Profile
                      <button onClick={closeEditDialog} className="text-gray-400 hover:text-gray-500">
                        <X size={20} />
                      </button>
                    </DialogTitle>
                    
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          min="0"
                          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </DialogPanel>
                </div>
              </Dialog>  
            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;