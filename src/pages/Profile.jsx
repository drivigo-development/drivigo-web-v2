import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { supabase } from '../utils/supabaseClient';
import { Pencil, Save, X, Award, Book, Clock, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    address: '',
    emergency_contact: '',
    preferred_schedule: '',
    learning_goals: '',
    teaching_experience: '',
    certifications: '',
    specialties: ''
  });
  const [lessons, setLessons] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLessons();
      fetchAchievements();
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
        bio: data.bio || '',
        phone: data.phone || '',
        address: data.address || '',
        emergency_contact: data.emergency_contact || '',
        preferred_schedule: data.preferred_schedule || '',
        learning_goals: data.learning_goals || '',
        teaching_experience: data.teaching_experience || '',
        certifications: data.certifications || '',
        specialties: data.specialties || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
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
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-white text-primary-700 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-primary-50 transition-colors"
              >
                <Pencil size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Profile</h2>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center space-x-1 hover:bg-gray-300 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center space-x-1 hover:bg-primary-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergency_contact"
                    value={formData.emergency_contact}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preferred Schedule</label>
                  <input
                    type="text"
                    name="preferred_schedule"
                    value={formData.preferred_schedule}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Weekends, Evenings"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  ></textarea>
                </div>
                {(profile.role || user.user_metadata?.role) === 'learner' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Goals</label>
                    <textarea
                      name="learning_goals"
                      value={formData.learning_goals}
                      onChange={handleChange}
                      rows="3"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="What do you want to achieve with your driving lessons?"
                    ></textarea>
                  </div>
                )}
                
                {(profile.role || user.user_metadata?.role) === 'instructor' && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teaching Experience</label>
                      <textarea
                        name="teaching_experience"
                        value={formData.teaching_experience}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Describe your teaching experience and background"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certifications</label>
                      <textarea
                        name="certifications"
                        value={formData.certifications}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="List your relevant certifications"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specialties</label>
                      <textarea
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleChange}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="What are your teaching specialties?"
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Profile Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h3>
                    <div className="mt-2 space-y-2">
                      <p className="text-gray-800 dark:text-white"><span className="font-medium">Email:</span> {user.email}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-medium">Phone:</span> {profile.phone || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-medium">Address:</span> {profile.address || 'Not provided'}</p>
                      <p className="text-gray-800 dark:text-white"><span className="font-medium">Emergency Contact:</span> {profile.emergency_contact || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {(profile.role || user.user_metadata?.role) === 'learner' ? (
                      <>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Learning Preferences</h3>
                        <div className="mt-2 space-y-2">
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Preferred Schedule:</span> {profile.preferred_schedule || 'Not specified'}</p>
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Learning Goals:</span></p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.learning_goals || 'No learning goals specified'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor Information</h3>
                        <div className="mt-2 space-y-2">
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Preferred Schedule:</span> {profile.preferred_schedule || 'Not specified'}</p>
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Teaching Experience:</span></p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.teaching_experience || 'No experience details provided'}</p>
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Certifications:</span></p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.certifications || 'No certifications listed'}</p>
                          <p className="text-gray-800 dark:text-white"><span className="font-medium">Specialties:</span></p>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">{profile.specialties || 'No specialties listed'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Lessons */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {(profile.role || user.user_metadata?.role) === 'instructor' ? 'Upcoming Classes to Teach' : 'Upcoming Lessons'}
                </h2>
                {lessons.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.slice(0, 3).map((lesson) => (
                      <div key={lesson.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar size={18} className="text-primary-600" />
                            <span className="font-medium">{new Date(lesson.scheduled_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock size={18} className="text-primary-600" />
                            <span>{lesson.start_time} - {lesson.end_time}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">{lesson.description || 'No description'}</p>
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                          {(profile.role || user.user_metadata?.role) === 'instructor' ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Student: {lesson.learner_name}</p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Instructor: {lesson.instructor_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    {(profile.role || user.user_metadata?.role) === 'instructor' 
                      ? 'No upcoming classes to teach.' 
                      : 'No upcoming lessons scheduled.'}
                  </p>
                )}
                {lessons.length > 3 && (
                  <div className="mt-4 text-center">
                    <button className="text-primary-600 hover:text-primary-800 font-medium">View All Lessons</button>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Achievements</h2>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-3">
                          <Award size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white">{achievement.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(achievement.earned_date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Award size={48} className="mx-auto text-gray-300 dark:text-gray-500" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Complete lessons to earn achievements!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;